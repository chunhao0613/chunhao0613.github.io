"use client";

import React, { useState } from "react";
import { ArrowLeft, Trophy, Activity, Award, Calculator, BookOpen, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BlogPost() {
  const router = useRouter();
  const [certIndex, setCertIndex] = useState(0);

  const certificates = [
    {
      id: 1,
      title: "Bronze Medal",
      desc: "WorldQuant 銅牌認證。",
      filename: "bronze_medal.webp"
    },
    {
      id: 2,
      title: "Silver Medal",
      desc: "WorldQuant 銀牌認證。",
      filename: "silver_medal.webp"
    },
    {
      id: 3,
      title: "Gold Medal",
      desc: "WorldQuant 金牌認證。",
      filename: "gold_medal.webp"
    },
    {
      id: 4,
      title: "Consultant",
      desc: "獲邀成為 WorldQuant 研究顧問的官方證明。",
      filename: "consultant_certificate.webp"
    }
  ];

  const nextCert = () => setCertIndex((prev) => (prev + 1) % certificates.length);
  const prevCert = () => setCertIndex((prev) => (prev - 1 + certificates.length) % certificates.length);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/#blog");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-12 transition-colors"
        >
          <ArrowLeft size={18} />
          回到上一頁
        </button>

        <article className="max-w-none">
          <header className="mb-12 border-b border-zinc-800 pb-10">
            <time className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              May 12, 2026
            </time>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-5 tracking-tight">
              從 0 到 1 的量化探索：在 WorldQuant 撰寫 Alpha 策略實戰
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl leading-relaxed">
              紀錄我在 WorldQuant Brain 平台上挖掘 Alpha 的歷程，分享如何將交易直覺抽象成數學模型，以及我在國際量化競賽 (IQC) 的實戰成果。
            </p>
          </header>

          {/* 榮譽與成績展示板塊 */}
          <section className="bg-gradient-to-br from-amber-500/10 to-zinc-900/40 border border-amber-500/20 rounded-xl p-8 mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Trophy size={160} className="text-amber-500" />
            </div>

            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="inline-flex items-center gap-2 text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
                  <Trophy size={18} />
                  <span className="font-bold tracking-wide">WorldQuant Gold Medal & IQC 競賽</span>
                </div>
                <div className="text-zinc-400 text-sm px-4 py-2 border border-zinc-800 rounded-full bg-zinc-950/50">
                  Mar 17 - May 19, 2026 (CST)
                </div>
                <a
                  href="https://www.worldquantbrain.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-mono text-sm px-3 py-2 border border-sky-500/30 rounded-full bg-sky-500/10 transition-colors"
                >
                  WorldQuant Brain <ArrowUpRight size={14} />
                </a>
              </div>

              <h2 className="text-3xl font-bold mb-4 text-white">取得金牌殊榮，迎戰 IQC</h2>

              <p className="text-zinc-300 leading-relaxed max-w-2xl mb-4 text-lg">
                經過在平台上不斷的嘗試與優化，我成功取得了 WorldQuant 的金牌認證！目前我也正全力參與 IQC (International Quant Championship) 國際量化競賽，持續精進我的量化模型與策略。
              </p>

              <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-6 mb-8 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Activity size={100} className="text-sky-500" />
                </div>

                <div className="relative z-10">
                  <div className="mb-6 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 border-b border-zinc-800/50 pb-4">
                    <div className="text-sky-400 font-mono flex items-center gap-3 text-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
                      Team: &lt;Salmon&gt;
                    </div>
                    <div className="text-zinc-500 font-mono text-sm">
                      Last Updated: 5/11 11:14
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <div className="text-zinc-500 font-mono text-sm mb-1">Rank</div>
                      <div className="text-3xl font-bold text-white">4574</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 font-mono text-sm mb-1">IS Score</div>
                      <div className="text-3xl font-bold text-purple-400">8872</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 font-mono text-sm mb-1">D0 Score</div>
                      <div className="text-3xl font-bold text-sky-400">0</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 font-mono text-sm mb-1">D1 Score</div>
                      <div className="text-3xl font-bold text-emerald-400">8872</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid lg:grid-cols-2 gap-6 mb-12">
            {/* 抽象化思維 */}
            <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-6 flex flex-col justify-center">
              <div>
                <div className="inline-flex items-center gap-2 text-zinc-300 mb-4">
                  <Calculator size={18} />
                  <h2 className="text-xl font-bold">交易抽象化</h2>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  撰寫 Alpha 最具挑戰也最迷人的地方，在於「如何把觀察到的市場現象轉化為嚴謹的數學公式」。我擅長將行為金融學與市場異常現象提取成特徵，並透過 WorldQuant 的內建算子 (Operators) 將其具象化。
                </p>
              </div>
            </div>

            {/* 證書展示區 (輪播) */}
            <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-6 flex flex-col relative group/carousel">
              <div className="inline-flex items-center gap-2 text-zinc-300 mb-4">
                <Award size={18} />
                <h2 className="text-xl font-bold">證書</h2>
              </div>
              <div className="mb-6 h-12 overflow-hidden flex flex-col justify-center">
                <div className="text-zinc-200 font-bold mb-1">{certificates[certIndex].title}</div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {certificates[certIndex].desc}
                </p>
              </div>

              <div className="flex-grow bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 transition-colors rounded-lg flex flex-col items-center justify-center p-4 relative overflow-hidden group/img">
                {/* 直接套用真實的 img 標籤 */}
                <img
                  src={`/${certificates[certIndex].filename}`}
                  alt={certificates[certIndex].title}
                  className="absolute inset-0 w-full h-full object-contain z-10 p-2"
                  onError={(e) => {
                    // 如果圖片尚未放進資料夾，隱藏破圖並顯示提示
                    e.target.style.opacity = '0';
                    e.target.nextElementSibling.style.opacity = '1';
                  }}
                  onLoad={(e) => {
                    e.target.style.opacity = '1';
                    e.target.nextElementSibling.style.opacity = '0';
                  }}
                />

                {/* 找不到圖片時的提示文字 */}
                <div className="relative z-20 flex flex-col items-center opacity-100 transition-opacity duration-300 pointer-events-none">
                  <Award size={40} className="text-zinc-700 mb-3" />
                  <span className="text-zinc-500 font-mono text-sm bg-zinc-950/80 px-4 py-2 rounded-lg">
                    尚未偵測到 {certificates[certIndex].filename}
                  </span>
                </div>

                {/* Carousel Controls (移至圖片容器內，確保垂直置中) */}
                <button
                  onClick={prevCert}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900/80 border border-zinc-700 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 opacity-0 group-hover/img:opacity-100 transition-all z-30 shadow-lg"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextCert}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900/80 border border-zinc-700 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 opacity-0 group-hover/img:opacity-100 transition-all z-30 shadow-lg"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {certificates.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCertIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${certIndex === idx ? "bg-amber-500 w-4" : "bg-zinc-700 hover:bg-zinc-500"}`}
                  />
                ))}
              </div>
            </div>
          </section>

        </article>
      </div>
    </div>
  );
}
