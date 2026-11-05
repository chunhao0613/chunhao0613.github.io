"use client";

// 「AI 建造」效果：一群游標像 agent 一樣，把頁面從線框一路做到完成品。
//
// 每個元素都走過可見的階段：
//   線框（游標拉框、顯示尺寸）→ 骨架（灰色佔位、微光掃過）→ 內容 → 上色
// - 文字：拉文字框 → 每一行出現骨架條 → I 型游標逐段「串流」揭露，像 LLM 輸出；
//   大標題先用 18px 打出來，再一階一階放大到正式字級。
// - 圖片：骨架 → 8 步「去噪」（模糊與顆粒逐步消失），模仿擴散模型生成。
// - 容器（卡片、終端機）：線框 → 以「未上色」狀態出現 → 內容蓋好後游標點一下上色。
//   若未上色時內容會看不清楚（深色容器在淺色頁面、白色按鈕在深色頁面），改成先上色。
// - 游標有意圖：尺規、紅色參考線（同一欄的文字會吸附對齊）、紅色間距標註、
//   重複元件用 ⌥ 拖曳複製後再重新打字、偶爾拉過頭再修正。
// - 每個游標有自己的低彩度顏色，它拉的框、角點、尺寸標籤、游標都是同色，一眼看出誰在做什麼。
// - 串流時最新冒出的字帶一道該色的生成前緣；上色時底色從點擊處向外塗刷掃開。
// - 右下角的建造紀錄列出每個步驟。
//
// 文字揭露只用 clip-path 與覆蓋層，不改動任何 DOM 文字，React、搜尋引擎、讀屏軟體不受影響。
// 每個區塊進入畫面後有保底時間（依元素數量 2.6–5.5 秒），沒做完的直接彈出，絕不讓內容卡住。
// 每個頁面在同一個分頁工作階段只播一次；手機、減少動態效果時完全不啟用。
// 開場前的隱藏由 layout.js 的內嵌腳本在第一次繪製前處理（設定見 src/lib/swarm.js），避免閃爍；
// 站內換頁（沒有重新載入）則由這裡的 useLayoutEffect 在繪製前處理。
//
// 用法：
//   <SwarmBuild />               完整版：尺規、參考線、間距標註、⌥ 複製都有（首頁）
//   <SwarmBuild mode="light" />  輕量版：只有拉框、串流、去噪、上色與紀錄（文章頁）
// 頁面上標了 data-swarm 的區塊才會被建造（<Reveal> 會自動加上）；
// 某個元素不想套用就加 data-swarm="off"，它和裡面的內容會照常直接顯示。

import { useLayoutEffect } from "react";
import { swarmKey, SWARM_MIN_WIDTH } from "@/lib/swarm";

const MODES = {
  full: { rulers: true, guides: true, measures: true, dup: true },
  light: { rulers: false, guides: false, measures: false, dup: false },
};
const MAX_CURSORS = 36;
// 保底時間依區塊大小：基本 2.6 秒，每個元素加 60ms，最多 5.5 秒
const deadlineOf = (n) => Math.min(5500, 2600 + n * 60);
const CANCEL = Symbol("cancel");
// 每個游標（agent）一個低彩度色相：柔藍、鼠尾草綠、灰玫瑰、沙色、薰衣草、灰青。
// 實際顏色在 CSS 以 oklch(亮度 彩度 色相) 組合，深淺主題各一組亮度
const HUES = [250, 160, 20, 80, 300, 200];

const CURSOR_HTML =
  '<svg class="m-arrow" width="18" height="22" viewBox="0 0 18 22"><path d="M3 2.2 L3 17.6 L7.1 13.7 L9.8 19.8 L12.6 18.6 L9.9 12.6 L15.6 12.6 Z"/></svg>' +
  '<svg class="m-cross" width="19" height="19" viewBox="0 0 19 19"><path d="M8.6 1.5h1.8v7.1h7.1v1.8h-7.1v7.1H8.6v-7.1H1.5V8.6h7.1z"/></svg>' +
  '<svg class="m-text" width="12" height="20" viewBox="0 0 12 20"><path d="M2 1.5h3.2L6 2.3l.8-.8H10v1.7H8.4c-.8 0-1.2.4-1.2 1.2v11.2c0 .8.4 1.2 1.2 1.2H10v1.7H6.8L6 17.7l-.8.8H2v-1.7h1.6c.8 0 1.2-.4 1.2-1.2V4.4c0-.8-.4-1.2-1.2-1.2H2z"/></svg>';

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const backOut = (t) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);

const isBoxed = (cs) =>
  parseFloat(cs.borderTopWidth) > 0 ||
  parseFloat(cs.borderLeftWidth) > 0 ||
  (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent") ||
  cs.backgroundImage !== "none";
const MEDIA = /^(IMG|VIDEO|CANVAS|SVG|svg)$/;
const isSmall = (r) => r.width < 40 && r.height < 40;

// 是否為一段「文字區塊」：
// - 直接含有文字（混合結構，例如「標籤 span＋一段文字」）一律算，整段一起串流，
//   否則直接寫在容器裡的文字沒有任務處理，框一出現就露出來
// - 或子節點全是文字、行內元素、小東西（圖示、狀態圓點）
function isTextBlock(el) {
  for (const n of el.childNodes) if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) return true;
  let hasText = false;
  for (const n of el.childNodes) {
    if (n.nodeType === Node.TEXT_NODE) {
      if (n.textContent.trim()) hasText = true;
      continue;
    }
    if (n.nodeType !== Node.ELEMENT_NODE || n.tagName === "BR") continue;
    if (isSmall(n.getBoundingClientRect())) continue;
    // 逐字拆開的標題（每個字一個 span，外層是 flex）：一兩個字的葉節點也算行內
    if (!n.children.length && n.textContent.trim().length <= 2) {
      if (n.textContent.trim()) hasText = true;
      continue;
    }
    if (!/^inline/.test(getComputedStyle(n).display)) return false;
    if (n.textContent.trim()) hasText = true;
  }
  return hasText;
}

// 顏色的亮度與透明度（0–1）。Tailwind v4 的顏色是 oklch，computed style 也可能回 oklch。
function colorInfo(str) {
  if (!str || str === "transparent") return { L: 0, a: 0 };
  const nums = (str.match(/-?[\d.]+(?:e-?\d+)?%?/g) || []).map((v) =>
    v.endsWith("%") ? parseFloat(v) / 100 : parseFloat(v)
  );
  let a = 1;
  if (str.includes("/")) a = nums[nums.length - 1];
  else if (/^rgba/.test(str) && nums.length >= 4) a = nums[3];
  let L;
  if (/^oklch|^oklab/.test(str)) L = nums[0];
  else if (/^lch|^lab/.test(str)) L = nums[0] / 100;
  else if (str.startsWith("color(")) L = 0.2126 * nums[0] + 0.7152 * nums[1] + 0.0722 * nums[2];
  else L = (0.2126 * nums[0] + 0.7152 * nums[1] + 0.0722 * nums[2]) / 255;
  return { L: clamp(L || 0, 0, 1), a: clamp(a, 0, 1) };
}

const pageRect = (el) => {
  const r = el.getBoundingClientRect();
  return { left: r.left + window.scrollX, top: r.top + window.scrollY, width: r.width, height: r.height };
};

// 文字的每一行（相對元素左上角，未縮放座標）
function lineBoxes(el) {
  const er = el.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(el);
  const rects = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
  rects.sort((a, b) => a.top - b.top || a.left - b.left);
  const lines = [];
  for (const r of rects) {
    const cy = (r.top + r.bottom) / 2;
    const line = lines.find((l) => cy > l.t && cy < l.b);
    if (line) {
      line.l = Math.min(line.l, r.left);
      line.r = Math.max(line.r, r.right);
      line.t = Math.min(line.t, r.top);
      line.b = Math.max(line.b, r.bottom);
    } else lines.push({ l: r.left, r: r.right, t: r.top, b: r.bottom });
  }
  return lines.map((l) => ({ l: l.l - er.left, r: l.r - er.left, t: l.t - er.top, b: l.b - er.top }));
}

const tokenCount = (s) => {
  const cjk = (s.match(/[　-鿿＀-￯]/g) || []).length;
  return Math.max(1, cjk + Math.ceil((s.length - cjk) / 4));
};

function label(t) {
  if (t.kind === "media") return "image";
  const tag = t.el.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag)) return "heading";
  if (tag === "p" || tag === "dd" || tag === "dt") return "text";
  if (tag === "img" || tag === "video") return "image";
  if (tag === "svg") return "vector";
  if (tag === "a" || tag === "button") return "button";
  if (tag === "li" || tag === "article") return "card";
  if (t.kind === "leafbox") return "chip";
  if (t.kind === "container") return "frame";
  return "text";
}
const snippet = (el) => {
  const s = el.textContent.replace(/\s+/g, " ").trim();
  return s ? `"${s.length > 14 ? s.slice(0, 14) + "…" : s}"` : "";
};

// 參數在內部叫 variant：效果裡另有切換游標外觀的 mode() 函式，同名會互相遮蔽
export default function SwarmBuild({ mode: variant = "full" }) {
  // useLayoutEffect：站內換頁時在繪製前就把元素藏好，不會先閃一下
  useLayoutEffect(() => {
    const features = MODES[variant] || MODES.full;
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const key = swarmKey(window.location.pathname);
    let played = false;
    try {
      played = sessionStorage.getItem(key) === "1";
    } catch {}
    if (reduce || window.innerWidth < SWARM_MIN_WIDTH || played) {
      root.classList.remove("swarm-intro");
      return;
    }
    try {
      sessionStorage.setItem(key, "1");
    } catch {}
    root.classList.add("swarm-on");

    const themeRoot = document.querySelector("[data-theme]");

    // ================================================================ 任務收集
    // 橫向捲動列（文章卡片）也照常套用：瀏覽器判斷「進入畫面」時會考慮容器裁切，
    // 被裁掉的卡片在左右捲到之前本來就看不見，捲到時才進入畫面、開始建造
    const blocks = [...document.querySelectorAll('[data-swarm]:not([data-swarm="off"])')]
      .map((el, i) => ({ el, index: i, tasks: [], guides: [], active: false, measures: 0 }));
    blocks.forEach((b) => b.el.classList.add("swarm-managed")); // 關掉 Reveal 自己的滑入動畫

    const tasks = [];
    const byEl = new Map();
    let seq = 0;
    const mk = (el, parent, kind, block, cs) => {
      const t = {
        el, parent, kind, block, cs,
        order: block.index * 100000 + seq++,
        children: [], state: "pending", painted: false, saved: {}, ov: new Set(),
      };
      if (parent) parent.children.push(t);
      byEl.set(el, t);
      tasks.push(t);
      block.tasks.push(t);
      return t;
    };
    const walk = (el, parent, block) => {
      for (const child of el.children) {
        const cs = getComputedStyle(child);
        if (cs.display === "none") continue; // 不看 visibility：開場前整個區塊是 hidden
        if (child.getAttribute("data-swarm") === "off") continue; // 不套用：照常顯示
        const r = child.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        const boxed = isBoxed(cs);
        // 外框裡只包一張差不多大的圖片：合併成一個圖片任務，少等一層（圖片是最吸睛的元素）
        const only = child.children.length === 1 ? child.children[0] : null;
        const wrapsMedia =
          boxed && only && MEDIA.test(only.tagName) && only.getBoundingClientRect().width * only.getBoundingClientRect().height > r.width * r.height * 0.8;
        if (MEDIA.test(child.tagName) || wrapsMedia) mk(child, parent, isSmall(r) ? "icon" : "media", block, cs);
        else if (isTextBlock(child)) mk(child, parent, boxed ? "leafbox" : "text", block, cs);
        else if (boxed) walk(child, mk(child, parent, "container", block, cs), block);
        else walk(child, parent, block);
      }
    };
    blocks.forEach((b) => walk(b.el, null, b));
    tasks.forEach((t) => {
      t.el.classList.add("swarm-pending");
      t.prevSib = byEl.get(t.el.previousElementSibling) || null;
    });

    // 重複元件：同標籤、同 class、同一層的兄弟（卡片在各自的 Reveal 裡，就看祖父層）
    const gid = new WeakMap();
    let gidSeq = 0;
    const idOf = (n) => (n ? gid.get(n) ?? (gid.set(n, ++gidSeq), gidSeq) : 0);
    const groups = new Map();
    tasks.forEach((t) => {
      if (t.kind !== "container" && t.kind !== "leafbox") return;
      const p = t.el.parentElement;
      const gp = p && p.hasAttribute("data-swarm") ? p.parentElement : p;
      const key = `${t.el.tagName}|${t.el.className}|${idOf(gp)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(t);
    });
    if (features.dup) groups.forEach((list) => list.slice(1).forEach((t) => (t.dupOf = list[0])));

    // 參考線：區塊最外層、左緣對齊的文字（至少兩段）共用一條，每個區塊最多一條。
    // 卡片內部不拉，避免內容還沒出現就滿畫面紅線
    if (features.guides) blocks.forEach((b) => {
      const cols = new Map();
      b.tasks.forEach((t) => {
        if (t.kind !== "text" || t.parent) return;
        const range = document.createRange();
        range.selectNodeContents(t.el);
        const r = range.getBoundingClientRect();
        const x = Math.round(r.left + window.scrollX);
        if (!cols.has(x)) cols.set(x, []);
        cols.get(x).push({ t, top: r.top + window.scrollY, bottom: r.bottom + window.scrollY });
      });
      [...cols.entries()]
        .filter(([, l]) => l.length >= 2)
        .sort((a, b2) => b2[1].length - a[1].length)
        .slice(0, 1)
        .forEach(([x, list]) => {
          const g = {
            kind: "guide", x, block: b, state: "pending", ov: new Set(),
            top: Math.min(...list.map((i) => i.top)),
            bottom: Math.max(...list.map((i) => i.bottom)),
            deps: list.map((i) => i.t),
            order: Math.min(...list.map((i) => i.t.order)) - 0.5,
          };
          g.deps.forEach((d) => (d.guide = g));
          b.guides.push(g);
          tasks.push(g);
        });
    });
    tasks.sort((a, b) => a.order - b.order);
    root.classList.remove("swarm-intro"); // 改由個別元素隱藏

    // ================================================================ 圖層
    const layer = document.createElement("div");
    layer.className = `swarm-layer${features.rulers ? "" : " no-rulers"}`;
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML =
      '<div class="swarm-ruler-x"></div><div class="swarm-ruler-y"></div><div class="swarm-ruler-c"></div><div class="swarm-world"></div>' +
      '<div class="swarm-log"><div class="hd"><i></i><b>building</b><span class="ct"></span><span class="tm"></span></div><ol></ol></div>';
    document.body.appendChild(layer);
    const world = layer.querySelector(".swarm-world");
    const rulerX = layer.querySelector(".swarm-ruler-x");
    const rulerY = layer.querySelector(".swarm-ruler-y");
    const logEl = layer.querySelector(".swarm-log");
    const logHead = logEl.querySelector("b");
    const logCount = logEl.querySelector(".ct");
    const logTime = logEl.querySelector(".tm");
    const logList = logEl.querySelector("ol");

    let alive = true;
    const follow = () => {
      if (!alive) return;
      const sx = window.scrollX, sy = window.scrollY;
      world.style.transform = `translate3d(${-sx}px, ${-sy}px, 0)`;
      rulerX.style.backgroundPositionX = `${-sx}px, ${-sx}px`;
      rulerY.style.backgroundPositionY = `${-sy}px, ${-sy}px`;
      const theme = themeRoot?.dataset.theme;
      if (theme && layer.dataset.theme !== theme) layer.dataset.theme = theme; // 讓複製的元件套到正確主題
      requestAnimationFrame(follow);
    };
    follow();

    const ov = (t, cls) => {
      const d = document.createElement("div");
      d.className = cls;
      world.appendChild(d);
      t.ov.add(d);
      return d;
    };
    const kill = (t, d, fade = 0) => {
      t.ov.delete(d);
      if (!fade) return d.remove();
      d.classList.add("out");
      setTimeout(() => d.remove(), fade);
    };
    const pos = (d, x, y, w, h) => {
      d.style.left = `${x}px`;
      d.style.top = `${y}px`;
      if (w !== undefined) d.style.width = `${Math.max(0, w)}px`;
      if (h !== undefined) d.style.height = `${Math.max(0, h)}px`;
    };

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

    // ================================================================ 建造紀錄
    const logLines = [];
    let logDirty = false;
    let doneCount = 0;
    let busy = 0;
    let burstStart = 0;
    let idleSince = performance.now();
    let logState = "off";
    const log = (verb, what, meta = "") => {
      logLines.push({ verb, what, meta });
      if (logLines.length > 4) logLines.shift();
      logDirty = true;
    };
    const activeTotal = () => tasks.filter((t) => t.kind !== "guide" && t.block.active).length;
    const logTimer = setInterval(() => {
      const now = performance.now();
      if (busy > 0) {
        idleSince = now;
        if (logState !== "on") {
          logState = "on";
          burstStart = now;
          logEl.classList.add("on");
          logEl.classList.remove("ok");
          logHead.textContent = "building";
        }
      } else if (logState === "on" && now - idleSince > 900) {
        logState = "ok";
        logEl.classList.add("ok");
        logHead.textContent = "built";
      } else if (logState === "ok" && now - idleSince > 2600) {
        logState = "off";
        logEl.classList.remove("on");
      }
      if (logState === "on") logTime.textContent = `${((now - burstStart) / 1000).toFixed(1)}s`;
      logCount.textContent = `${doneCount} / ${activeTotal()}`;
      if (logDirty) {
        logDirty = false;
        logList.innerHTML = logLines
          .map((l) => `<li><em class="v-${l.verb}">${l.verb}</em><span>${esc(l.what)}</span><small>${esc(l.meta)}</small></li>`)
          .join("");
      }
      layer.classList.toggle("building", busy > 0);
    }, 80);

    // ================================================================ 游標池
    const t0 = performance.now();
    const cursors = [];
    const getCursor = (x, y) => {
      let c = cursors.find((k) => !k.busy);
      if (!c && cursors.length < MAX_CURSORS) {
        const el = document.createElement("div");
        el.className = "swarm-cursor";
        el.dataset.mode = "arrow";
        el.innerHTML = CURSOR_HTML;
        world.appendChild(el);
        // 出生點：開場時從畫面中央一群散開；之後從目標左下方（畫面內）進場，縮短等待
        const vw = window.innerWidth, vh = window.innerHeight;
        const sx = window.scrollX, sy = window.scrollY;
        c =
          performance.now() - t0 < 1500
            ? { x: sx + vw * 0.5 + rand(-60, 60), y: sy + vh * 0.42 + rand(-40, 40) }
            : { x: clamp(x + rand(-150, -50), sx + 30, sx + vw - 30), y: clamp(y + rand(70, 160), sy + 30, sy + vh - 30) };
        Object.assign(c, { el, busy: false, hideTimer: 0, h: HUES[cursors.length % HUES.length] });
        el.style.setProperty("--h", c.h);
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
      c.el.dataset.mode = "arrow";
      c.hideTimer = setTimeout(() => c.el.classList.remove("on"), 450);
    };
    const place = (c) => {
      c.el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
    };
    const mode = (c, m) => (c.el.dataset.mode = m);
    const tint = (d, c) => d.style.setProperty("--h", c.h); // 覆蓋層套上該游標的顏色
    const click = (c) => {
      c.el.classList.add("click");
      setTimeout(() => c.el.classList.remove("click"), 140);
    };
    const fly = (c, x, y, dur) => {
      const fx = c.x, fy = c.y;
      return animate(dur ?? clamp(Math.hypot(x - fx, y - fy) * 0.4, 130, 380), (k) => {
        const e = easeInOut(k);
        c.x = fx + (x - fx) * e;
        c.y = fy + (y - fy) * e;
        place(c);
      });
    };

    // ================================================================ 元素樣式
    const setStyle = (t, prop, v) => {
      if (!(prop in t.saved)) t.saved[prop] = t.el.style[prop];
      t.el.style[prop] = v;
    };
    const restoreStyle = (t, prop) => {
      if (!(prop in t.saved)) return;
      t.el.style[prop] = t.saved[prop];
      delete t.saved[prop];
    };
    const SKIN = ["backgroundColor", "backgroundImage", "boxShadow", "backdropFilter", "webkitBackdropFilter", "borderColor"];
    const unstyle = (t) => {
      setStyle(t, "transition", "none");
      setStyle(t, "backgroundColor", "transparent");
      setStyle(t, "backgroundImage", "none");
      setStyle(t, "boxShadow", "none");
      setStyle(t, "backdropFilter", "none");
      setStyle(t, "webkitBackdropFilter", "none");
      setStyle(t, "borderColor", "transparent");
    };

    // 要不要「先上色」：未上色時內容會看不清楚（深色容器在淺色頁面、白色按鈕在深色頁面）。
    // 動工時才判斷，建構途中切換主題也正確（cs 是即時的 computed style）
    const decidePaint = (t) => {
      const pageL = colorInfo(getComputedStyle(themeRoot || document.body).backgroundColor).L;
      const bg = colorInfo(t.cs.backgroundColor);
      const eff = bg.a * bg.L + (1 - bg.a) * pageL;
      t.paintFirst = Math.abs(eff - pageL) > 0.35;
      t.bg = t.cs.backgroundColor;
      t.bgOpaque = bg.a >= 0.9;
      t.bgImg = t.cs.backgroundImage;
    };

    const chk = (t) => {
      if (t.state === "done" || !alive) throw CANCEL;
    };

    const fadeGuide = (g) => {
      g.ov.forEach((d) => {
        d.classList.add("out");
        setTimeout(() => d.remove(), 400);
      });
      g.ov.clear();
    };

    const finishTask = (t, pop) => {
      if (t.state === "done") return;
      t.state = "done";
      if (t.kind === "guide") return fadeGuide(t);
      t.painted = true;
      const neverShown = t.el.classList.contains("swarm-pending");
      t.el.classList.remove("swarm-pending");
      Object.keys(t.saved).forEach((p) => restoreStyle(t, p));
      t.ov.forEach((d) => d.remove());
      t.ov.clear();
      // 只有還沒出現過的元素才用彈出動畫；已經顯示的（例如等上色的卡片）直接收尾，
      // 否則整張卡片會從透明重新淡入，看起來一暗
      if (pop && neverShown) {
        t.el.classList.add("swarm-pop");
        setTimeout(() => t.el.classList.remove("swarm-pop"), 400);
      }
      doneCount++;
      const g = t.guide;
      if (g && g.deps.every((d) => d.state === "done")) {
        g.state = "done";
        fadeGuide(g);
      }
      queueMicrotask(pump);
    };

    // ================================================================ 動作
    // 紅色間距標註：與上一個兄弟元素的垂直距離（每個區塊最多兩次，避免雜亂）
    // 用版面位置（offsetTop）算，上一個元素可能還在縮放中（例如 18px 的標題）
    const maybeMeasure = (t, r) => {
      const p = t.prevSib, b = t.block;
      if (!features.measures || !p || b.measures >= 2 || p.state === "pending") return;
      if (!(t.el instanceof HTMLElement) || t.el.offsetParent !== p.el.offsetParent) return;
      const gap = t.el.offsetTop - (p.el.offsetTop + p.el.offsetHeight);
      if (gap < 6 || gap > 160) return;
      b.measures++;
      const m = ov(t, "swarm-measure v");
      pos(m, r.left + Math.min(18, r.width / 3), r.top - gap, undefined, gap);
      m.innerHTML = `<span>${Math.round(gap)}</span>`;
      setTimeout(() => kill(t, m, 300), 700);
    };

    // 拉框：箭頭飛到左上角 → 十字游標拖到右下角，尺寸即時更新
    const wire = async (t, c, g) => {
      mode(c, "arrow");
      if (Math.random() < 0.18) await fly(c, g.x + rand(10, 24), g.y + rand(6, 14)); // 先瞄偏再修正
      chk(t);
      if (t.guide && t.guide.line) {
        // 先停在參考線旁，再「吸附」上去
        await fly(c, g.x + 8, g.y);
        chk(t);
        await sleep(60);
        t.guide.line.classList.add("snap");
        setTimeout(() => t.guide?.line?.classList.remove("snap"), 220);
        c.x = g.x;
        place(c);
      } else await fly(c, g.x, g.y);
      chk(t);
      mode(c, "cross");
      await sleep(rand(20, 100)); // 下筆前短暫停頓
      chk(t);
      const box = ov(t, `swarm-box${g.text ? " swarm-tbox" : ""}`);
      tint(box, c);
      pos(box, g.x, g.y, 0, 0);
      box.innerHTML = `<b></b><b></b><b></b><b></b>${g.badge ? '<span class="swarm-badge"></span>' : ""}`;
      const badge = box.querySelector(".swarm-badge");
      const over = !g.text && Math.random() < 0.35; // 偶爾拉過頭再回彈
      const area = Math.sqrt(g.w * g.h);
      await animate(g.text ? clamp(130 + area * 0.25, 150, 280) : clamp(180 + area * 0.35, 210, 400), (k) => {
        const e = over ? backOut(k) : easeOut(k);
        pos(box, g.x, g.y, g.w * e, g.h * e);
        if (badge) badge.textContent = g.badge === true ? `${Math.round(g.w * e)} × ${Math.round(g.h * e)}` : g.badge;
        c.x = g.x + g.w * e;
        c.y = g.y + g.h * e;
        place(c);
      });
      chk(t);
      box.classList.add("done");
      return box;
    };

    // 上色：游標點一下，底色從點擊處向外「塗刷」掃開，前緣帶一圈該游標的顏色；
    // 只動背景（radial-gradient），裡面的文字不受影響。邊框、陰影同時淡入
    const paint = async (t, c, r, box) => {
      mode(c, "arrow");
      const px = r.left + Math.min(28, r.width / 2), py = r.top + Math.min(22, r.height / 2);
      await fly(c, px, py);
      chk(t);
      click(c);
      const rp = ov(t, "swarm-ripple");
      tint(rp, c);
      pos(rp, px, py);
      setTimeout(() => kill(t, rp), 560);
      if (box) kill(t, box, 420);
      log("paint", label(t), t.bg && colorInfo(t.bg).a > 0.02 ? "fill" : "stroke");
      setStyle(t, "transition", "border-color .45s ease, box-shadow .45s ease");
      restoreStyle(t, "borderColor");
      restoreStyle(t, "boxShadow");
      const solid = t.bg && colorInfo(t.bg).a > 0.02 && (!t.bgImg || t.bgImg === "none");
      if (solid) {
        const lx = px - r.left, ly = py - r.top;
        const R = Math.hypot(Math.max(lx, r.width - lx), Math.max(ly, r.height - ly)) + 20;
        const rim = `oklch(${layer.dataset.theme === "light" ? 0.6 : 0.75} 0.07 ${c.h} / 0.4)`;
        await animate(clamp(260 + R * 0.4, 320, 520), (k) => {
          const rr = R * easeOut(k);
          t.el.style.backgroundImage = `radial-gradient(circle at ${lx}px ${ly}px, ${t.bg} ${rr}px, ${rim} ${rr + 1.5}px, transparent ${rr + 9}px)`;
        });
      } else {
        setStyle(t, "transition", "background-color .45s ease, border-color .45s ease, box-shadow .45s ease");
        restoreStyle(t, "backgroundColor");
        restoreStyle(t, "backgroundImage");
        await sleep(360);
      }
      chk(t);
      SKIN.forEach((p) => restoreStyle(t, p));
      restoreStyle(t, "transition");
      t.painted = true;
    };

    // 串流文字：骨架條 → 逐段揭露（clip-path 或覆蓋層），閃爍游標跟在後面
    const stream = async (t, c, o) => {
      const { el, lines, er } = o;
      const widths = lines.map((l) => l.r - l.l);
      const total = widths.reduce((a, b) => a + b, 0);
      const ox = Math.min(...lines.map((l) => l.l)), oy = lines[0].t;
      let s = o.s0 || 1;
      const P = (lx, ly) => [er.left + ox + (lx - ox) * s, er.top + oy + (ly - oy) * s];

      const covers = o.cover ? lines.map(() => ov(t, "swarm-cover")) : [];
      covers.forEach((d) => (d.style.background = o.cover));
      const bars = lines.map(() => ov(t, "swarm-skel"));
      const edge = ov(t, "swarm-edge"); // 生成前緣：最新冒出的字帶一道淡色光暈
      const caret = ov(t, "swarm-caret");
      [...bars, edge, caret].forEach((d) => tint(d, c));
      const apply = (rev) => {
        let acc = 0, cx = null, cy = 0, ch = 0, cl = 0;
        const parts = [];
        lines.forEach((l, i) => {
          const w = widths[i];
          const x = rev >= acc + w ? l.r : rev > acc ? l.l + (rev - acc) : l.l;
          if (x > l.l) parts.push(`M${l.l - 2} ${l.t - 3}H${x + 2}V${l.b + 3}H${l.l - 2}Z`);
          if (rev > acc && rev < acc + w) {
            cx = x;
            cy = l.t;
            ch = l.b - l.t;
            cl = l.l;
          }
          const lh = l.b - l.t;
          const [bx, by] = P(x, l.t + lh * 0.22);
          const [bx2] = P(l.r, 0);
          pos(bars[i], bx + (x > l.l ? 3 : 0), by, bx2 - bx - (x > l.l ? 3 : 0), lh * 0.56 * s);
          bars[i].style.opacity = x >= l.r ? "0" : "";
          if (covers[i]) {
            const [qx, qy] = P(x, l.t - 2);
            pos(covers[i], qx, qy, bx2 - qx + 3, (lh + 4) * s);
          }
          acc += w;
        });
        const live = cx !== null;
        if (cx === null) {
          const l = lines[lines.length - 1];
          cx = rev > 0 ? l.r : lines[0].l;
          cy = rev > 0 ? l.t : lines[0].t;
          ch = (rev > 0 ? l : lines[0]).b - cy;
        }
        if (!o.cover) el.style.clipPath = parts.length ? `path("${parts.join(" ")}")` : "inset(0 100% 100% 0)";
        const [px, py] = P(cx, cy);
        pos(caret, px + 1, py, undefined, ch * s);
        if (live) {
          const [ex] = P(Math.max(cl, cx - 90), cy);
          pos(edge, ex, py, px - ex + 2, ch * s);
        }
        edge.style.opacity = live ? "" : "0";
        c.x = px + 6;
        c.y = py + ch * s * 0.55;
        place(c);
      };
      apply(0);
      mode(c, "text");
      await sleep(rand(120, 190)); // 骨架停一下，像在「生成」
      chk(t);
      const dur = clamp(160 + total * 0.24, 260, 850);
      const steps = Math.max(3, Math.round(dur / 34));
      const mean = total / steps;
      let rev = 0;
      while (rev < total) {
        rev = Math.min(total, rev + mean * rand(0.35, 1.65));
        apply(rev);
        await sleep(34);
        chk(t);
      }
      log("stream", `${label(t)} ${snippet(el)}`, `${tokenCount(el.textContent.trim())} tok`);
      caret.classList.add("idle");
      return { caret, bars, covers, setScale: (v) => ((s = v), apply(total)) };
    };

    // ================================================================ 任務
    const jobText = async (t, c) => {
      const el = t.el;
      const er = pageRect(el);
      const lines = lineBoxes(el);
      if (!lines.length || t.cs.display === "inline") {
        await fly(c, er.left, er.top);
        return finishTask(t, true);
      }
      // 自帶逐字進場動畫的元素（例如字會從四散位置飛回來的標題）：量到的位置會亂，
      // 拉好框後直接交給它自己的動畫
      // 只看「真的偏離原位」的 transform：彩蛋、波浪文字帶著 translateY(0) 這類不移動的樣式，不算
      const displaced = [...el.querySelectorAll('[style*="transform"]')].some((n) => {
        const m = getComputedStyle(n).transform;
        return m && m !== "none" && m !== "matrix(1, 0, 0, 1, 0, 0)";
      });
      if (displaced) {
        const box = await wire(t, c, { x: er.left, y: er.top, w: er.width, h: er.height, text: true, badge: false });
        el.classList.remove("swarm-pending");
        log("assemble", label(t), snippet(el));
        kill(t, box, 400);
        await sleep(450);
        return finishTask(t);
      }
      const fs = parseFloat(t.cs.fontSize);
      const heading = fs >= 26;
      const s0 = heading ? clamp(18 / fs, 0.3, 0.85) : 1;
      const ox = Math.min(...lines.map((l) => l.l)), oy = lines[0].t;
      const tw = Math.max(...lines.map((l) => l.r)) - ox, th = lines[lines.length - 1].b - oy;
      const box = await wire(t, c, {
        x: er.left + ox, y: er.top + oy, w: tw * s0, h: th * s0, text: true, badge: heading ? "18px" : false,
      });
      maybeMeasure(t, er);
      setStyle(t, "transition", "none");
      setStyle(t, "transformOrigin", `${ox}px ${oy}px`);
      if (heading) setStyle(t, "scale", String(s0));
      setStyle(t, "clipPath", "inset(0 100% 100% 0)");
      el.classList.remove("swarm-pending");
      const st = await stream(t, c, { el, lines, er, s0 });
      if (heading) {
        // 標題字級一階一階放大到正式大小
        const sizes = [24, 32, 40, 48, 56, 64, 72, 88].filter((v) => v < fs - 2).concat(fs);
        const badge = box.querySelector(".swarm-badge");
        for (const size of sizes) {
          const s = size / fs;
          setStyle(t, "scale", String(s));
          st.setScale(s);
          pos(box, er.left + ox, er.top + oy, tw * s, th * s);
          if (badge) badge.textContent = `${Math.round(size)}px`;
          await sleep(70);
          chk(t);
        }
        log("resize", "heading", `18 → ${Math.round(fs)}px`);
      }
      await sleep(160);
      finishTask(t);
    };

    const jobMedia = async (t, c) => {
      const r = pageRect(t.el);
      const box = await wire(t, c, { x: r.left, y: r.top, w: r.width, h: r.height, badge: true });
      const radius = t.cs.borderRadius;
      const skel = ov(t, "swarm-skel swarm-fill");
      pos(skel, r.left, r.top, r.width, r.height);
      skel.style.borderRadius = radius;
      await sleep(220);
      chk(t);
      setStyle(t, "transition", "none");
      setStyle(t, "filter", "blur(14px) grayscale(1)");
      t.el.classList.remove("swarm-pending");
      const grain = ov(t, "swarm-grain");
      pos(grain, r.left, r.top, r.width, r.height);
      grain.style.borderRadius = radius;
      kill(t, skel);
      const badge = box.querySelector(".swarm-badge");
      for (let i = 1; i <= 8; i++) {
        const s = i / 8;
        t.el.style.filter = `blur(${(14 * Math.pow(1 - s, 1.3)).toFixed(2)}px) grayscale(${(1 - s).toFixed(2)}) contrast(${(0.85 + 0.15 * s).toFixed(2)})`;
        grain.style.opacity = String(0.55 * (1 - s));
        grain.style.backgroundPosition = `${rand(0, 180)}px ${rand(0, 180)}px`;
        if (badge) badge.textContent = `denoise ${i}/8`;
        await sleep(72);
        chk(t);
      }
      log("denoise", label(t), "8 steps");
      finishTask(t);
    };

    const jobContainer = async (t, c) => {
      decidePaint(t);
      const r = pageRect(t.el);
      const box = await wire(t, c, { x: r.left, y: r.top, w: r.width, h: r.height, badge: r.width > 60 && r.height > 24 });
      log("frame", label(t), `${Math.round(r.width)} × ${Math.round(r.height)}`);
      unstyle(t);
      t.el.classList.remove("swarm-pending");
      maybeMeasure(t, r);
      if (t.paintFirst) await paint(t, c, r, box);
      else {
        box.classList.add("held");
        t.heldBox = box;
      }
      t.state = "open";
      queueMicrotask(pump);
    };

    const jobPaint = async (t, c) => {
      await paint(t, c, pageRect(t.el), t.heldBox);
      finishTask(t);
    };

    const jobLeaf = async (t, c) => {
      decidePaint(t);
      const el = t.el;
      const r = pageRect(el);
      const box = await wire(t, c, { x: r.left, y: r.top, w: r.width, h: r.height, badge: r.width > 90 && r.height > 28 });
      const lines = lineBoxes(el);
      unstyle(t);
      setStyle(t, "color", "transparent");
      el.classList.remove("swarm-pending");
      if (t.paintFirst) await paint(t, c, r, null);
      chk(t);
      const er = pageRect(el);
      if (lines.length) {
        const cover = t.paintFirst && t.bgOpaque ? t.bg : null;
        if (!cover) setStyle(t, "clipPath", "inset(0 100% 100% 0)");
        restoreStyle(t, "color");
        await stream(t, c, { el, lines, er, cover });
      } else restoreStyle(t, "color");
      chk(t);
      if (!t.paintFirst) {
        restoreStyle(t, "clipPath");
        await paint(t, c, r, box);
      }
      finishTask(t);
    };

    // ⌥ 拖曳複製：選取母版 → 拖出副本（紅色間距標註）→ 放下後重新打字
    const jobDup = async (t, c) => {
      decidePaint(t);
      const m = t.dupOf;
      const mr = pageRect(m.el), tr = pageRect(t.el);
      mode(c, "arrow");
      const gx = Math.min(mr.width * 0.5, 60), gy = Math.min(mr.height * 0.5, 20);
      await fly(c, mr.left + gx, mr.top + gy);
      chk(t);
      const sel = ov(t, "swarm-box done swarm-sel");
      tint(sel, c);
      pos(sel, mr.left, mr.top, mr.width, mr.height);
      sel.innerHTML = "<b></b><b></b><b></b><b></b>";
      click(c);
      await sleep(110);
      chk(t);
      const ghost = ov(t, "swarm-ghost");
      tint(ghost, c);
      const clone = m.el.cloneNode(true);
      clone.removeAttribute("id");
      clone.classList.remove("swarm-pop");
      clone.style.margin = "0";
      clone.style.width = "100%";
      clone.style.height = "100%";
      clone.style.boxSizing = "border-box";
      if (t.kind === "leafbox") clone.style.whiteSpace = "nowrap"; // 副本寬度漸變時文字不要被擠到換行
      else ghost.classList.add("blank"); // 卡片副本只帶外框，放下後再重新打字，避免和母版疊出重影
      ghost.appendChild(clone);
      pos(ghost, mr.left, mr.top, mr.width, mr.height);
      const alt = ov(t, "swarm-alt");
      tint(alt, c);
      alt.textContent = "⌥";
      const meas = ov(t, "swarm-measure");
      kill(t, sel, 200);
      const horiz = Math.abs(tr.left - mr.left) > Math.abs(tr.top - mr.top);
      let gap = 0;
      await animate(clamp(Math.hypot(tr.left - mr.left, tr.top - mr.top) * 0.5, 280, 700), (k) => {
        const e = easeInOut(k);
        const x = mr.left + (tr.left - mr.left) * e, y = mr.top + (tr.top - mr.top) * e;
        const w = mr.width + (tr.width - mr.width) * e, h = mr.height + (tr.height - mr.height) * e;
        pos(ghost, x, y, w, h);
        c.x = x + gx;
        c.y = y + gy;
        place(c);
        pos(alt, c.x + 14, c.y + 16);
        if (horiz) {
          gap = x - (mr.left + mr.width);
          meas.className = "swarm-measure h";
          pos(meas, mr.left + mr.width, mr.top + mr.height / 2, gap, undefined);
        } else {
          gap = y - (mr.top + mr.height);
          meas.className = "swarm-measure v";
          pos(meas, mr.left + Math.min(mr.width / 2, 40), mr.top + mr.height, undefined, gap);
        }
        meas.style.display = gap > 2 ? "" : "none";
        meas.innerHTML = gap > 2 ? `<span>${Math.round(gap)}</span>` : "";
      });
      chk(t);
      kill(t, ghost);
      kill(t, alt);
      setTimeout(() => kill(t, meas, 300), 350);
      log("dup", `${label(t)} ⌥`, gap > 2 ? `+${Math.round(gap)}px` : "");
      t.el.classList.remove("swarm-pending");
      if (t.kind === "container") {
        t.painted = m.painted;
        if (!t.painted) {
          unstyle(t);
          const hb = ov(t, "swarm-box held");
          pos(hb, tr.left, tr.top, tr.width, tr.height);
          t.heldBox = hb;
        }
        t.state = "open";
        queueMicrotask(pump);
        return;
      }
      // 小元件：放下後把文字重新打一次
      const lines = lineBoxes(t.el);
      if (lines.length && t.bgOpaque) await stream(t, c, { el: t.el, lines, er: tr, cover: t.bg });
      finishTask(t);
    };

    // 從左側尺規拉出紅色參考線
    const jobGuide = async (g, c) => {
      const vx = window.scrollX + 9;
      const y = clamp(g.top, window.scrollY + 40, window.scrollY + window.innerHeight - 40);
      mode(c, "arrow");
      await fly(c, vx, y);
      chk(g);
      click(c);
      const line = ov(g, "swarm-guide");
      pos(line, vx, g.top - 60, undefined, g.bottom - g.top + 120);
      const lab = ov(g, "swarm-guide-label");
      await animate(320, (k) => {
        const x = vx + (g.x - vx) * easeOut(k);
        line.style.left = `${x}px`;
        pos(lab, x + 6, y - 22);
        lab.textContent = `x ${Math.round(x - window.scrollX)}`;
        c.x = x;
        c.y = y;
        place(c);
      });
      chk(g);
      g.line = line;
      g.state = "drawn";
      log("guide", "align", `x ${Math.round(g.x - window.scrollX)}`);
      setTimeout(() => kill(g, lab, 300), 500);
      queueMicrotask(pump);
    };

    // ================================================================ 排程
    const ready = (t) => {
      if (!t.block.active || t.state === "done") return false;
      if (t.kind === "guide") return t.state === "pending";
      if (t.parent && t.parent.state !== "open" && t.parent.state !== "done") return false;
      if (t.state === "open")
        return t.kind === "container" && !t.painted && !t.paintClaimed && t.children.every((ch) => ch.state === "done")
          ? "paint"
          : false;
      if (t.state !== "pending") return false;
      if (t.dupOf) {
        const m = t.dupOf;
        if (t.kind === "leafbox" ? m.state !== "done" : m.state !== "open" && m.state !== "done") return false;
      }
      return "build";
    };

    let pumping = false;
    const pump = () => {
      if (!alive || pumping) return;
      pumping = true;
      for (const t of tasks) {
        // 已上色的容器，子元素都完成就收尾（不需要游標）
        if (t.state === "open" && t.painted && t.children.every((ch) => ch.state === "done")) {
          finishTask(t);
          continue;
        }
        const r = ready(t);
        if (!r) continue;
        if (t.kind === "icon") {
          finishTask(t, true);
          continue;
        }
        const a = t.kind === "guide" ? { left: window.scrollX + 9, top: t.top } : pageRect(t.el);
        const c = getCursor(a.left, a.top);
        if (!c) break;
        let job;
        if (r === "paint") {
          t.paintClaimed = true;
          job = jobPaint;
        } else {
          t.state = "claimed";
          job =
            t.kind === "guide" ? jobGuide
            : t.dupOf ? jobDup
            : { container: jobContainer, leafbox: jobLeaf, text: jobText, media: jobMedia }[t.kind];
        }
        busy++;
        job(t, c)
          .catch((e) => {
            if (e !== CANCEL) {
              console.error(e);
              finishTask(t, true); // 出錯就直接顯示，不讓內容卡住
            }
          })
          .finally(() => {
            busy--;
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
          b.guides.forEach((g) => finishTask(g));
          b.tasks.forEach((t) => finishTask(t, true));
          pump();
        }, deadlineOf(b.tasks.length))
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
      clearInterval(logTimer);
      tasks.forEach((t) => {
        finishTask(t);
        t.el?.classList.remove("swarm-pop");
      });
      layer.remove();
      blocks.forEach((b) => b.el.classList.remove("swarm-managed"));
      root.classList.remove("swarm-on");
    };
  }, [variant]);

  return null;
}
