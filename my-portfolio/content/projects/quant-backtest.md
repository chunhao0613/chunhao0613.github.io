---
title: 台股量化回測基礎設施
period: Apr 2026 · PoC
order: 4
positioning: 針對台股的因子研究與回測流程，從抓資料到出報告一條龍。
summary: 包含 TWSE/TPEx 資料 ETL、因子工程、機器學習評估與事件驅動回測，用 Streamlit 呈現結果並以 Docker 打包。
tags:
  - Python
  - pandas
  - Streamlit
  - Docker
links:
  - label: 原始碼
    href: 'https://github.com/chunhao0613/quantitative_trading'
  - label: WorldQuant 實戰
    href: /blog/worldquant-alpha
---

把流程拆成 ETL、特徵、評估、回測四個可替換模組，讓每一段都能單獨驗證。
