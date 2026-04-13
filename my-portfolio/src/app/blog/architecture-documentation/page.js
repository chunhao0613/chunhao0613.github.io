"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/#blog" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-12 transition-colors">
          <ArrowLeft size={18} />
          回到技術筆記
        </Link>

        <article className="prose prose-invert max-w-none">
          <header className="mb-12 border-b border-zinc-800 pb-8">
            <time className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Apr 11, 2026</time>
            <h1 className="text-5xl font-bold mt-4 mb-6">
              如何將複雜的系統架構轉化為易懂的交接文件
            </h1>
            <p className="text-xl text-zinc-400">
              架構文件會直接影響團隊協作效率。這篇會整理我如何用清楚的層次、圖表和範例，把複雜設計講到大家都看得懂。
            </p>
          </header>

          <section className="space-y-8">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">📝 文章尚在撰寫中</h2>
              <p className="text-zinc-400 mb-6">
                這篇文章將涵蓋以下主題：
              </p>
              <ul className="space-y-3 text-zinc-400">
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>SRS（軟體需求規格書）的結構與編寫方法</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>系統架構圖的設計與工具選擇</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>複雜概念的簡化與視覺化方法</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>交接文件的最佳實踐</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>真實案例分析與示範</span>
                </li>
              </ul>
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-800">
              <p className="text-sm text-zinc-500">
                文章仍在撰寫中。如果你有想看的內容或建議，歡迎<Link href="/#contact" className="text-white hover:text-zinc-300 underline">聯絡我</Link>。
              </p>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
