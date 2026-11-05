"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { projects } from "../data/projects";
import {
  ArrowUpRight,
  GitBranch,
  Mail,
  BookOpen,
  Menu,
  X,
  Activity,
  Sun,
  Moon,
  Code,
  ChevronLeft,
  ChevronRight,
  User,
  Image as ImageIcon,
} from "lucide-react";
import { WaveText, DeconstructTitle, SalmonEasterEgg } from "./components/CanvasEffects";
import SwarmBuild from "./components/SwarmBuild";
import Reveal from "./components/Reveal";



const FPSStatusBar = () => {
  const [time, setTime] = useState("");
  const [fps, setFps] = useState(0);

  // 這個元件是 `hidden sm:flex`，手機上根本不顯示；而且分頁切到背景時
  // 也沒人在看。兩種情況都完全停掉計時器與 rAF，不做無謂的耗電。
  useEffect(() => {
    const wideEnough = window.matchMedia("(min-width: 640px)");
    let timeInterval = null;
    let animationFrameId = null;
    let frameCount = 0;
    let lastTime = 0;

    const updateTime = () => {
      setTime(new Date().toLocaleTimeString("zh-TW", { hour12: false }));
    };

    const calculateFps = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      animationFrameId = requestAnimationFrame(calculateFps);
    };

    const stop = () => {
      if (timeInterval !== null) clearInterval(timeInterval);
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      timeInterval = null;
      animationFrameId = null;
    };

    const sync = () => {
      const shouldRun = wideEnough.matches && !document.hidden;
      if (shouldRun === (animationFrameId !== null)) return;
      if (!shouldRun) {
        stop();
        return;
      }
      updateTime();
      timeInterval = setInterval(updateTime, 1000);
      frameCount = 0;
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(calculateFps);
    };

    sync();
    wideEnough.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      stop();
      wideEnough.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div className="hidden sm:flex items-center gap-3 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50 backdrop-blur-md pointer-events-auto shadow-lg">
      <Activity size={14} className="text-green-500 animate-pulse" />
      <span className="text-green-400 w-12">FPS: {fps}</span>
      <span className="w-[1px] h-3 bg-zinc-700"></span>
      <span className="w-16 text-center">{time}</span>
    </div>
  );
};

const ClickRippleContainer = () => {
  const [clickRipples, setClickRipples] = useState([]);

  useEffect(() => {
    const handleMouseClick = (e) => {
      const newRipple = { x: e.clientX, y: e.clientY, id: Date.now() };
      setClickRipples((prev) => [...prev, newRipple]);
      setTimeout(() => {
        setClickRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 1500);
    };

    window.addEventListener("click", handleMouseClick);
    return () => window.removeEventListener("click", handleMouseClick);
  }, []);

  return (
    <>
      {clickRipples.map((ripple) => (
        <div
          key={ripple.id}
          className="pointer-events-none fixed z-40 rounded-full border border-white/40 animate-ripple-click"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: "40px",
            height: "40px",
          }}
        />
      ))}
    </>
  );
};

// 靜態菜單資料，放在組件外部避免每次渲染重新建立
const MENU_ITEMS = [
  { name: "關於我", href: "#about", icon: <User size={20} />, angle: 0 },
  { name: "個人專案", href: "#projects", icon: <Code size={20} />, angle: 30 },
  { name: "技術筆記", href: "#blog", icon: <BookOpen size={20} />, angle: 60 },
  { name: "聯絡資訊", href: "#contact", icon: <Mail size={20} />, angle: 90 },
];

export function HomeClient({ posts }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const sidebarOpenTimerRef = useRef(null);
  const sidebarCloseTimerRef = useRef(null);
  const blogScrollRef = useRef(null);
  const scrollProgressRef = useRef(null);

  const [menuRadius, setMenuRadius] = useState(120);

  useEffect(() => {
    const handleResize = () => {
      setMenuRadius(window.innerWidth < 768 ? 85 : 120);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  const scrollBlog = useCallback((direction) => {
    if (blogScrollRef.current) {
      const { current } = blogScrollRef;
      // 一次翻一張卡片：卡片寬度＋卡片間距。用量的而不是容器寬度的 1/3，
      // 否則每次少 8px，只能靠捲動吸附硬拉回來，有些瀏覽器會看到偏移
      const card = current.firstElementChild;
      const gap = parseFloat(getComputedStyle(current).columnGap) || 0;
      const scrollAmount = card ? card.getBoundingClientRect().width + gap : current.clientWidth;
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    let rafId = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const totalScroll = document.documentElement.scrollTop;
        const windowHeight =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0;
        
        if (scrollProgressRef.current) {
          scrollProgressRef.current.style.width = `${scroll * 100}%`;
        }
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);



  // Escape 鍵關閉側欄（無障礙）
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  // 用 ref 讀取開關狀態，effect 才不會每次開關選單就重新註冊 listener；
  // 實際判定收斂到 rAF，一個影格最多算一次。
  const isSidebarOpenRef = useRef(isSidebarOpen);
  useEffect(() => {
    isSidebarOpenRef.current = isSidebarOpen;
  }, [isSidebarOpen]);

  useEffect(() => {
    let rafId = null;
    let lastX = 0;
    let lastY = 0;

    const evaluate = () => {
      rafId = null;
      if (window.innerWidth < 768) return;

      const centerX = 56;
      const centerY = 56;
      const dist = Math.hypot(lastX - centerX, lastY - centerY);

      const triggerDist = 100;
      const leaveDist = triggerDist * 2.2; // 2.2倍，確保能覆蓋徑向選單的範圍

      if (dist < triggerDist && !isSidebarOpenRef.current) {
        setIsSidebarOpen(true);
      } else if (dist > leaveDist && isSidebarOpenRef.current) {
        setIsSidebarOpen(false);
      }
    };

    const handleProximity = (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafId === null) rafId = requestAnimationFrame(evaluate);
    };

    window.addEventListener("mousemove", handleProximity, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleProximity);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (sidebarOpenTimerRef.current) clearTimeout(sidebarOpenTimerRef.current);
      if (sidebarCloseTimerRef.current) clearTimeout(sidebarCloseTimerRef.current);
    };
  }, []);

  const toggleTheme = useCallback((e) => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || calm) {
      setIsDarkMode((prev) => !prev);
      return;
    }

    // 圓心取按鈕本身的中心，而不是滑鼠座標：用鍵盤觸發時 clientX/clientY
    // 會是 0，波動會從畫面左上角冒出來，而不是使用者按的地方。
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // 圓心與半徑一律用百分比表示，不用 px。
    //
    // ::view-transition-new(root) 的盒子並不保證等於 CSS 像素的視窗大小
    // （在 devicePixelRatio > 1 的螢幕上會是裝置像素尺寸），用 px 指定會
    // 讓圓心偏掉、半徑也不夠長 —— 這正是先前波動跑到畫面中央、而且
    // 掃不到邊緣就結束的原因。百分比一律相對於偽元素自身的盒子解析，
    // 因此不管那個盒子實際是多少像素都會落在正確位置。
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const xPct = (x / vw) * 100;
    const yPct = (y / vh) * 100;

    // circle() 的百分比半徑是相對於 sqrt(w² + h²) / sqrt(2)。
    // 兩者等比例縮放，所以用視窗尺寸算出的百分比在任何盒子大小都成立。
    const maxDist = Math.max(
      Math.hypot(x, y),
      Math.hypot(vw - x, y),
      Math.hypot(x, vh - y),
      Math.hypot(vw - x, vh - y)
    );
    const refLen = Math.hypot(vw, vh) / Math.SQRT2;
    const endPct = (maxDist / refLen) * 100 * 1.05; // 多 5% 避免邊角留縫

    const transition = document.startViewTransition(() => {
      // 關鍵：startViewTransition 會在 callback 回傳後立刻拍下「新狀態」快照，
      // 但 React 的 setState 是非同步的 —— 不強制同步 flush 的話，拍到的
      // 新快照與舊快照完全相同，波動掃過去不會有任何變化，等 transition
      // 結束 React 才 re-render，於是整頁一次翻過去。
      flushSync(() => setIsDarkMode((prev) => !prev));
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0% at ${xPct}% ${yPct}%)`,
              `circle(${endPct}% at ${xPct}% ${yPct}%)`,
            ],
          },
          {
            duration: 700,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      // transition 被瀏覽器略過時（分頁在背景、連續快速點擊）ready 會 reject。
      // 主題本身已經切換完成，這裡只是沒有動畫，不需要處理，但必須接住，
      // 否則會產生 unhandled rejection。
      .catch(() => {});
  }, []);

  return (
    <div
      data-theme={isDarkMode ? "dark" : "light"}
      className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-zinc-800 selection:text-white relative overflow-hidden"
    >
      <SwarmBuild />
      <div className="design-grid" aria-hidden="true" />
      <div
        className="fixed inset-y-0 left-0 w-8 md:w-12 z-40"
      />

      <div className="fixed top-6 right-6 z-50 flex items-center gap-3 font-mono text-[10px] sm:text-xs text-zinc-500 pointer-events-none">
        <FPSStatusBar />
        <button
          aria-label="切換白天/黑夜模式"
          onClick={toggleTheme}
          className="p-2.5 bg-zinc-900/50 border border-zinc-800/50 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors duration-300 hover:scale-110 pointer-events-auto shadow-lg"
          title="切換白天/黑夜模式"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* 現代化環繞式選單 (Radial Menu) */}
      <div className="fixed top-6 left-6 z-50">
        <button
          aria-label={isSidebarOpen ? "關閉選單" : "開啟選單"}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-4 bg-zinc-900/80 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors transition-transform duration-300 shadow-2xl relative z-50 ${
              isSidebarOpen ? "rotate-180 scale-110" : "hover:scale-110"
            }`}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* 選單項目的環繞佈局 */}
        <div className="absolute top-0 left-0 w-0 h-0">
          {isSidebarOpen && MENU_ITEMS.map((item, idx) => {
            const radius = menuRadius;
            const rad = (item.angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <a
                key={idx}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className="absolute flex items-center justify-center w-14 h-14 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-opacity transition-transform duration-300 backdrop-blur-none shadow-xl"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
              >
                <div className="relative">
                  {item.icon}
                  <span className="absolute left-full ml-4 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {item.name}
                  </span>
                </div>
              </a>
            );
          })}

        </div>
      </div>

      {/* 背景遮罩 (當選單開啟時) */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <style>{`
        @keyframes ripple-click {
          0% { transform: scale(0.5); opacity: 0.8; border-width: 2px; }
          100% { transform: scale(6); opacity: 0; border-width: 0px; }
        }
        .animate-ripple-click {
          animation: ripple-click 1.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }

        [data-theme="light"].bg-zinc-950,
        [data-theme="light"] .bg-zinc-950 { background-color: #f8fafc; }
        [data-theme="light"] .bg-zinc-900 { background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        [data-theme="light"] .bg-zinc-900\\/90 { background-color: rgba(255, 255, 255, 0.95); }
        [data-theme="light"] .bg-zinc-900\\/80 { background-color: rgba(255, 255, 255, 0.85); }
        [data-theme="light"] .bg-zinc-900\\/30 { background-color: rgba(255,255,255,0.6); }
        [data-theme="light"] .bg-zinc-900\\/50, 
        [data-theme="light"] .bg-zinc-900\\/40 { background-color: rgba(255,255,255,0.7); }
        [data-theme="light"] .bg-zinc-800 { background-color: #e2e8f0; }
        [data-theme="light"] .text-zinc-100 { color: #020617; }
        [data-theme="light"].text-zinc-200, [data-theme="light"] .text-zinc-200 { color: #020617; }
        [data-theme="light"].text-zinc-300, [data-theme="light"] .text-zinc-300 { color: #0f172a; }
        [data-theme="light"].text-zinc-400, [data-theme="light"] .text-zinc-400 { color: #1e293b; }
        [data-theme="light"].text-zinc-500, [data-theme="light"] .text-zinc-500 { color: #334155; }
        [data-theme="light"].text-zinc-600, [data-theme="light"] .text-zinc-600 { color: #475569; }
        [data-theme="light"].text-zinc-700, [data-theme="light"] .text-zinc-700 { color: #64748b; }
        [data-theme="light"] .border-zinc-800 { border-color: #cbd5e1; }
        [data-theme="light"] .border-zinc-800\\/50 { border-color: rgba(203, 213, 225, 0.5); }
        [data-theme="light"] .border-zinc-900 { border-color: #94a3b8; }
        [data-theme="light"] .border-zinc-700 { border-color: #64748b; }
        [data-theme="light"] .bg-white { background-color: #0f172a; color: #ffffff; }
        [data-theme="light"] .text-black { color: #ffffff; }
        [data-theme="light"] .hover\\:text-white:hover,
        [data-theme="light"] .group:hover .group-hover\\:text-white { color: #020617; }
        [data-theme="light"] .group:hover .group-hover\\:text-zinc-200 { color: #020617; }
        [data-theme="light"] .hover\\:bg-zinc-800:hover,
        [data-theme="light"] .group:hover .group-hover\\:bg-zinc-800 { background-color: #f1f5f9; }
        [data-theme="light"] .animate-ripple-click { border-color: rgba(113, 113, 122, 0.35); }

      `}</style>

      <ClickRippleContainer />
      <div
        ref={scrollProgressRef}
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-zinc-500 to-zinc-100 z-50 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)] w-0"
      />

      <MainContent posts={posts} scrollBlog={scrollBlog} blogScrollRef={blogScrollRef} />
    </div>
  );
}

const MainContent = React.memo(({ posts, scrollBlog, blogScrollRef }) => {
  return (
    <main className="relative z-10 max-w-6xl mx-auto px-6">
      <section
        id="about"
        className="min-h-screen flex items-center border-b border-zinc-900 pt-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full [&>*]:min-w-0">
          <div>
            <Reveal type="slide-left" triggerOnMount={true}>
              <p className="text-zinc-500 font-mono text-sm mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Available for new opportunities
              </p>
            </Reveal>
            <Reveal delay={100} type="fade-up" triggerOnMount={true}>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight mb-4 font-handwriting">
                Hi, 我是
                <br />
                余駿豪{" "}
                <span className="text-3xl md:text-5xl text-zinc-500 font-medium tracking-normal font-handwriting">
                  / <SalmonEasterEgg>鮭魚</SalmonEasterEgg>
                </span>
              </h1>
              <h2 className="text-2xl md:text-3xl text-zinc-400 font-medium mb-8 font-handwriting tracking-wide">
                軟體開發者 / MCU-CSIE
              </h2>
            </Reveal>
            <Reveal delay={200} type="fade-up" triggerOnMount={true}>
              <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-lg">
                我對開發一直保持好奇，也習慣把想法做成能驗證的成果。擅長把複雜技術整理成好閱讀的架構與交接文件，包含嚴謹的
                SRS 與系統分析。技術範圍從 AI RAG 應用到區塊鏈智慧家居，持續把點子落地成能解決真實問題的方案。
              </p>
            </Reveal>
            <Reveal delay={300} type="fade-up" triggerOnMount={true}>
              <div className="flex gap-4 items-center">
                <a
                  href="#projects"
                  className="bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2"
                >
                  查看個人專案 <ArrowUpRight size={18} />
                </a>
                <a
                  href="#contact"
                  className="text-zinc-400 hover:text-white px-6 py-3 transition-colors font-medium"
                >
                  聯絡我
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={400} type="scale" triggerOnMount={true}>
            <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-6 md:p-8 font-mono text-sm shadow-2xl relative group w-full lg:max-w-2xl ml-auto">
              <div className="flex gap-2 mb-4 border-b border-slate-800 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-emerald-400 mb-2">➜ ~ cat profile.json</div>
              <pre className="text-slate-300 overflow-x-auto leading-relaxed">
                <code>
                  {`{\n`}
                  {`  `}<span className="text-sky-400">"name"</span>: <WaveText text='"Chun-Hao Yu (鮭魚)"' className="text-white" />,{`\n`}
                  {`  `}<span className="text-sky-400">"education"</span>: <WaveText text='"MCU-CSIE"' className="text-white" />,{`\n`}
                  {`  `}<span className="text-sky-400">"skills"</span>: {`{\n`}
                  {`    `}<span className="text-sky-400">"languages"</span>: [<WaveText text='"C++"' className="text-white" />, <WaveText text='"Java"' className="text-white" />, <WaveText text='"Python"' className="text-white" />, <WaveText text='"PHP"' className="text-white" />],{`\n`}
                  {`    `}<span className="text-sky-400">"ai_tech"</span>: [<WaveText text='"RAG"' className="text-white" />, <WaveText text='"LangChain"' className="text-white" />, <WaveText text='"LLM API"' className="text-white" />],{`\n`}
                  {`    `}<span className="text-sky-400">"domain"</span>: [<WaveText text='"System Analysis"' className="text-white" />, <WaveText text='"SRS"' className="text-white" />, <WaveText text='"IOTA"' className="text-white" />],{`\n`}
                  {`    `}<span className="text-sky-400">"tools"</span>: [<WaveText text='"Git"' className="text-white" />, <WaveText text='"RESTful API"' className="text-white" />]{`\n`}
                  {`  }`},{`\n`}
                  {`  `}<span className="text-sky-400">"mindset"</span>: [<WaveText text='"Curiosity"' className="text-white" />, <WaveText text='"Innovation"' className="text-white" />]{`\n`}
                  {`}`}
                </code>
              </pre>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="projects" className="py-32 border-b border-zinc-900">
        <Reveal>
          <div className="flex items-center gap-3 mb-20">
            <Code className="text-zinc-500" />
            <DeconstructTitle className="text-3xl md:text-4xl font-bold tracking-tight">
              個人專案
            </DeconstructTitle>
          </div>
        </Reveal>

        <Reveal type="fade-up">
          <article className="mb-24 rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <div className="grid lg:grid-cols-[1.1fr_1fr]">
              <Link href="/blog/novacut-ai-workflow" className="group relative block bg-zinc-950 aspect-[16/10] lg:aspect-auto overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-800">
                <img
                  src="/covers/novacut.webp"
                  alt="NovaCut 瀏覽器影片剪輯器畫面"
                  width={1200}
                  height={750}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-left-top group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              </Link>
              <div className="p-8 md:p-10 flex flex-col">
                <p className="text-zinc-500 font-mono text-sm mb-4 border-l-2 border-zinc-700 pl-3">
                  精選專案 · Oct – Nov 2026
                </p>
                <h3 className="text-3xl font-bold mb-4">NovaCut：瀏覽器本機影片剪輯器</h3>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  與 AI 協作，兩週內從零做出全本機、免費、免安裝的剪輯網站。我負責定方向、排優先順序、做技術取捨與驗收；AI 負責研究、實作與測試。每個功能都用有標準答案的測試量測，不接受「應該可以」。
                </p>
                <dl className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    ["26 款", "競品功能矩陣"],
                    ["~7,400 行", "30 個模組"],
                    ["18×", "AI 去背匯出加速"],
                    ["0.17 ms", "人聲處理對齊誤差"],
                  ].map(([value, label]) => (
                    <div key={label} className="border-l-2 border-zinc-700 pl-3">
                      <dt className="text-xl font-bold text-zinc-100 font-mono">{value}</dt>
                      <dd className="text-xs text-zinc-500 mt-1">{label}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-wrap gap-2 mb-8">
                  {["WebCodecs", "WebGL2", "Web Audio", "transformers.js", "GitHub Actions"].map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex flex-wrap gap-3">
                  <Link href="/blog/novacut-ai-workflow" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-colors">
                    閱讀案例：問題怎麼被發現與解決 <ArrowUpRight size={16} />
                  </Link>
                  <a href="https://chunhao0613.github.io/novacut/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors">
                    線上試用 <ArrowUpRight size={16} />
                  </a>
                  <a href="https://github.com/chunhao0613/novacut" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors">
                    <GitBranch size={16} /> 原始碼
                  </a>
                </div>
              </div>
            </div>
          </article>
        </Reveal>

        <Reveal type="fade-up">
          <div className="mb-32">
            <h3 className="text-2xl font-bold mb-3">我和 AI 的協作方式</h3>
            <p className="text-zinc-400 mb-10 max-w-3xl leading-relaxed">
              AI 寫程式很快，但也會很有自信地寫錯。我的角色是把模糊的目標變成可驗證的範圍，並設計出有標準答案的測試，讓結果自己證明對錯。
            </p>
            <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ["定義限制", "先決定不能妥協的原則（本機處理、免費、無浮水印），之後每個技術選擇都拿它來判斷。"],
                ["先研究再動手", "讓 AI 平行調查開源專案與 26 款競品，產出功能矩陣，我依缺口決定優先順序。"],
                ["小批交付", "每批只做 3–5 個功能，做完就驗收、更新文件，降低一次改壞的範圍。"],
                ["用數據驗收", "合成 440 Hz 純音、120 BPM 鼓聲、已知軌跡的方塊當標準答案；甚至用 Whisper 把 AI 語音辨識回文字比對。"],
                ["追到根因", "不接受「已知限制」。變速變調就自己實作 WSOLA；匯出全黑就讀回影格查像素，找到 1×1 圖層的真正原因。"],
                ["回到使用者", "定期以新使用者身分走一遍流程，把「不好用」變成具體、可排序的問題清單。"],
              ].map(([title, desc], i) => (
                <li key={title} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30">
                  <span className="font-mono text-xs text-zinc-500">{String(i + 1).padStart(2, "0")}</span>
                  <h4 className="text-lg font-bold mt-2 mb-2 text-zinc-100">{title}</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <Reveal type="fade-up">
          <h3 className="text-2xl font-bold mb-3">其他專案</h3>
          <p className="text-zinc-400 mb-10 max-w-3xl leading-relaxed">
            每個專案都標出「我負責的部分」：程式碼由 AI 協作產出，我負責拆需求、定規格、做架構與技術選型，並寫交接文件讓工作能被接手。
          </p>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Reveal key={project.title} type="fade-up">
              <article className="h-full flex flex-col p-8 rounded-3xl border border-zinc-800 bg-zinc-900/30">
                <p className="text-zinc-500 font-mono text-xs mb-3 border-l-2 border-zinc-700 pl-3">{project.period}</p>
                <h4 className="text-2xl font-bold mb-3 text-zinc-100">{project.title}</h4>
                <p className="text-zinc-200 mb-3 leading-relaxed">{project.positioning}</p>
                <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{project.desc}</p>
                <div className="text-sm text-zinc-400 mb-6 leading-relaxed border-l-2 border-zinc-600 pl-3">
                  <span className="font-mono text-xs text-zinc-500 block mb-1">我的角色</span>
                  {project.role}
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 font-mono">{tag}</span>
                  ))}
                </div>
                <div className="mt-auto flex flex-wrap gap-3">
                  {project.links.map((link) =>
                    link.internal ? (
                      <Link key={link.href} href={link.href} className="inline-flex items-center gap-1 text-sm text-zinc-300 hover:text-white transition-colors">
                        {link.label} <ArrowUpRight size={14} />
                      </Link>
                    ) : (
                      <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-zinc-300 hover:text-white transition-colors">
                        {link.label} <ArrowUpRight size={14} />
                      </a>
                    )
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="blog" className="py-32 border-b border-zinc-900 relative">
        <Reveal type="slide-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="text-3xl md:text-4xl font-bold tracking-tight mb-4 flex items-center gap-3">
                <BookOpen className="text-zinc-500" /> <DeconstructTitle>技術筆記</DeconstructTitle>
              </div>
              <p className="text-zinc-400 max-w-2xl">
                除了寫程式，我也會把踩坑過程和學習心得記下來。這不只幫我整理思路，也希望能讓遇到同樣問題的人少走一點彎路。
              </p>
            </div>
            
            {/* 電腦端方向鍵 */}
            <div className="hidden md:flex gap-3">
              <button 
                onClick={() => scrollBlog('left')}
                className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scrollBlog('right')}
                className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </Reveal>

        <div className="relative -mx-6 px-6">
          <div 
            ref={blogScrollRef}
            className="flex overflow-x-auto gap-6 pb-12 pt-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {posts.map((post, idx) => (
              <Reveal 
                key={post.slug} 
                delay={idx * 100} 
                type="fade-up" 
                className="w-full md:w-[calc(33.3333%-16px)] shrink-0 snap-start h-full"
              >
                <Link
                  href={post.href}
                  className="group/card flex flex-col h-full bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-600 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
                >
                  <div className="aspect-[16/9] w-full bg-zinc-950 relative overflow-hidden border-b border-zinc-800/50">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent z-10 pointer-events-none" />
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        width={800}
                        height={450}
                        // 前三張在首屏內，其餘延後載入
                        loading={idx < 3 ? "eager" : "lazy"}
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 group-hover/card:scale-105 transition-transform duration-700 ease-out bg-zinc-900">
                        <ImageIcon size={32} className="opacity-30 mb-2" />
                        <span className="font-mono text-xs tracking-wider opacity-50">IMAGE</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow justify-between bg-zinc-900/20">
                    <div>
                      <span className="text-xs font-mono text-zinc-500 mb-3 block">
                        {post.displayDate}
                      </span>
                      <h3 className="text-lg font-bold text-zinc-300 group-hover/card:text-white transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-xs font-medium text-zinc-400 group-hover/card:text-white transition-colors">
                      <span>閱讀文章</span>
                      <ArrowUpRight size={14} className="transition-transform duration-300 group-hover/card:translate-x-1 group-hover/card:-translate-y-1" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-32 text-center relative">
        <Reveal type="scale">
          <DeconstructTitle className="text-4xl md:text-5xl font-bold tracking-tighter mb-8 relative z-10 font-handwriting justify-center">
            準備好聊聊了嗎？
          </DeconstructTitle>
          <p className="text-zinc-400 mb-12 max-w-lg mx-auto relative z-10 text-lg font-handwriting tracking-wide">
            我目前正在尋找前端工程師的全職機會。如果你覺得我的經歷和技能符合團隊需求，歡迎直接用
            Email 找我聊聊。
          </p>

          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=chunhao0613@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
          >
            <Mail size={20} /> 發送 Email
          </a>

          <div className="mt-24 flex justify-center gap-6 relative z-10">
            <a
              href="https://github.com/chunhao0613"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub 個人頁面"
              className="inline-flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all font-medium"
              title="前往 GitHub 個人頁面"
            >
              <svg width="20" height="20" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor">
                <path d="M16 22.0268V19.1568C16.0375 18.68 15.9731 18.2006 15.811 17.7506C15.6489 17.3006 15.3929 16.8902 15.06 16.5468C18.2 16.1968 21.5 15.0068 21.5 9.54679C21.4997 8.15062 20.9627 6.80799 20 5.79679C20.4558 4.5753 20.4236 3.22514 19.91 2.02679C19.91 2.02679 18.73 1.67679 16 3.50679C13.708 2.88561 11.292 2.88561 8.99999 3.50679C6.26999 1.67679 5.08999 2.02679 5.08999 2.02679C4.57636 3.22514 4.54413 4.5753 4.99999 5.79679C4.03011 6.81549 3.49251 8.17026 3.49999 9.57679C3.49999 14.9968 6.79998 16.1868 9.93998 16.5768C9.61098 16.9168 9.35725 17.3222 9.19529 17.7667C9.03334 18.2112 8.96679 18.6849 8.99999 19.1568V22.0268" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M9 20.0267C6 20.9999 3.5 20.0267 2 17.0267" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
});
MainContent.displayName = "MainContent";
