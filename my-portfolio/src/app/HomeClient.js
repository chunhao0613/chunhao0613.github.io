"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
import { Menu, X, Activity, Sun, Moon } from "lucide-react";
import SwarmBuild from "./components/SwarmBuild";
import { HomeSection, featuredSlugs } from "./components/home/HomeBlocks";
import { NamedIcon } from "./components/home/icons";



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

// 左側環形選單：由 content/home.md 每一段的 menu／icon 產生，角度平均分布在 0–90 度
const buildMenu = (sections) => {
  const items = sections.filter((s) => s.menu);
  const step = items.length > 1 ? 90 / (items.length - 1) : 0;
  return items.map((s, i) => ({
    name: s.menu,
    href: `#${s.id}`,
    icon: <NamedIcon name={s.icon} size={20} />,
    angle: i * step,
  }));
};

export function HomeClient({ home, projects, posts }) {
  const menuItems = useMemo(() => buildMenu(home.sections), [home]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const sidebarOpenTimerRef = useRef(null);
  const sidebarCloseTimerRef = useRef(null);
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
          {isSidebarOpen && menuItems.map((item, idx) => {
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

      <MainContent home={home} projects={projects} posts={posts} />
    </div>
  );
}

// 首頁內容：依 content/home.md 的段落與區塊依序渲染（區塊元件在 components/home/HomeBlocks.js）
const MainContent = React.memo(({ home, projects, posts }) => {
  const featured = featuredSlugs(home.sections);
  return (
    <main className="relative z-10 max-w-6xl mx-auto px-6">
      {home.sections.map((section) => (
        <HomeSection key={section.id} section={section} projects={projects} posts={posts} featured={featured} />
      ))}
    </main>
  );
});
MainContent.displayName = "MainContent";
