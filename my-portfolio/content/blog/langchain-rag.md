---
title: 初探 LangChain：打造個人化的 RAG 本地知識庫
date: 2026-04-05
excerpt: 從需求、索引到問答流程，一步步把 RAG 做成可以實際操作的網頁服務。
lede: 這個專案重點是「真的能用」，不只是能展示的 RAG Demo。除了上傳 PDF 與問答流程，我把多 Provider 模型切換、索引快取重用、配額超限降級、執行狀態顯示整合在同一個介面，讓它在真實環境下更穩定，也更好維運。
cover: langchain
tags:
  - LangChain
  - RAG
  - Prompt Engineering
  - Vector Search
  - Streamlit
  - ChromaDB
highlights:
  title: 功能亮點
  items:
    - title: 多模型 Provider 切換
      desc: Embedding 與 LLM 可以分開切換，涵蓋 Google、Cohere、Together、HuggingFace、Groq、GitHub Models。
    - title: 索引快取重用
      desc: 依檔案 Hash + Embedding 設定判斷是否重建，避免每次重跑向量化流程。
    - title: 配額降級與容錯
      desc: 遇到 quota 或模型不可用時，會改用擷取式回答或 local-hash embeddings，盡量維持可用性。
    - title: 執行狀態可觀測
      desc: 顯示 Embedding/LLM 狀態、錯誤原因、重試秒數，方便快速排錯。
links:
  - kind: SOURCE CODE
    title: RAG 專案原始碼
    desc: 查看 LangChain RAG 的完整實作與專案結構。
    href: https://github.com/chunhao0613/rag_project
    cta: 前往 GitHub
  - kind: LIVE APP
    title: RAG 網頁使用端
    desc: 直接開啟網頁版，體驗檢索與回答流程。
    href: https://ragproject--chunhao0613.replit.app
    cta: 前往 Demo
---

## 快速體驗流程

1. 上傳一份 PDF 文件。
2. 點擊「執行 Embedding」建立或重用索引。
3. 在對話框提問，觀察回答與狀態欄位。
4. 若遇到配額問題，切換模型或 Provider 再試。

## RAG 網站使用步驟與 Key 說明

1. 使用者需自行輸入可用的 API Key（例如 Google、Cohere、Groq 或 GitHub Models）。
2. 上傳 PDF 文件後，先執行 Embedding 建立索引，再開始提問。
3. 若回答品質或可用性不理想，可切換 Provider/Model 後重新測試。

你輸入的 API Key 會存放在你的瀏覽器 localStorage（裝置端）做使用體驗優化；我不會主動蒐集、備份或盜取你的 API Key。

## 限制與實務注意

- Replit 免費方案可能休眠；喚醒後若本地向量快取遺失，需要重新執行 Embedding。
- 不同 LLM/Embedding Provider 的成本、配額與回答穩定度都不一樣，建議在介面上實際切換驗證。
- API Key 先放前端 localStorage 只是開發期方便，正式環境建議改成伺服器端 Secret 管理。
