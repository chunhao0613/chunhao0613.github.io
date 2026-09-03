"use client";

import { useState } from "react";
import { Award, ChevronLeft, ChevronRight } from "lucide-react";

// 原本的實作是在 onLoad/onError 裡直接操作 nextElementSibling 的 style，
// 依賴 DOM 相鄰順序，換張圖就可能殘留上一張的狀態。
// 改成用 state 紀錄每張圖的載入結果，交給 React 決定要顯示圖還是佔位。
export function CertificateCarousel({ certificates }) {
  const items = certificates?.items ?? [];
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState({});

  if (items.length === 0) return null;

  const current = items[index];
  const src = `/${current.image}.webp`;
  const isMissing = failed[current.image];

  const go = (delta) => setIndex((prev) => (prev + delta + items.length) % items.length);

  return (
    <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-6 flex flex-col relative">
      <div className="inline-flex items-center gap-2 text-zinc-300 mb-4">
        <Award size={18} />
        <h2 className="text-xl font-bold">{certificates.title ?? "證書"}</h2>
      </div>

      <div className="mb-6 h-12 overflow-hidden flex flex-col justify-center">
        <div className="text-zinc-200 font-bold mb-1">{current.title}</div>
        <p className="text-zinc-400 text-sm leading-relaxed">{current.desc}</p>
      </div>

      <div className="flex-grow min-h-56 bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 transition-colors rounded-lg flex flex-col items-center justify-center p-4 relative overflow-hidden group/img">
        {isMissing ? (
          <div className="flex flex-col items-center pointer-events-none">
            <Award size={40} className="text-zinc-700 mb-3" />
            <span className="text-zinc-500 font-mono text-sm bg-zinc-950/80 px-4 py-2 rounded-lg">
              尚未提供 {current.image}
            </span>
          </div>
        ) : (
          <img
            src={src}
            alt={current.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-contain z-10 p-2"
            onError={() => setFailed((prev) => ({ ...prev, [current.image]: true }))}
          />
        )}

        {items.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="上一張證書"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900/80 border border-zinc-700 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 opacity-0 group-hover/img:opacity-100 focus-visible:opacity-100 transition-all z-30 shadow-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="下一張證書"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900/80 border border-zinc-700 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 opacity-0 group-hover/img:opacity-100 focus-visible:opacity-100 transition-all z-30 shadow-lg"
            >
              <ChevronRight size={20} />
            </button>
          </>
        ) : null}
      </div>

      {items.length > 1 ? (
        <div className="flex justify-center gap-2 mt-4">
          {items.map((item, idx) => (
            <button
              key={item.image}
              type="button"
              aria-label={`切換到 ${item.title}`}
              aria-current={index === idx}
              onClick={() => setIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                index === idx ? "bg-amber-500 w-4" : "bg-zinc-700 hover:bg-zinc-500 w-2"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
