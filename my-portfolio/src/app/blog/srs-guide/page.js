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
            <time className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Apr 02, 2026</time>
            <h1 className="text-5xl font-bold mt-4 mb-6">
              從需求到實作：SRS 軟體需求規格書撰寫指南
            </h1>
            <p className="text-xl text-zinc-400">
              SRS（Software Requirements Specification）是開發前最重要的對齊文件。這篇會分享我怎麼把需求寫清楚、寫完整，讓團隊和利害關係人有一致理解。
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
                  <span>SRS 的定義與重要性</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>IEEE 830 標準與結構</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>功能性需求 vs 非功能性需求</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>使用者故事（User Story）的撰寫</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>需求驗證與追蹤方法</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>實戰範例與常見錯誤</span>
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
