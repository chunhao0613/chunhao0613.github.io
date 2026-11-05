---
title: 安全智慧家居系統（IOTA）
period: Apr – Nov 2026 · 6 人團隊專題
order: 2
positioning: 從 ESP32 門鎖到手機 App 再到區塊鏈公證，跨多個 repo 和多位成員的完整 IoT 系統。
summary: ESP32-S3 門鎖透過 MQTT（TLS 1.3、自簽 CA）連到 7 個容器組成的後端，Flutter App 遠端開關鎖。配對、除役、訪客權杖、安全異常等關鍵事件先寫進待上鏈佇列，再由 worker 以雜湊錨定到樹莓派上 3 個節點的私有 IOTA Tangle。
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
  - label: 整合筆記
    href: /blog/iota-team-integration
---

負責跨 repo 整合與對齊。團隊分成 App、API、硬體、IOTA、資料庫，實際投入的約 2–4 人。App 連不上硬體時，我從症狀判斷問題出在中間的 API 層；之後改用 UC 文件、MQTT topic 表和 HANDOVER 交接文件對齊介面。我也會審查 AI 和組員的方案，例如指出 Flutter 偏重 UI、核心邏輯要另外放在後端。回顧：重來一次我會切成前端、後端、硬體、IOTA 四層，並把人力集中在專題重點 IOTA 上。
