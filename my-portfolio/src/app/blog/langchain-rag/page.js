"use client";

import React from "react";
import { ArrowLeft, ArrowUpRight, BookOpen, Rocket, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BlogPost() {
  const router = useRouter();

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
              Apr 05, 2026
            </time>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-5 tracking-tight">
              初探 LangChain：打造個人化的 RAG 本地知識庫
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl leading-relaxed">
              這篇會整理我從需求出發，實作一套真正可使用的 RAG
              系統，並把知識檢索流程做成可以直接操作的網頁服務。
            </p>
          </header>

          <section className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-3">專案價值主張</h2>
            <p className="text-zinc-400 leading-relaxed">
              這個專案重點是「真的能用」，不只是能展示的 RAG Demo。除了上傳 PDF
              與問答流程，我把多 Provider 模型切換、索引快取重用、配額超限降級、執行狀態顯示整合在同一個介面，
              讓它在真實環境下更穩定，也更好維運。
            </p>
          </section>

          <section className="grid lg:grid-cols-3 gap-6 mb-12">
            <div className="lg:col-span-2 bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-6">
              <div className="inline-flex items-center gap-2 text-zinc-300 mb-4">
                <BookOpen size={18} />
                <h2 className="text-xl font-bold">功能亮點</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  {
                    title: "多模型 Provider 切換",
                    desc: "Embedding 與 LLM 可以分開切換，涵蓋 Google、Cohere、Together、HuggingFace、Groq、GitHub Models。",
                  },
                  {
                    title: "索引快取重用",
                    desc: "依檔案 Hash + Embedding 設定判斷是否重建，避免每次重跑向量化流程。",
                  },
                  {
                    title: "配額降級與容錯",
                    desc: "遇到 quota 或模型不可用時，會改用擷取式回答或 local-hash embeddings，盡量維持可用性。",
                  },
                  {
                    title: "執行狀態可觀測",
                    desc: "顯示 Embedding/LLM 狀態、錯誤原因、重試秒數，方便快速排錯。",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4"
                  >
                    <h3 className="text-zinc-200 font-semibold mb-2">{item.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {[
                  "LangChain",
                  "RAG",
                  "Prompt Engineering",
                  "Vector Search",
                  "Streamlit",
                  "ChromaDB",
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
                <h2 className="text-xl font-bold">快速體驗流程</h2>
              </div>
              <ol className="space-y-3 text-zinc-400 text-sm leading-relaxed list-decimal pl-5">
                <li>上傳一份 PDF 文件。</li>
                <li>點擊「執行 Embedding」建立或重用索引。</li>
                <li>在對話框提問，觀察回答與狀態欄位。</li>
                <li>若遇到配額問題，切換模型或 Provider 再試。</li>
              </ol>
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
                直接開啟網頁版，體驗檢索與回答流程。
              </p>
              <span className="inline-flex items-center gap-2 text-zinc-300 group-hover:text-white transition-colors">
                前往 Demo <ArrowUpRight size={16} />
              </span>
            </a>
          </section>

          <section className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-6 mb-10">
            <h2 className="text-xl font-bold text-zinc-200 mb-4">RAG 網站使用步驟與 Key 說明</h2>
            <ol className="space-y-3 text-zinc-400 leading-relaxed list-decimal pl-5 mb-6">
              <li>使用者需自行輸入可用的 API Key（例如 Google、Cohere、Groq 或 GitHub Models）。</li>
              <li>上傳 PDF 文件後，先執行 Embedding 建立索引，再開始提問。</li>
              <li>若回答品質或可用性不理想，可切換 Provider/Model 後重新測試。</li>
            </ol>
            <p className="text-zinc-400 leading-relaxed">
              你輸入的 API Key 會存放在你的瀏覽器 localStorage（裝置端）做使用體驗優化；
              我不會主動蒐集、備份或盜取你的 API Key。
            </p>
          </section>

          <section className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-6 mb-10">
            <div className="inline-flex items-center gap-2 text-zinc-300 mb-4">
              <ShieldAlert size={18} />
              <h2 className="text-xl font-bold">限制與實務注意</h2>
            </div>
            <ul className="space-y-3 text-zinc-400 leading-relaxed">
              <li>
                Replit 免費方案可能休眠；喚醒後若本地向量快取遺失，需要重新執行
                Embedding。
              </li>
              <li>
                不同 LLM/Embedding Provider 的成本、配額與回答穩定度都不一樣，建議在介面上實際切換驗證。
              </li>
              <li>
                API Key 先放前端 localStorage 只是開發期方便，正式環境建議改成伺服器端 Secret 管理。
              </li>
            </ul>
          </section>

          <section className="pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              文章仍在持續補充中。如果你有想看的主題或希望我補充的技術細節，歡迎
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
