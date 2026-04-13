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
            <time className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Nov 20, 2023</time>
            <h1 className="text-5xl font-bold mt-4 mb-6">
              物聯網安全：為什麼我們在智慧家居專題選擇 IOTA？
            </h1>
            <p className="text-xl text-zinc-400">
              在設計安全的智慧家居系統時，我們做過不少技術取捨。這篇會說明為什麼最後選擇 IOTA 的 Tangle，而不是傳統區塊鏈。
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
                  <span>物聯網（IoT）安全的獨特挑戰</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>傳統區塊鏈在 IoT 中的限制</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>IOTA Tangle 的架構與優勢</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>去中心化智慧家居的設計原則</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>數據不可篡改性與隱私保護</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>我們的專題實現與經驗總結</span>
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
