"use client";

// 捲動進場的區塊。每個 Reveal 同時也是「AI 建造」效果的一個區塊（data-swarm）：
// 頁面上有 <SwarmBuild /> 時，區塊裡的內容會由游標一塊塊建造出來；
// 沒有 <SwarmBuild /> 的頁面（或手機、減少動態效果設定下）就是一般的淡入滑入。
// 注意：用了 Reveal 的頁面要放 <SwarmBuild />，否則首次載入時區塊會被開場腳本藏 3.5 秒。

import React, { useState, useEffect, useRef } from "react";

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
      data-swarm=""
      className={`transition-all duration-1000 ease-out ${isVisible ? visibleClass : initialClass
        } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default Reveal;
