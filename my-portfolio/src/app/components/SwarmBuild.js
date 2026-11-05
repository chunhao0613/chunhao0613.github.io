"use client";

// 「游標群組建構」效果，靈感來自多人協作設計工具：
// 一群游標把頁面一塊塊拉出來。每個元素在游標拖曳時，和選取框一起從左上角
// 放大進場，內容與游標保持一體。
//
// 粒度：
// - 有背景或邊框的元素（卡片、終端機、標籤、按鈕）是「容器」，先蓋。
// - 容器裡的標題、段落、媒體各自是一個任務，等容器蓋好才開始。
// - 純排版用的外層不算，直接往下找。
//
// 排程：游標池平行處理，挑「畫面內、依文件順序最前面、父容器已完成」的任務。
// 每個區塊進入畫面 1.8 秒後，沒蓋完的直接彈出，絕不讓內容卡住。
//
// 每個分頁工作階段只播一次；手機、減少動態效果時完全不啟用。
// 開場前的隱藏由 layout.js 的內嵌腳本在第一次繪製前處理，避免閃爍。

import { useEffect } from "react";

const DONE_KEY = "swarm-build-done";
const MAX_CURSORS = 24;
const BLOCK_DEADLINE = 1800;

const ARROW =
  "M3 2.2 L3 17.6 L7.1 13.7 L9.8 19.8 L12.6 18.6 L9.9 12.6 L15.6 12.6 Z";

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);

const isBoxed = (cs) =>
  parseFloat(cs.borderTopWidth) > 0 ||
  parseFloat(cs.borderLeftWidth) > 0 ||
  (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent") ||
  cs.backgroundImage !== "none";
const MEDIA = /^(IMG|VIDEO|CANVAS|svg|SVG)$/;

// 子節點是否全是文字或行內元素（也就是一段「文字區塊」）
function isTextBlock(el) {
  let hasText = false;
  for (const n of el.childNodes) {
    if (n.nodeType === Node.TEXT_NODE) {
      if (n.textContent.trim()) hasText = true;
      continue;
    }
    if (n.nodeType !== Node.ELEMENT_NODE) continue;
    if (n.tagName === "BR") continue;
    const d = getComputedStyle(n).display;
    if (!/^inline/.test(d)) return false;
    if (n.textContent.trim()) hasText = true;
  }
  return hasText;
}

// 把一個 Reveal 區塊拆成任務樹
function collectTasks(block) {
  const tasks = [];
  const walk = (el, parent) => {
    for (const child of el.children) {
      const cs = getComputedStyle(child);
      // 不看 visibility：開場前整個區塊是 hidden，子元素都會繼承
      if (cs.display === "none") continue;
      const r = child.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const media = MEDIA.test(child.tagName);
      const text = !media && isTextBlock(child);
      const boxed = isBoxed(cs);
      if (media || text) {
        tasks.push({ el: child, parent, kind: boxed || media ? "box" : "text" });
        continue;
      }
      if (boxed) {
        const t = { el: child, parent, kind: "box" };
        tasks.push(t);
        walk(child, t);
        continue;
      }
      walk(child, parent);
    }
  };
  walk(block, null);
  return tasks;
}

export default function SwarmBuild() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let done = false;
    try {
      done = sessionStorage.getItem(DONE_KEY) === "1";
    } catch {}
    if (reduce || window.innerWidth < 768 || done) {
      root.classList.remove("swarm-intro");
      return;
    }
    try {
      sessionStorage.setItem(DONE_KEY, "1");
    } catch {}

    root.classList.add("swarm-on");
    // 橫向捲動容器裡的區塊（例如文章卡片列）不套用：畫面外的卡片被容器裁掉，
    // 永遠不會「進入畫面」，會一直藏著
    const inHScroller = (el) => {
      for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
        const ox = getComputedStyle(n).overflowX;
        if ((ox === "auto" || ox === "scroll") && n.scrollWidth > n.clientWidth) return true;
      }
      return false;
    };
    const blocks = [...document.querySelectorAll("[data-swarm]")]
      .filter((el) => !inHScroller(el))
      .map((el, i) => ({
      el,
      order: i,
      tasks: [],
      active: false,
    }));
    blocks.forEach((b) => {
      b.el.classList.add("swarm-managed"); // 只有被接管的區塊關掉 Reveal 自己的動畫
      b.tasks = collectTasks(b.el);
      b.tasks.forEach((t) => {
        t.block = b;
        t.state = "pending";
        t.el.classList.add("swarm-pending");
      });
    });
    root.classList.remove("swarm-intro"); // 改由個別元素隱藏

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

    const t0 = performance.now();

    // ---- 游標池
    const cursors = [];
    const getCursor = (x, y) => {
      let c = cursors.find((k) => !k.busy);
      if (!c && cursors.length < MAX_CURSORS) {
        const el = document.createElement("div");
        el.className = "swarm-cursor";
        el.innerHTML = `<svg width="18" height="22" viewBox="0 0 18 22"><path d="${ARROW}"/></svg>`;
        world.appendChild(el);
        // 出生點：開場時從畫面中央一群散開；之後從畫面下緣、目標附近進場
        const vw = window.innerWidth, vh = window.innerHeight;
        const sx = window.scrollX, sy = window.scrollY;
        const intro = performance.now() - t0 < 1500;
        c = intro
          ? { x: sx + vw * 0.5 + rand(-60, 60), y: sy + vh * 0.42 + rand(-40, 40) }
          : { x: clamp(x + rand(-160, 160), sx + 40, sx + vw - 40), y: sy + vh + 30 };
        Object.assign(c, { el, busy: false, hideTimer: 0 });
        cursors.push(c);
      }
      if (!c) return null;
      c.busy = true;
      clearTimeout(c.hideTimer);
      c.el.classList.add("on");
      return c;
    };
    const release = (c) => {
      c.busy = false;
      c.hideTimer = setTimeout(() => c.el.classList.remove("on"), 500);
    };
    const place = (c) => {
      c.el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
    };

    // 元素完成：清掉動畫用的行內樣式
    const finish = (t) => {
      if (t.state === "done") return;
      t.state = "done";
      const st = t.el.style;
      t.el.classList.remove("swarm-pending");
      st.scale = "";
      st.transformOrigin = "";
      if (t.savedTransition !== undefined) st.transition = t.savedTransition;
    };

    // 元素「蓋好之後」的位置（頁面座標）。父容器可能還在放大中，
    // 所以量到的位置要換算回縮放前：
    // - 版面位置用 offsetLeft／offsetTop 鏈（不受 transform、scale 影響）
    // - 文字範圍用 getBoundingClientRect 量，再除以目前的有效縮放比例
    const finalRect = (t) => {
      const el = t.el;
      const er = el.getBoundingClientRect();
      if (!(el instanceof HTMLElement)) {
        // SVG 沒有 offset 系列屬性，只能直接量
        return { left: er.left + window.scrollX, top: er.top + window.scrollY, w: er.width, h: er.height, origin: "0 0" };
      }
      let x = 0, y = 0;
      for (let n = el; n; n = n.offsetParent) {
        x += n.offsetLeft;
        y += n.offsetTop;
      }
      const ow = el.offsetWidth, oh = el.offsetHeight;
      const k = ow ? er.width / ow : 1; // 祖先縮放造成的有效比例
      if (t.kind === "text" && k > 0) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const tr = range.getBoundingClientRect();
        if (tr.width && tr.height) {
          const dx = (tr.left - er.left) / k, dy = (tr.top - er.top) / k;
          return { left: x + dx, top: y + dy, w: tr.width / k, h: tr.height / k, origin: `${dx}px ${dy}px` };
        }
      }
      return { left: x, top: y, w: ow, h: oh, origin: "0 0" };
    };

    // ---- 一個任務：飛到左上角 → 拖到右下角，元素和框一起放大
    const run = async (t, c) => {
      // 文字量實際文字範圍（標題、段落的元素常常比文字寬），
      // 放大原點對齊文字起點，框和文字才會一起長大
      const { left, top, w, h, origin } = finalRect(t);

      const dist = Math.hypot(left - c.x, top - c.y);
      const fx = c.x, fy = c.y;
      await animate(clamp(dist * 0.4, 140, 340), (k) => {
        const e = easeInOut(k);
        c.x = fx + (left - fx) * e;
        c.y = fy + (top - fy) * e;
        place(c);
      });
      if (t.state === "done") return; // 保底已經把它彈出了

      const box = document.createElement("div");
      box.className = `swarm-box swarm-${t.kind}`;
      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
      const showBadge = t.kind === "box" && w > 90 && h > 28;
      box.innerHTML = `<b></b><b></b><b></b><b></b>${showBadge ? '<span class="swarm-badge"></span>' : ""}`;
      const badge = box.querySelector(".swarm-badge");
      world.appendChild(box);

      const st = t.el.style;
      t.savedTransition = st.transition;
      st.transition = "none";
      st.transformOrigin = origin;
      st.scale = "0.02";
      t.el.classList.remove("swarm-pending");
      t.state = "building";

      await animate(clamp(180 + Math.sqrt(w * h) * 0.6, 220, 520), (k) => {
        const e = Math.max(easeOut(k), 0.02);
        if ((t.progress || 0) <= 0.55 && e > 0.55) queueMicrotask(pump);
        t.progress = e;
        if (t.state !== "done") st.scale = String(e);
        box.style.width = `${w * e}px`;
        box.style.height = `${h * e}px`;
        if (badge) badge.textContent = `${Math.round(w * e)} × ${Math.round(h * e)}`;
        c.x = left + w * e;
        c.y = top + h * e;
        place(c);
      });
      finish(t);
      box.classList.add("done");
      setTimeout(() => box.classList.add("out"), 260);
      setTimeout(() => box.remove(), 700);
    };

    // ---- 排程
    const ready = (t) =>
      t.state === "pending" &&
      t.block.active &&
      // 父容器拉到一半多就可以開工，不必等它完全蓋好
      (!t.parent || t.parent.state === "done" || (t.parent.progress || 0) > 0.55);
    const all = () => blocks.flatMap((b) => b.tasks);
    let pumping = false;
    const pump = () => {
      if (pumping || !alive) return;
      pumping = true;
      for (const t of all()) {
        if (!ready(t)) continue;
        const r = t.el.getBoundingClientRect();
        const c = getCursor(r.left + window.scrollX, r.top + window.scrollY);
        if (!c) break;
        t.state = "claimed";
        run(t, c).then(() => {
          finish(t);
          release(c);
          pump();
        });
      }
      pumping = false;
    };

    const timers = [];
    const activate = (b) => {
      if (b.active) return;
      b.active = true;
      timers.push(
        setTimeout(() => {
          b.tasks.forEach((t) => {
            if (t.state === "pending" || t.state === "claimed") {
              t.el.classList.add("swarm-pop");
              finish(t);
            }
          });
          pump();
        }, BLOCK_DEADLINE)
      );
      pump();
    };

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          const b = blocks.find((x) => x.el === en.target);
          if (b) activate(b);
        }),
      { rootMargin: "0px" }
    );
    blocks.forEach((b) => io.observe(b.el));

    return () => {
      alive = false;
      io.disconnect();
      timers.forEach(clearTimeout);
      all().forEach((t) => {
        finish(t);
        t.el.classList.remove("swarm-pop");
      });
      layer.remove();
      blocks.forEach((b) => b.el.classList.remove("swarm-managed"));
      root.classList.remove("swarm-on");
    };
  }, []);

  return null;
}
