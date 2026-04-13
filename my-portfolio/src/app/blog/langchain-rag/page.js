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
            <time className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Jan 05, 2024</time>
            <h1 className="text-5xl font-bold mt-4 mb-6">
              初探 LangChain：打造個人化的 RAG 本地知識庫
            </h1>
            <p className="text-xl text-zinc-400">
              LangChain 是一個強大的框架，讓我們能輕鬆整合大語言模型（LLM）與本地數據。本文將介紹如何從零開始建立一個 RAG（檢索增強生成）系統。
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
                  <span>RAG（檢索增強生成）的基本概念</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>LangChain 框架的安裝與基本使用</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>向量數據庫與嵌入模型的選擇</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>構建文件分割與索引管道</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>實現本地文件的智能問答系統</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-500 mt-1">•</span>
                  <span>完整程式碼示範與最佳實踐</span>
                </li>
              </ul>
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-800">
              <p className="text-sm text-zinc-500">
                本文章正在撰寫中。如有任何建議或期望的內容，歡迎<Link href="/#contact" className="text-white hover:text-zinc-300 underline">聯絡我</Link>。
              </p>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
