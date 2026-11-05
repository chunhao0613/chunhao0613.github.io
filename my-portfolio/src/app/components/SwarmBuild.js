"use client";

// 「游標群組建構」效果，靈感來自多人協作設計工具。
//
// 兩個階段：
// 1. 開場（每個分頁工作階段只播一次）：首頁區塊先隱藏，一群以 AI 協作角色
//    命名的游標同時出發，各自拉框、定尺寸，內容在框內淡入，最後游標收攏淡出。
// 2. 捲動：內容不隱藏、不等待。區塊進場時，若有空閒游標就順手幫它畫一個
//    選取框（附尺寸與角點），畫完就消失；忙不過來就略過，不會補畫舊的。
//
// 所有游標與框都放在「頁面座標」圖層，捲動時黏在內容上。
// 手機、減少動態效果的設定下完全不啟用。

import { useEffect } from "react";

const AGENTS = [
  { name: "鮭魚", color: "#F24E1E" },
  { name: "Planner", color: "#A259FF" },
  { name: "Architect", color: "#0D99FF" },
  { name: "Coder", color: "#0ACF83" },
  { name: "Tester", color: "#FFC700" },
  { name: "Reviewer", color: "#E8467C" },
];

const INTRO_KEY = "swarm-intro-done";
const MAX_SCROLL_AGENTS = 2; // 捲動階段同時最多幾個游標在畫

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 只把「看得到的東西」算進範圍：文字、媒體，以及有邊框或背景的元素（卡片、按鈕）。
// 純排版用的外層容器常常是整列寬，算進來框會比內容寬很多。
function visibleBounds(el) {
  let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
  const add = (rc) => {
    if (!rc.width || !rc.height) return;
    l = Math.min(l, rc.left);
    t = Math.min(t, rc.top);
    r = Math.max(r, rc.right);
    b = Math.max(b, rc.bottom);
  };
  const range = document.createRange();
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.trim()) {
        range.selectNodeContents(node);
        add(range.getBoundingClientRect());
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const cs = getComputedStyle(node);
    if (cs.display === "none" || cs.visibility === "hidden") return;
    const tag = node.tagName;
    const boxed =
      parseFloat(cs.borderTopWidth) > 0 ||
      parseFloat(cs.borderLeftWidth) > 0 ||
      (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent") ||
      cs.backgroundImage !== "none";
    if (boxed || /^(IMG|SVG|VIDEO|CANVAS|svg)$/.test(tag)) {
      add(node.getBoundingClientRect());
      if (!boxed) return; // 媒體不用再往下找
    }
    node.childNodes.forEach(walk);
  };
  el.childNodes.forEach(walk);
  return l === Infinity ? el.getBoundingClientRect() : { left: l, top: t, width: r - l, height: b - t };
}

// 量內容「最後停下」的位置（頁面座標）：
// 暫停 Reveal 進場動畫的 translate／scale 再量，量完還原。
function measure(el) {
  const st = el.style;
  const saved = [st.transition, st.translate, st.scale, st.transform];
  st.transition = "none";
  st.translate = "none";
  st.scale = "none";
  st.transform = "none";
  const r = visibleBounds(el);
  [, st.translate, st.scale, st.transform] = saved;
  el.getBoundingClientRect();
  st.transition = saved[0];
  const pad = 8;
  return {
    left: r.left + window.scrollX - pad,
    top: r.top + window.scrollY - pad,
    width: r.width + pad * 2,
    height: r.height + pad * 2,
    w: Math.round(r.width),
    h: Math.round(r.height),
  };
}

export default function SwarmBuild() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || window.innerWidth < 768) return;

    let introDone = false;
    try {
      introDone = sessionStorage.getItem(INTRO_KEY) === "1";
    } catch {}

    const root = document.documentElement;
    const introTargets = [...document.querySelectorAll("#about [data-swarm]")];
    if (!introDone) root.classList.add("swarm-intro");
    const revealAll = () => {
      introTargets.forEach((el) => el.classList.add("swarm-built"));
      root.classList.remove("swarm-intro");
    };
    // 安全網：無論動畫發生什麼事，3 秒後首頁一定完整顯示
    const safety = setTimeout(revealAll, 3000);

    const layer = document.createElement("div");
    layer.className = "swarm-layer";
    layer.setAttribute("aria-hidden", "true");
    const world = document.createElement("div");
    world.className = "swarm-world";
    layer.appendChild(world);
    document.body.appendChild(layer);

    let alive = true;
    const follow = () => {
      if (!alive) return;
      world.style.transform = `translate3d(${-window.scrollX}px, ${-window.scrollY}px, 0)`;
      requestAnimationFrame(follow);
    };
    follow();

    // ---- 游標（頁面座標）
    const cursors = AGENTS.map((a) => {
      const el = document.createElement("div");
      el.className = "swarm-cursor";
      el.innerHTML = `<i style="--c:${a.color}"></i><span>${a.name}</span>`;
      world.appendChild(el);
      return { el, x: 0, y: 0, busy: false, color: a.color };
    });
    const place = (c) => {
      c.el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
    };
    const show = (c, on) => c.el.classList.toggle("on", on);

    const animate = (dur, fn) =>
      new Promise((res) => {
        const s = performance.now();
        const step = (n) => {
          if (!alive) return res();
          const k = Math.min(1, (n - s) / dur);
          fn(k);
          k < 1 ? requestAnimationFrame(step) : res();
        };
        requestAnimationFrame(step);
      });

    const fly = (c, x, y, dur) => {
      const sx = c.x, sy = c.y;
      return animate(dur, (k) => {
        const e = easeInOut(k);
        c.x = sx + (x - sx) * e;
        c.y = sy + (y - sy) * e;
        place(c);
      });
    };

    // 拉框：從左上拖到右下，尺寸標籤即時更新，完成後出現角點再淡出
    const draw = async (c, r, dur) => {
      const box = document.createElement("div");
      box.className = "swarm-box";
      box.style.left = `${r.left}px`;
      box.style.top = `${r.top}px`;
      box.style.setProperty("--c", c.color);
      box.innerHTML = `<b></b><b></b><b></b><b></b><span class="swarm-badge"></span>`;
      const badge = box.querySelector(".swarm-badge");
      world.appendChild(box);
      await animate(dur, (k) => {
        const e = easeOut(k);
        box.style.width = `${r.width * e}px`;
        box.style.height = `${r.height * e}px`;
        badge.textContent = `${Math.round(r.w * e)} × ${Math.round(r.h * e)}`;
        c.x = r.left + r.width * e;
        c.y = r.top + r.height * e;
        place(c);
      });
      box.classList.add("done");
      return box;
    };
    const dismiss = (box, delay) =>
      setTimeout(() => {
        box.classList.add("out");
        setTimeout(() => box.remove(), 500);
      }, delay);

    // ---- 第 1 階段：開場
    const runIntro = async () => {
      const cx = window.innerWidth / 2 + window.scrollX;
      const cy = window.innerHeight * 0.45 + window.scrollY;
      cursors.forEach((c, i) => {
        const a = (i / cursors.length) * Math.PI * 2;
        c.x = cx + Math.cos(a) * 26;
        c.y = cy + Math.sin(a) * 26;
        place(c);
        show(c, true);
      });
      await sleep(120);

      // 每個區塊分給一個游標；區塊比游標多時，同一個游標依序處理
      const lanes = cursors.map(() => []);
      introTargets.forEach((el, i) => lanes[i % cursors.length].push(el));
      await Promise.all(
        lanes.map(async (list, i) => {
          const c = cursors[i];
          await sleep(i * 70);
          for (const el of list) {
            const r = measure(el);
            await fly(c, r.left, r.top, 480);
            const box = await draw(c, r, 520);
            el.classList.add("swarm-built");
            dismiss(box, 450);
          }
        })
      );

      // 收攏到主角游標旁，一起淡出
      const lead = cursors[0];
      await Promise.all(cursors.map((c, i) => fly(c, lead.x + (i ? 14 : 0), lead.y + i * 3, 420)));
      cursors.forEach((c) => show(c, false));
      clearTimeout(safety);
      revealAll();
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
    };

    // ---- 第 2 階段：捲動時順手標註
    let active = 0;
    const annotate = async (el) => {
      const c = cursors.find((x) => !x.busy);
      if (!c || active >= MAX_SCROLL_AGENTS) return; // 忙不過來就略過
      c.busy = true;
      active++;
      const r = measure(el);
      c.x = r.left - 60;
      c.y = r.top - 40;
      place(c);
      show(c, true);
      await fly(c, r.left, r.top, 380);
      const box = await draw(c, r, 520);
      dismiss(box, 500);
      await sleep(250);
      show(c, false);
      await sleep(300);
      c.busy = false;
      active--;
    };

    let io;
    const startScroll = () => {
      io = new IntersectionObserver(
        (entries) =>
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            io.unobserve(en.target);
            annotate(en.target);
          }),
        { threshold: 0.4 }
      );
      document.querySelectorAll("[data-swarm]").forEach((el) => {
        if (!el.closest("#about")) io.observe(el);
      });
    };

    (introDone ? Promise.resolve(revealAll()) : runIntro()).then(() => alive && startScroll());

    return () => {
      alive = false;
      clearTimeout(safety);
      io?.disconnect();
      layer.remove();
      revealAll();
    };
  }, []);

  return null;
}
