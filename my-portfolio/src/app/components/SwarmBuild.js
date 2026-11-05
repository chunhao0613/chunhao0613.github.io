"use client";

// 「游標群組建構」效果：一群像多人協作設計工具的游標，把頁面上標了
// data-swarm 的區塊一個個拉框、定尺寸，再讓內容淡入。
// 游標名稱是 AI 協作中的角色，呼應「我帶著一群 agent 把專案蓋出來」。
//
// 設計原則：
// - 純 DOM 操作，不觸發 React 重新渲染。
// - 沒有 JS、或使用者設定減少動態效果時，內容一律正常顯示。
// - 每個區塊只建構一次；超過時限的區塊直接顯示，絕不讓內容卡住看不到。

import { useEffect } from "react";

const AGENTS = [
  { name: "鮭魚", color: "#F24E1E", lead: true },
  { name: "Planner", color: "#A259FF" },
  { name: "Architect", color: "#0D99FF" },
  { name: "Coder", color: "#0ACF83" },
  { name: "Tester", color: "#FFC700" },
  { name: "Reviewer", color: "#E8467C" },
  { name: "Docs", color: "#00B5CE" },
];

const ARROW =
  "M4.6 3.9C4.2 3.1 4.9 2.4 5.7 2.8L20.6 9.4C21.5 9.8 21.4 11.1 20.4 11.3L13.9 12.9C13.4 13 13 13.4 12.9 13.9L11.3 20.4C11.1 21.4 9.8 21.5 9.4 20.6Z";

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const rand = (a, b) => a + Math.random() * (b - a);

export default function SwarmBuild() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    if (reduce || window.innerWidth < 640) return; // 手機上不跑，避免遮擋與耗電

    root.classList.add("swarm-on");

    const layer = document.createElement("div");
    layer.className = "swarm-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    // ---- 游標
    const cursors = AGENTS.map((a, i) => {
      const el = document.createElement("div");
      el.className = "swarm-cursor";
      el.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24"><path d="${ARROW}" fill="${a.color}" stroke="#fff" stroke-width="1.5"/></svg><span style="background:${a.color}">${a.name}</span>`;
      layer.appendChild(el);
      const c = {
        el,
        x: window.innerWidth / 2 + Math.cos(i) * 80,
        y: window.innerHeight / 3 + Math.sin(i) * 80,
        busy: false,
        phase: rand(0, Math.PI * 2),
        color: a.color,
      };
      return c;
    });

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 3 };
    const onMove = (e) => (mouse = { x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", onMove, { passive: true });

    let alive = true;
    let t0 = performance.now();
    const place = (c) => {
      c.el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
    };

    // 閒置的游標繞著滑鼠鬆散盤旋
    const tick = (now) => {
      if (!alive) return;
      const t = (now - t0) / 1000;
      cursors.forEach((c, i) => {
        if (c.busy) return;
        const r = 70 + (i % 3) * 28;
        const tx = mouse.x + Math.cos(t * 0.6 + c.phase) * r;
        const ty = mouse.y + Math.sin(t * 0.6 + c.phase) * r * 0.6;
        c.x += (tx - c.x) * 0.04;
        c.y += (ty - c.y) * 0.04;
        place(c);
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

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

    const moveTo = (c, x, y, dur) => {
      const sx = c.x, sy = c.y;
      return animate(dur, (k) => {
        const e = easeInOut(k);
        c.x = sx + (x - sx) * e;
        c.y = sy + (y - sy) * e;
        place(c);
      });
    };

    // ---- 建構單一區塊：飛過去 → 拉框（顯示 W × H）→ 內容淡入
    const build = async (target, c) => {
      c.busy = true;
      const r = target.getBoundingClientRect();
      const w = Math.round(r.width), h = Math.round(r.height);
      // 只動畫畫面內看得到的那一段，太高的區塊不用拖到畫面外
      const vh = window.innerHeight;
      const top = Math.max(r.top, 8), bottom = Math.min(r.bottom, vh - 8);
      const left = r.left, right = r.right;

      const fast = queue.length > 2 ? 0.45 : 1; // 排隊多時加快，不讓訪客等
      await moveTo(c, left, top, rand(420, 650) * fast);

      const box = document.createElement("div");
      box.className = "swarm-box";
      box.style.borderColor = c.color;
      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
      const badge = document.createElement("span");
      badge.className = "swarm-badge";
      badge.style.background = c.color;
      box.appendChild(badge);
      layer.appendChild(box);

      const dw = right - left, dh = Math.max(bottom - top, 24);
      await animate(Math.min(900, 350 + dw * 0.5) * fast, (k) => {
        const e = easeInOut(k);
        const cw = dw * e, ch = dh * e;
        box.style.width = `${cw}px`;
        box.style.height = `${ch}px`;
        badge.textContent = `${Math.round(w * e)} × ${Math.round(h * e)}`;
        c.x = left + cw;
        c.y = top + ch;
        place(c);
      });

      target.classList.add("swarm-built");
      box.classList.add("swarm-box-done");
      setTimeout(() => box.remove(), 600);
      c.busy = false;
    };

    // ---- 排程：進入畫面的區塊依序交給空閒游標
    const queue = [];
    let idleTimer;
    const pump = () => {
      layer.classList.remove("swarm-idle");
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (!queue.length && cursors.every((x) => !x.busy)) layer.classList.add("swarm-idle");
      }, 2500);
      while (queue.length) {
        const c = cursors.find((x) => !x.busy);
        if (!c) return;
        const target = queue.shift();
        build(target, c).then(pump);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);
          queue.push(en.target);
          // 安全網：排太久就直接顯示
          setTimeout(() => en.target.classList.add("swarm-built"), 1800);
        });
        pump();
      },
      { threshold: 0.05 }
    );
    const targets = document.querySelectorAll("[data-swarm]");
    targets.forEach((el) => io.observe(el));

    return () => {
      alive = false;
      clearTimeout(idleTimer);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      layer.remove();
      root.classList.remove("swarm-on");
      targets.forEach((el) => el.classList.add("swarm-built"));
    };
  }, []);

  return null;
}
