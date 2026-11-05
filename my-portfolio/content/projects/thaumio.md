---
title: Thaumio：IoT 行為與資料數位雙生引擎
period: Jun 2026 · 獨立開源工具
order: 1
positioning: 給缺乏硬體設備的軟硬體開發者：不用真的買裝置，用一份設定檔就能模擬大量 IoT 裝置，跑整合測試與 CI。
summary: 只做數位雙生的「資料與行為」層，不碰 3D 和物理模擬。用一份 JSON 宣告整個拓撲（環境、閘道、協定、狀態公式），支援 mTLS、SAS Token、JWT。
tags:
  - Python
  - asyncio
  - MQTT
  - JSON Schema
  - Docker
links:
  - label: 案例文章
    href: /blog/thaumio-digital-twin
  - label: 原始碼
    href: 'https://github.com/chunhao0613/Thaumio'
---

從自己的需求出發，決定做成開源工具給大家用。原本想做視覺化，但為了「輕量、能放進 CI」先把 3D 拿掉，留待未來發展成教學與模擬用途。AI 提出用 JSON 宣告拓撲，我評估後採用，並要求附上 Schema，讓設定檔能在 IDE 中驗證。
