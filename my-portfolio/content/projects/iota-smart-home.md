---
title: 安全智慧家居系統（IOTA）
period: Apr – Nov 2026 · 6 人團隊專題
order: 2
positioning: 從 ESP32 門鎖到手機 App 再到區塊鏈公證，跨多個 repo 和多位成員的完整 IoT 系統。
summary: ESP32 透過 MQTT（TLS 1.3、自簽 CA）連到 Docker 化的後端，Flutter App 遠端開鎖並接收門鈴、破壞警報。異常資料以 SHA-256 加 Merkle Tree 批次錨定到 IOTA Tangle，並以 Thaumio 模擬裝置做 4 條鏈的效能比較。
tags:
  - ESP32
  - MQTT/TLS
  - FastAPI
  - Flutter
  - IOTA
  - Docker
links:
  - label: API 與韌體
    href: 'https://github.com/chunhao0613/IOTA_API'
  - label: App
    href: 'https://github.com/chunhao0613/IOTA_frontend'
  - label: 上鏈驗證
    href: 'https://github.com/chunhao0613/iota-project'
  - label: 設計理念
    href: /blog/smart-home-security
---

負責跨 repo 整合與對齊。團隊分成 App、API、硬體、IOTA、資料庫，實際投入的約 2–4 人。App 連不上硬體時，我從症狀判斷問題出在中間的 API 層；之後改用 UC 文件、MQTT topic 表和 HANDOVER 交接文件對齊介面。我也會審查 AI 和組員的方案，例如指出 Flutter 偏重 UI、核心邏輯要另外放在後端。回顧：重來一次我會切成前端、後端、硬體、IOTA 四層，並把人力集中在專題重點 IOTA 上。
