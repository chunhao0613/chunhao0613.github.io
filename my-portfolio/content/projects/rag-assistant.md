---
title: AI 知識庫與購物客服（RAG）
period: Apr – May 2026
order: 5
positioning: 讓 LLM 根據本地或專屬資料回答，並套用到電商客服情境。
summary: 以 LangChain 整合外部 LLM API 建立檢索生成系統，有 Dockerfile 與 Jenkins CI；延伸出串接商品資料庫的購物聊天機器人。
tags:
  - Python
  - LangChain
  - RAG
  - Jenkins
  - Docker
links:
  - label: 線上 Demo
    href: 'https://ragproject--chunhao0613.replit.app/'
  - label: 原始碼
    href: 'https://github.com/chunhao0613/rag_project'
  - label: 技術筆記
    href: /blog/langchain-rag
---

決定檢索資料的切分與來源範圍，並把通用知識庫與客服應用拆成兩個專案。
