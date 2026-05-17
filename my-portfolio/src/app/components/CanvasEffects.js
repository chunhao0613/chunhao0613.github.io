"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

// Effect 3: Premium Ambient Glow Background (GPU-Accelerated CSS Orbs)
export const AmbientBackground = ({ isDarkMode }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Glow Orb 1 - Top Left */}
      <div 
        className={`absolute w-[45vw] h-[45vw] rounded-full filter blur-[120px] mix-blend-screen opacity-[0.22] animate-ambient-glow-1 ${
          isDarkMode ? "bg-blue-600/20" : "bg-sky-400/25"
        }`}
        style={{
          top: "-15%",
          left: "-15%",
        }}
      />
      {/* Glow Orb 2 - Bottom Right */}
      <div 
        className={`absolute w-[50vw] h-[50vw] rounded-full filter blur-[140px] mix-blend-screen opacity-[0.18] animate-ambient-glow-2 ${
          isDarkMode ? "bg-purple-600/15" : "bg-purple-400/20"
        }`}
        style={{
          bottom: "-25%",
          right: "-15%",
        }}
      />
      {/* Glow Orb 3 - Center Right */}
      <div 
        className={`absolute w-[35vw] h-[35vw] rounded-full filter blur-[100px] mix-blend-screen opacity-[0.2] animate-ambient-glow-3 ${
          isDarkMode ? "bg-emerald-600/15" : "bg-emerald-400/20"
        }`}
        style={{
          top: "35%",
          left: "45%",
        }}
      />
    </div>
  );
};

// Effect 1: Elegant Wave / Ripple Text
export const WaveText = ({ text, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className={`inline-flex ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
          style={{
            display: char === " " ? "inline" : "inline-block",
            transform: isHovered ? "translateY(-4px) scale(1.05)" : "translateY(0) scale(1)",
            transitionDelay: isHovered ? `${i * 20}ms` : "0ms",
            color: isHovered ? "#4ade80" : "inherit", // emerald-400
            textShadow: isHovered ? "0 4px 12px rgba(74, 222, 128, 0.4)" : "none",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
};

// Effect 4: Text Deconstruction on Scroll
export const DeconstructTitle = ({ children, className = "" }) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [randomTransforms, setRandomTransforms] = useState([]);

  useEffect(() => {
    setIsMounted(true);
    
    const text = typeof children === 'string' ? children : '';
    const transforms = text.split('').map(() => ({
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
      rot: (Math.random() - 0.5) * 90,
      delay: Math.random() * 400
    }));
    setRandomTransforms(transforms);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [children]);

  const text = typeof children === 'string' ? children : '';
  if (!text) return <div className={className}>{children}</div>;

  return (
    <div ref={containerRef} className={`flex flex-wrap ${className}`}>
      {text.split('').map((char, i) => {
        if (char === ' ') return <span key={i} className="whitespace-pre"> </span>;
        
        const transform = randomTransforms[i] || { x: 0, y: 0, rot: 0, delay: 0 };
        
        return (
          <span
            key={i}
            className="inline-block transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)]"
            style={{
              transform: !isMounted || isVisible 
                ? 'translate(0px, 0px) rotate(0deg)' 
                : `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rot}deg)`,
              opacity: !isMounted || isVisible ? 1 : 0,
              transitionDelay: isMounted ? `${transform.delay}ms` : '0ms'
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

// 彩蛋：鮭魚點擊噴濺與表情符號魚 (Portal 座標修正版)
export const SalmonEasterEgg = ({ children }) => {
  const [clickCount, setClickCount] = useState(0);
  const [isPopped, setIsPopped] = useState(false);
  const [particles, setParticles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [shake, setShake] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  
  const spanRef = useRef(null);
  const fishPos = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const solidRects = useRef([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateSolidRects = useCallback(() => {
    const elements = document.querySelectorAll('h1, h2, h3, p, a, span:not(.pointer-events-none):not(#easter-egg-fish)');
    const rects = [];
    elements.forEach((el) => {
      if (el.contains(spanRef.current)) return;
      const r = el.getBoundingClientRect();
      if (r.width > 5 && r.height > 5) {
        rects.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
      }
    });
    solidRects.current = rects;
  }, []);

  useEffect(() => {
    if (isPopped) {
      updateSolidRects();
      window.addEventListener('scroll', updateSolidRects);
      window.addEventListener('resize', updateSolidRects);
    }
    return () => {
      window.removeEventListener('scroll', updateSolidRects);
      window.removeEventListener('resize', updateSolidRects);
    };
  }, [isPopped, updateSolidRects]);

  const createSplatter = useCallback(() => {
    if (!spanRef.current) return;
    const rect = spanRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const colors = ["#3b82f6", "#60a5fa", "#1d4ed8", "#93c5fd"];
    const newParticles = Array.from({ length: 15 }).map(() => ({
      id: Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1.0,
      size: Math.random() * 5 + 2
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  const handleClick = (e) => {
    if (isPopped) return;
    
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        const rect = spanRef.current.getBoundingClientRect();
        fishPos.current = { 
          x: rect.left + rect.width / 2 - 15, 
          y: rect.top + rect.height / 2 - 15, 
          vx: (Math.random() - 0.5) * 20, 
          vy: -18 
        };
        setIsPopped(true);
        return 5;
      }
      return next;
    });

    setShake(10);
    createSplatter();
    setTimeout(() => setShake(0), 100);
  };

  useEffect(() => {
    // 效能優化：如果沒有魚，且沒有任何粒子在跑，就完全不啟用 RAF 物理更新循環
    if (!isPopped && particles.length === 0) return;

    let rafId;
    const update = () => {
      let activeParticles = false;
      setParticles((prev) => {
        const next = prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.35,
          life: p.life - 0.025
        })).filter((p) => p.life > 0);
        if (next.length > 0) activeParticles = true;
        return next;
      });

      if (isPopped && !isDragging) {
        const p = fishPos.current;
        const fishSize = 28;
        p.vy += 0.85;
        p.vx *= 0.985;
        let nextX = p.x + p.vx;
        let nextY = p.y + p.vy;

        for (const rect of solidRects.current) {
          if (nextX + fishSize > rect.left && nextX < rect.right && p.y + fishSize <= rect.top && nextY + fishSize >= rect.top) {
            nextY = rect.top - fishSize;
            p.vy *= -0.35;
            p.vx *= 0.85;
            break;
          }
        }

        if (nextY > window.innerHeight - 50) { nextY = window.innerHeight - 50; p.vy *= -0.4; }
        if (nextX < 0 || nextX > window.innerWidth - 35) { p.vx *= -0.5; nextX = Math.max(0, Math.min(nextX, window.innerWidth - 35)); }

        p.x = nextX;
        p.y = nextY;

        const fishEl = document.getElementById("easter-egg-fish");
        if (fishEl) { fishEl.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.vx * 2.5}deg)`; }
      }

      // 只有當有魚或有粒子時，才繼續調度下一影格，否則優雅停止
      if (isPopped || activeParticles) {
        rafId = requestAnimationFrame(update);
      }
    };
    rafId = requestAnimationFrame(update);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isPopped, isDragging, particles.length === 0]);

  const handleMouseDown = (e) => {
    if (!isPopped) return;
    setIsDragging(true);
    const p = fishPos.current;
    dragOffset.current = { x: e.clientX - p.x, y: e.clientY - p.y };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const p = fishPos.current;
        const targetX = e.clientX - dragOffset.current.x;
        const targetY = e.clientY - dragOffset.current.y;
        p.vx = (targetX - p.x) * 0.45;
        p.vy = (targetY - p.y) * 0.45;
        p.x = targetX;
        p.y = targetY;
        const fishEl = document.getElementById("easter-egg-fish");
        if (fishEl) { fishEl.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.vx * 2.5}deg)`; }
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
  }, [isDragging]);

  const OverlayContent = (
    <>
      {particles.map((p) => (
        <div key={p.id} className="fixed pointer-events-none z-[999] rounded-full"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size, backgroundColor: p.color, opacity: p.life }}
        />
      ))}
      {isPopped && (
        <div id="easter-egg-fish" onMouseDown={handleMouseDown}
          className="fixed top-0 left-0 z-[1000] text-3xl cursor-grab active:cursor-grabbing select-none"
          style={{ willChange: 'transform', filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.3))', top: 0, left: 0 }}
        >
          🐟
        </div>
      )}
    </>
  );

  return (
    <>
      <span ref={spanRef} onClick={handleClick}
        className={`inline-block cursor-pointer select-none transition-all duration-75 active:scale-95 ${isPopped ? 'opacity-0 pointer-events-none' : ''}`}
        style={{
          transform: shake ? `translate(${(Math.random()-0.5)*shake}px, ${(Math.random()-0.5)*shake}px)` : 'none',
          color: clickCount > 0 ? `rgb(249, ${115 + (4 - clickCount) * 30}, 22)` : 'inherit'
        }}
      >
        {children}
      </span>
      {isMounted && createPortal(OverlayContent, document.body)}
    </>
  );
};
