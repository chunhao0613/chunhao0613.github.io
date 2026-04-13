"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";

// 性能優化：CSS Variables 追蹤滑鼠座標，避免 React 高頻重新渲染
const useMouseTracking = () => {
  const rafRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
        document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
};

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
      className={`transition-all duration-1000 ease-out ${
        isVisible ? visibleClass : initialClass
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function Home() {
  const [isHovering, setIsHovering] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [time, setTime] = useState("");
  const [fps, setFps] = useState(0);
  const [clickRipples, setClickRipples] = useState([]);
  const sidebarOpenTimerRef = useRef(null);
  const sidebarCloseTimerRef = useRef(null);

  // 初始化滑鼠追蹤（性能優化）
  useMouseTracking();

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
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0;
      setScrollProgress(scroll);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
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

  const openSidebar = useCallback(() => {
    if (sidebarCloseTimerRef.current) {
      clearTimeout(sidebarCloseTimerRef.current);
      sidebarCloseTimerRef.current = null;
    }

    if (isSidebarOpen) {
      return;
    }

    if (sidebarOpenTimerRef.current) {
      clearTimeout(sidebarOpenTimerRef.current);
    }

    sidebarOpenTimerRef.current = setTimeout(() => {
      setIsSidebarOpen(true);
      sidebarOpenTimerRef.current = null;
    }, 80);
  }, [isSidebarOpen]);

  const closeSidebar = useCallback(() => {
    if (sidebarOpenTimerRef.current) {
      clearTimeout(sidebarOpenTimerRef.current);
      sidebarOpenTimerRef.current = null;
    }

    if (sidebarCloseTimerRef.current) {
      clearTimeout(sidebarCloseTimerRef.current);
    }

    sidebarCloseTimerRef.current = setTimeout(() => {
      setIsSidebarOpen(false);
      sidebarCloseTimerRef.current = null;
    }, 120);
  }, []);

  useEffect(() => {
    return () => {
      if (sidebarOpenTimerRef.current) clearTimeout(sidebarOpenTimerRef.current);
      if (sidebarCloseTimerRef.current) clearTimeout(sidebarCloseTimerRef.current);
    };
  }, []);

  return (
    <div
      data-theme={isDarkMode ? "dark" : "light"}
      className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-zinc-800 selection:text-white relative overflow-hidden transition-colors duration-500"
    >
      <div
        className="fixed inset-y-0 left-0 w-8 md:w-12 z-40"
        onMouseEnter={openSidebar}
        onMouseLeave={closeSidebar}
      />

      <div className="fixed top-6 right-6 z-50 flex items-center gap-3 font-mono text-[10px] sm:text-xs text-zinc-500 pointer-events-none">
        <div className="flex items-center gap-3 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50 backdrop-blur-md pointer-events-auto shadow-lg">
          <Activity size={14} className="text-green-500 animate-pulse" />
          <span className="text-green-400 w-12">FPS: {fps}</span>
          <span className="w-[1px] h-3 bg-zinc-700"></span>
          <span className="w-16 text-center">{time}</span>
        </div>
        <button
          aria-label="切換白天/黑夜模式"
          onClick={() => setIsDarkMode(!isDarkMode)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="p-2.5 bg-zinc-900/50 border border-zinc-800/50 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all backdrop-blur-md hover:scale-110 pointer-events-auto shadow-lg"
          title="切換白天/黑夜模式"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <button
        aria-label="開啟選單"
        onClick={() => setIsSidebarOpen(true)}
        onMouseEnter={() => {
          handleMouseEnter();
          openSidebar();
        }}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-6 left-6 z-40 p-3 bg-zinc-900/50 border border-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all backdrop-blur-md ${
          isSidebarOpen
            ? "opacity-0 scale-90 pointer-events-none"
            : "opacity-100 hover:scale-110 shadow-lg"
        }`}
      >
        <Menu size={20} />
      </button>

      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-500 ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
        onMouseEnter={() => {
          if (sidebarCloseTimerRef.current) {
            clearTimeout(sidebarCloseTimerRef.current);
            sidebarCloseTimerRef.current = null;
          }
        }}
      />
      <div
        onMouseEnter={openSidebar}
        onMouseLeave={closeSidebar}
        className={`fixed top-0 left-0 h-full w-full sm:w-80 bg-zinc-950 border-r border-zinc-800 z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col p-8 ${
          isSidebarOpen
            ? "translate-x-0 shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
            : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-16">
          <span className="font-mono text-sm text-zinc-500 border border-zinc-800 px-3 py-1 rounded-full tracking-widest">
            MENU
          </span>
          <button
            aria-label="關閉選單"
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-zinc-500 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-8">
          {[
            { name: "關於我", href: "#about", id: "01" },
            { name: "個人專案", href: "#projects", id: "02" },
            { name: "技術筆記", href: "#blog", id: "03" },
            { name: "聯絡資訊", href: "#contact", id: "04" },
          ].map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className="group flex items-center gap-4 text-xl md:text-2xl font-bold text-zinc-400 hover:text-white transition-all"
            >
              <span className="font-mono text-sm text-zinc-600 group-hover:text-zinc-400 transition-colors">
                {item.id}
              </span>
              <span className="group-hover:translate-x-2 transition-transform duration-300">
                {item.name}
              </span>
            </a>
          ))}
        </nav>
      </div>

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
        [data-theme="light"] .bg-zinc-900\\/50, 
        [data-theme="light"] .bg-zinc-900\\/40 { background-color: rgba(255,255,255,0.7); }
        [data-theme="light"] .bg-zinc-800 { background-color: #e2e8f0; }
        [data-theme="light"] .text-zinc-200 { color: #1e293b; }
        [data-theme="light"] .text-zinc-300 { color: #334155; }
        [data-theme="light"] .text-zinc-400 { color: #475569; }
        [data-theme="light"] .text-zinc-500 { color: #64748b; }
        [data-theme="light"] .text-zinc-600 { color: #94a3b8; }
        [data-theme="light"] .text-zinc-700 { color: #cbd5e1; }
        [data-theme="light"] .border-zinc-800 { border-color: #e2e8f0; }
        [data-theme="light"] .border-zinc-800\\/50 { border-color: rgba(226, 232, 240, 0.5); }
        [data-theme="light"] .border-zinc-900 { border-color: #cbd5e1; }
        [data-theme="light"] .border-zinc-700 { border-color: #94a3b8; }
        [data-theme="light"] .bg-white { background-color: #0f172a; color: #ffffff; }
        [data-theme="light"] .text-black { color: #ffffff; }
        [data-theme="light"] .hover\\:text-white:hover,
        [data-theme="light"] .group:hover .group-hover\\:text-white { color: #0f172a; }
        [data-theme="light"] .group:hover .group-hover\\:text-zinc-200 { color: #1e293b; }
        [data-theme="light"] .hover\\:bg-zinc-800:hover,
        [data-theme="light"] .group:hover .group-hover\\:bg-zinc-800 { background-color: #f1f5f9; }
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
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-zinc-500 to-zinc-100 z-50 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
        style={{ width: `${scrollProgress * 100}%` }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${
            isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"
          }, transparent 40%)`,
        }}
      />
      <div
        className={`pointer-events-none fixed z-50 rounded-full border border-white/50 mix-blend-difference transition-all duration-300 ease-out hidden md:flex items-center justify-center ${
          isHovering ? "w-16 h-16 bg-white/20" : "w-8 h-8 bg-transparent"
        }`}
        style={{
          transform: `translate(calc(var(--mouse-x, 50%) - ${isHovering ? 32 : 16}px), calc(var(--mouse-y, 50%) - ${isHovering ? 32 : 16}px))`,
        }}
      >
        <div
          className={`w-1 h-1 bg-white rounded-full transition-opacity duration-300 ${
            isHovering ? "opacity-100" : "opacity-0"
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
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight mb-4">
                  Hi, 我是
                  <br />
                  余駿豪{" "}
                  <span className="text-3xl md:text-5xl text-zinc-500 font-medium tracking-normal">
                    / 鮭魚
                  </span>
                </h1>
                <h2 className="text-2xl md:text-3xl text-zinc-400 font-medium mb-8">
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
              <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-6 font-mono text-sm shadow-2xl relative group w-full lg:max-w-md ml-auto">
                <div className="flex gap-2 mb-4 border-b border-zinc-800 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="text-green-400 mb-2">➜ ~ cat profile.json</div>
                <pre className="text-zinc-300 overflow-x-auto">
                  <code>{`{
  "name": "Chun-Hao Yu (鮭魚)",
  "education": "MCU-CSIE",
  "skills": {
    "languages": ["C++", "Java", "Python", "PHP"],
    "ai_tech": ["RAG", "LangChain", "LLM API"],
    "domain": ["System Analysis", "SRS", "IOTA"],
    "tools": ["Git", "RESTful API"]
  },
  "mindset": ["Curiosity", "Innovation"]
}`}</code>
                </pre>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="projects" className="py-32 border-b border-zinc-900">
          <Reveal>
            <div className="flex items-center gap-3 mb-20">
              <Code className="text-zinc-500" />
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                個人專案
              </h2>
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
                    className={`relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 aspect-[4/3] ${
                      idx % 2 !== 0 ? "md:order-2" : ""
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 group-hover:scale-105 transition-transform duration-700 ease-out flex items-center justify-center mix-blend-overlay">
                      <span className="text-zinc-700 font-mono text-sm tracking-widest">
                        {project.img}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`flex flex-col justify-center ${
                      idx % 2 !== 0 ? "md:order-1" : ""
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

        <section id="blog" className="py-32 border-b border-zinc-900">
          <Reveal type="slide-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 flex items-center gap-3">
              <BookOpen className="text-zinc-500" /> 技術筆記
            </h2>
            <p className="text-zinc-400 mb-12 max-w-2xl">
              除了寫程式，我也會把踩坑過程和學習心得記下來。這不只幫我整理思路，也希望能讓遇到同樣問題的人少走一點彎路。
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "如何將複雜的系統架構轉化為易懂的交接文件",
                date: "Apr 11, 2026",
                excerpt: "整理我怎麼把系統設計、圖表與交接內容整理成團隊一看就能接手的文件。",
                href: "/blog/architecture-documentation",
              },
              {
                title: "初探 LangChain：打造個人化的 RAG 本地知識庫",
                date: "Apr 05, 2026",
                excerpt: "從需求、索引到問答流程，一步步把 RAG 做成可以實際操作的網頁服務。",
                href: "/blog/langchain-rag",
              },
              {
                title: "物聯網安全：為什麼我們在智慧家居專題選擇 IOTA？",
                date: "Apr 08, 2026",
                excerpt: "記錄在智慧家居專題裡，為什麼最後選擇 IOTA 的 Tangle，而不是傳統區塊鏈。",
                href: "/blog/smart-home-security",
              },
              {
                title: "從需求到實作：SRS 軟體需求規格書撰寫指南",
                date: "Apr 02, 2026",
                excerpt: "把需求寫清楚、寫完整，讓開發團隊和利害關係人有一致的理解。",
                href: "/blog/srs-guide",
              },
            ].map((post, idx) => (
              <Reveal key={idx} delay={idx * 100} type="fade-up">
                <a
                  href={post.href}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="group flex h-full min-h-[240px] flex-col justify-between bg-zinc-900/20 border border-zinc-800/50 hover:border-zinc-600 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-900/35"
                >
                  <div>
                    <span className="text-xs font-mono text-zinc-500 mb-4 block">
                      {post.date}
                    </span>
                    <h3 className="text-xl font-bold text-zinc-300 group-hover:text-white transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-zinc-400 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                    <span>閱讀文章</span>
                    <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="contact" className="py-32 text-center relative">
          <Reveal type="scale">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8 relative z-10">
              準備好聊聊了嗎？
            </h2>
            <p className="text-zinc-400 mb-12 max-w-lg mx-auto relative z-10 text-lg">
              我目前正在尋找前端工程師的全職機會。如果你覺得我的經歷和技能符合團隊需求，歡迎直接用
              Email 找我聊聊。
            </p>

            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=chunhao0613@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="inline-flex items-center gap-3 bg-zinc-200 text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform"
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
                <GitBranch size={20} />
                <span>GitHub</span>
              </a>
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  );
}
