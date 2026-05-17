"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
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
import { AmbientBackground, WaveText, DeconstructTitle, SalmonEasterEgg } from "./components/CanvasEffects";



const useScrollReveal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

const Reveal = ({
  children,
  delay = 0,
  className = "",
  type = "fade-up",
  triggerOnMount = false,
}) => {
  const { ref, isVisible: scrollVisible } = useScrollReveal();
  const [mountedVisible, setMountedVisible] = useState(false);

  useEffect(() => {
    if (triggerOnMount) {
      const timer = setTimeout(() => setMountedVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [triggerOnMount]);

  const isVisible = triggerOnMount ? mountedVisible : scrollVisible;

  let initialClass = "opacity-0 translate-y-12";
  if (type === "slide-left") initialClass = "opacity-0 -translate-x-16";
  if (type === "slide-right") initialClass = "opacity-0 translate-x-16";
  if (type === "scale") initialClass = "opacity-0 scale-90 translate-y-8";

  const visibleClass = "opacity-100 translate-y-0 translate-x-0 scale-100";

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${isVisible ? visibleClass : initialClass
        } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function Home() {
  const [isHovering, setIsHovering] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [time, setTime] = useState("");
  const [fps, setFps] = useState(0);
  const [clickRipples, setClickRipples] = useState([]);
  const sidebarOpenTimerRef = useRef(null);
  const sidebarCloseTimerRef = useRef(null);
  const blogScrollRef = useRef(null);
  const scrollProgressRef = useRef(null);
  const cursorRef = useRef(null);
  const glowRef = useRef(null);
  const mouseCoords = useRef({ x: 0, y: 0 });
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

    const handleMouseMove = (e) => {
      mouseCoords.current = { x: e.clientX, y: e.clientY };

      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const { x, y } = mouseCoords.current;

        // 性能極限優化：直接操縱特定 DOM Ref 的 Style 樣式，
        // 徹底避開在 documentElement 上設定全域 CSS Variables 造成瀏覽器對全網頁進行 synchronous style recalculation 的嚴重效能災難！
        if (glowRef.current) {
          glowRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, ${
            isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"
          }, transparent 40%)`;
        }

        if (cursorRef.current) {
          const size = isHovering ? 32 : 16;
          cursorRef.current.style.transform = `translate(${x - size}px, ${y - size}px)`;
        }

        rafId = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isDarkMode, isHovering]);

  const scrollBlog = useCallback((direction) => {
    if (blogScrollRef.current) {
      const { current } = blogScrollRef;
      const scrollAmount = window.innerWidth >= 768 ? current.clientWidth / 3 : current.clientWidth;
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);

  // 性能優化已移至 Ref 直操 useEffect 中

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("zh-TW", { hour12: false }));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId;

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
    calculateFps();

    return () => {
      clearInterval(timeInterval);
      cancelAnimationFrame(animationFrameId);
    };
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

  const handleMouseClick = useCallback((e) => {
    const newRipple = { x: e.clientX, y: e.clientY, id: Date.now() };
    setClickRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setClickRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1500);
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleMouseClick);
    return () => window.removeEventListener("click", handleMouseClick);
  }, [handleMouseClick]);

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

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  useEffect(() => {
    const handleProximity = (e) => {
      if (window.innerWidth < 768) return;
      const centerX = 56; 
      const centerY = 56;
      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      
      const triggerDist = 100; 
      const leaveDist = triggerDist * 2.2; // 2.2倍，確保能覆蓋徑向選單的範圍

      if (dist < triggerDist && !isSidebarOpen) {
        setIsSidebarOpen(true);
      } else if (dist > leaveDist && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("mousemove", handleProximity);
    return () => window.removeEventListener("mousemove", handleProximity);
  }, [isSidebarOpen]);

  useEffect(() => {
    return () => {
      if (sidebarOpenTimerRef.current) clearTimeout(sidebarOpenTimerRef.current);
      if (sidebarCloseTimerRef.current) clearTimeout(sidebarCloseTimerRef.current);
    };
  }, []);

  const toggleTheme = (e) => {
    if (!document.startViewTransition) {
      setIsDarkMode(!isDarkMode);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setIsDarkMode((prev) => !prev);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <div
      data-theme={isDarkMode ? "dark" : "light"}
      className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-zinc-800 selection:text-white relative overflow-hidden transition-colors duration-500"
    >
      <div
        className="fixed inset-y-0 left-0 w-8 md:w-12 z-40"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      />

      <div className="fixed top-6 right-6 z-50 flex items-center gap-3 font-mono text-[10px] sm:text-xs text-zinc-500 pointer-events-none">
        <div className="hidden sm:flex items-center gap-3 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50 backdrop-blur-md pointer-events-auto shadow-lg">
          <Activity size={14} className="text-green-500 animate-pulse" />
          <span className="text-green-400 w-12">FPS: {fps}</span>
          <span className="w-[1px] h-3 bg-zinc-700"></span>
          <span className="w-16 text-center">{time}</span>
        </div>
        <button
          aria-label="切換白天/黑夜模式"
          onClick={toggleTheme}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="p-2.5 bg-zinc-900/50 border border-zinc-800/50 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all backdrop-blur-md hover:scale-110 pointer-events-auto shadow-lg"
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
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`p-4 bg-zinc-900/80 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-all backdrop-blur-xl shadow-2xl relative z-50 ${
            isSidebarOpen ? "rotate-180 scale-110" : "hover:scale-110"
          }`}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* 選單項目的環繞佈局 */}
        <div className="absolute top-0 left-0 w-0 h-0">
          {[
            { name: "關於我", href: "#about", icon: <User size={20} />, angle: 0 },
            { name: "個人專案", href: "#projects", icon: <Code size={20} />, angle: 30 },
            { name: "技術筆記", href: "#blog", icon: <BookOpen size={20} />, angle: 60 },
            { name: "聯絡資訊", href: "#contact", icon: <Mail size={20} />, angle: 90 },
          ].map((item, idx) => {
            const radius = menuRadius;
            const rad = (item.angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <a
                key={idx}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`absolute flex items-center justify-center w-14 h-14 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-500 backdrop-blur-lg shadow-xl group ${
                  isSidebarOpen
                    ? "opacity-100 scale-100 translate-x-0 translate-y-0"
                    : "opacity-0 scale-0 pointer-events-none"
                }`}
                style={{
                  transform: isSidebarOpen
                    ? `translate(${x}px, ${y}px)`
                    : "translate(0, 0)",
                  transitionDelay: isSidebarOpen ? `${idx * 50}ms` : "0ms",
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
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500 ${
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
        [data-theme="light"] .bg-zinc-900\\/50, 
        [data-theme="light"] .bg-zinc-900\\/40 { background-color: rgba(255,255,255,0.7); }
        [data-theme="light"] .bg-zinc-800 { background-color: #e2e8f0; }
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
      <div
        ref={scrollProgressRef}
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-zinc-500 to-zinc-100 z-50 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)] w-0"
      />
      <AmbientBackground isDarkMode={isDarkMode} />
      <div
        ref={glowRef}
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      />
      <div
        ref={cursorRef}
        className={`pointer-events-none fixed z-50 rounded-full border border-white/50 mix-blend-difference transition-[width,height,background-color] duration-300 ease-out hidden md:flex items-center justify-center ${isHovering ? "w-16 h-16 bg-white/20" : "w-8 h-8 bg-transparent"
          }`}
        style={{
          transform: "translate(-100px, -100px)", // 初始置於視窗外
        }}
      >
        <div
          className={`w-1 h-1 bg-white rounded-full transition-opacity duration-300 ${isHovering ? "opacity-100" : "opacity-0"
            }`}
        />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6">
        <section
          id="about"
          className="min-h-screen flex items-center border-b border-zinc-900 pt-20"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
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
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    查看個人專案 <ArrowUpRight size={18} />
                  </a>
                  <a
                    href="#contact"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
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

          <div className="flex flex-col gap-32">
            {[
              {
                title: "安全智慧家居系統 (基於 IOTA)",
                desc: "專題製作。結合物聯網與區塊鏈概念，運用 IOTA 的 Tangle 網路特性，打造去中心化、高安全性的智慧家居控制平台，確保設備數據傳輸的安全與不可篡改性。",
                tags: ["IOTA", "C++", "IoT", "System Architecture"],
                year: "Apr 08, 2026",
                img: "[IOTA Smart Home Image]",
              },
              {
                title: "AI 知識庫系統 (RAG 架構)",
                desc: "整合 LangChain 框架與外部 LLM API，開發網站式的本地資料庫檢索生成系統。透過 RAG 技術，讓 AI 能基於本地機密或專屬資料進行精準回答，大幅提升專業性。",
                tags: ["Python", "LangChain", "RAG", "API Integration"],
                year: "Apr 05, 2026",
                img: "[RAG System Image]",
                link: "https://ragproject--chunhao0613.replit.app/",
                linkLabel: "開啟 RAG Demo",
              },
            ].map((project, idx) => {
              const CardTag = project.link ? "a" : "div";

              return (
                <Reveal
                  key={idx}
                  delay={0}
                  type={idx % 2 === 0 ? "slide-left" : "slide-right"}
                >
                  <CardTag
                    {...(project.link
                      ? {
                        href: project.link,
                        target: "_blank",
                        rel: "noopener noreferrer",
                      }
                      : {})}
                    className="group relative grid md:grid-cols-2 gap-12 items-center cursor-pointer"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div
                      className={`relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 aspect-[4/3] ${idx % 2 !== 0 ? "md:order-2" : ""
                        }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 group-hover:scale-105 transition-transform duration-700 ease-out flex items-center justify-center mix-blend-overlay">
                        <span className="text-zinc-700 font-mono text-sm tracking-widest">
                          {project.img}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`flex flex-col justify-center ${idx % 2 !== 0 ? "md:order-1" : ""
                        }`}
                    >
                      <p className="text-zinc-500 font-mono text-sm mb-4 border-l-2 border-zinc-700 pl-3">
                        {project.year}
                      </p>
                      <h3 className="text-3xl font-bold mb-6 group-hover:text-white transition-colors flex items-center gap-3">
                        {project.title}
                        <span className="p-2 bg-zinc-800/0 rounded-full group-hover:bg-zinc-800 transition-colors">
                          <ArrowUpRight
                            className="opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300"
                            size={20}
                          />
                        </span>
                      </h3>
                      <p className="text-zinc-400 mb-8 leading-relaxed text-lg">
                        {project.desc}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                        <span>{project.linkLabel || "查看連結"}</span>
                        <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </div>
                    </div>
                  </CardTag>
                </Reveal>
              );
            })}
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
              {[
                {
                  title: "從 0 到 1 的量化探索：在 WorldQuant 撰寫 Alpha 策略實戰",
                  date: "May 12, 2026",
                  excerpt: "紀錄我在 WorldQuant 平台上挖掘 Alpha 的過程，包含量化因子的思考邏輯與公式撰寫技巧。",
                  href: "/blog/worldquant-alpha",
                  image: "/covers/worldquant-alpha.png",
                },
                {
                  title: "如何將複雜的系統架構轉化為易懂的交接文件",
                  date: "Apr 11, 2026",
                  excerpt: "整理我怎麼把系統設計、圖表與交接內容整理成團隊一看就能接手的文件。",
                  href: "/blog/architecture-documentation",
                  image: "/covers/architecture.png",
                },
                {
                  title: "初探 LangChain：打造個人化的 RAG 本地知識庫",
                  date: "Apr 05, 2026",
                  excerpt: "從需求、索引到問答流程，一步步把 RAG 做成可以實際操作的網頁服務。",
                  href: "/blog/langchain-rag",
                  image: "/covers/langchain.png",
                },
                {
                  title: "物聯網安全：為什麼我們在智慧家居專題選擇 IOTA？",
                  date: "Apr 08, 2026",
                  excerpt: "記錄在智慧家居專題裡，為什麼最後選擇 IOTA 的 Tangle，而不是傳統區塊鏈。",
                  href: "/blog/smart-home-security",
                  image: "/covers/smart-home.png",
                },
                {
                  title: "從需求到實作：SRS 軟體需求規格書撰寫指南",
                  date: "Apr 02, 2026",
                  excerpt: "把需求寫清楚、寫完整，讓開發團隊和利害關係人有一致的理解。",
                  href: "/blog/srs-guide",
                  image: "/covers/srs.png",
                },
              ].map((post, idx) => (
                <Reveal 
                  key={idx} 
                  delay={idx * 100} 
                  type="fade-up" 
                  /* 一次 Focus 在三個內容：每個卡片寬度設為 33.33% 減去 gap */
                  className="w-full md:w-[calc(33.3333%-16px)] shrink-0 snap-start h-full"
                >
                  <Link
                    href={post.href}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="group/card flex flex-col h-full bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-600 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
                  >
                    {/* 照片放置區 */}
                    <div className="aspect-[16/9] w-full bg-zinc-950 relative overflow-hidden border-b border-zinc-800/50">
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent z-10 pointer-events-none" />
                      {post.image ? (
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out" 
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"; // 優雅降級：使用藝術抽象圖作為備份
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 group-hover/card:scale-105 transition-transform duration-700 ease-out bg-zinc-900">
                          <ImageIcon size={32} className="opacity-30 mb-2" />
                          <span className="font-mono text-xs tracking-wider opacity-50">IMAGE</span>
                        </div>
                      )}
                    </div>
                    
                    {/* 內文區 */}
                    <div className="p-6 flex flex-col flex-grow justify-between bg-zinc-900/20">
                      <div>
                        <span className="text-xs font-mono text-zinc-500 mb-3 block">
                          {post.date}
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
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
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
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
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
    </div>
  );
}
