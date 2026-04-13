"use client";

import React from "react";
import { ArrowLeft, ArrowUpRight, BookOpen, Rocket } from "lucide-react";
import Link from "next/link";

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <Link
          href="/#blog"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-12 transition-colors"
        >
          <ArrowLeft size={18} />
          回到技術筆記
        </Link>

        <article className="max-w-none">
          <header className="mb-12 border-b border-zinc-800 pb-10">
            <time className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Jan 05, 2024
            </time>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-5 tracking-tight">
              初探 LangChain：打造個人化的 RAG 本地知識庫
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl leading-relaxed">
              這篇文章整理我如何從需求出發，建立一個可實際使用的 RAG
              系統，並將知識檢索流程落地成可操作的網頁服務。
            </p>
          </header>

          <section className="grid lg:grid-cols-3 gap-6 mb-12">
            <div className="lg:col-span-2 bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-6">
              <div className="inline-flex items-center gap-2 text-zinc-300 mb-4">
                <BookOpen size={18} />
                <h2 className="text-xl font-bold">內容焦點</h2>
              </div>
              <p className="text-zinc-400 leading-relaxed mb-5">
                我會分享 RAG 架構設計思路、LangChain 串接方式、向量資料處理策略，
                以及在實作時遇到的準確率與效能取捨。
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  "LangChain",
                  "RAG",
                  "Prompt Engineering",
                  "Vector Search",
                  "LLM API",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-6">
              <div className="inline-flex items-center gap-2 text-zinc-300 mb-4">
                <Rocket size={18} />
                <h2 className="text-xl font-bold">目前進度</h2>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                文章持續補充中，先提供專案與 Demo 入口，方便直接體驗。
              </p>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-6 mb-10">
            <a
              href="https://github.com/chunhao0613/rag_project"
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-zinc-900/20 border border-zinc-800/50 hover:border-zinc-600 rounded-xl p-6 transition-all hover:-translate-y-1"
            >
              <span className="text-xs font-mono text-zinc-500 mb-3 block">
                SOURCE CODE
              </span>
              <h3 className="text-2xl font-bold text-zinc-300 group-hover:text-white transition-colors mb-3">
                RAG 專案原始碼
              </h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                查看 LangChain RAG 的完整實作與專案結構。
              </p>
              <span className="inline-flex items-center gap-2 text-zinc-300 group-hover:text-white transition-colors">
                前往 GitHub <ArrowUpRight size={16} />
              </span>
            </a>

            <a
              href="https://ragproject--chunhao0613.replit.app"
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-zinc-900/20 border border-zinc-800/50 hover:border-zinc-600 rounded-xl p-6 transition-all hover:-translate-y-1"
            >
              <span className="text-xs font-mono text-zinc-500 mb-3 block">
                LIVE APP
              </span>
              <h3 className="text-2xl font-bold text-zinc-300 group-hover:text-white transition-colors mb-3">
                RAG 網頁使用端
              </h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                直接開啟網頁版本，體驗檢索與回答流程。
              </p>
              <span className="inline-flex items-center gap-2 text-zinc-300 group-hover:text-white transition-colors">
                前往 Demo <ArrowUpRight size={16} />
              </span>
            </a>
          </section>

          <section className="pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              本文章正在撰寫中。如有任何建議或你希望我補充的技術細節，歡迎
              <Link href="/#contact" className="text-white hover:text-zinc-300 underline">
                聯絡我
              </Link>
              。
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
