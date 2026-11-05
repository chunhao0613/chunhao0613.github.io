// 首頁「其他專案」卡片資料。新增專案只要在這裡加一筆。
// role：我在 AI 協作中負責的部分（拆需求、架構選型、交接文件）。
export const projects = [
  {
    title: "Thaumio：IoT 行為與資料數位雙生引擎",
    period: "Jun 2026 · 獨立開源工具",
    positioning: "給缺乏硬體設備的軟硬體開發者：不用真的買裝置，用一份設定檔就能模擬大量 IoT 裝置，跑整合測試與 CI。",
    desc: "只做數位雙生的「資料與行為」層，不碰 3D 和物理模擬。用一份 JSON 宣告整個拓撲（環境、閘道、協定、狀態公式），支援 mTLS、SAS Token、JWT。",
    role: "從自己的需求出發，決定做成開源工具給大家用。原本想做視覺化，但為了「輕量、能放進 CI」先把 3D 拿掉，留待未來發展成教學與模擬用途。AI 提出用 JSON 宣告拓撲，我評估後採用，並要求附上 Schema，讓設定檔能在 IDE 中驗證。",
    tags: ["Python", "asyncio", "MQTT", "JSON Schema", "Docker"],
    links: [
      { label: "案例文章", href: "/blog/thaumio-digital-twin", internal: true },
      { label: "原始碼", href: "https://github.com/chunhao0613/Thaumio" },
    ],
  },
  {
    title: "安全智慧家居系統（IOTA）",
    period: "Apr – Nov 2026 · 6 人團隊專題",
    positioning: "從 ESP32 門鎖到手機 App 再到區塊鏈公證，跨多個 repo 和多位成員的完整 IoT 系統。",
    desc: "ESP32 透過 MQTT（TLS 1.3、自簽 CA）連到 Docker 化的後端，Flutter App 遠端開鎖並接收門鈴、破壞警報。異常資料以 SHA-256 加 Merkle Tree 批次錨定到 IOTA Tangle，並以 Thaumio 模擬裝置做 4 條鏈的效能比較。",
    role: "負責跨 repo 整合與對齊。團隊分成 App、API、硬體、IOTA、資料庫，實際投入的約 2–4 人。App 連不上硬體時，我從症狀判斷問題出在中間的 API 層；之後改用 UC 文件、MQTT topic 表和 HANDOVER 交接文件對齊介面。我也會審查 AI 和組員的方案，例如指出 Flutter 偏重 UI、核心邏輯要另外放在後端。回顧：重來一次我會切成前端、後端、硬體、IOTA 四層，並把人力集中在專題重點 IOTA 上。",
    tags: ["ESP32", "MQTT/TLS", "FastAPI", "Flutter", "IOTA", "Docker"],
    links: [
      { label: "API 與韌體", href: "https://github.com/chunhao0613/IOTA_API" },
      { label: "App", href: "https://github.com/chunhao0613/IOTA_frontend" },
      { label: "上鏈驗證", href: "https://github.com/chunhao0613/iota-project" },
      { label: "設計理念", href: "/blog/smart-home-security", internal: true },
    ],
  },
  {
    title: "APK Extractor：Android 工具箱",
    period: "Nov 2026",
    positioning: "把手機上已安裝的 App 匯出成 APK，全程唯讀、不改動手機。",
    desc: "Python CLI 透過 adb 運作、不需額外套件；另有 Kotlin／Jetpack Compose 的 Android App 版本，並用 GitHub Actions 自動發布 release。",
    role: "先定下「唯讀、零相依」的限制，再決定 CLI 與 App 兩種形式各自服務的使用情境。",
    tags: ["Python", "adb", "Kotlin", "Jetpack Compose", "GitHub Actions"],
    links: [{ label: "原始碼", href: "https://github.com/chunhao0613/android-tool-box" }],
  },
  {
    title: "台股量化回測基礎設施",
    period: "Apr 2026 · PoC",
    positioning: "針對台股的因子研究與回測流程，從抓資料到出報告一條龍。",
    desc: "包含 TWSE/TPEx 資料 ETL、因子工程、機器學習評估與事件驅動回測，用 Streamlit 呈現結果並以 Docker 打包。",
    role: "把流程拆成 ETL、特徵、評估、回測四個可替換模組，讓每一段都能單獨驗證。",
    tags: ["Python", "pandas", "Streamlit", "Docker"],
    links: [
      { label: "原始碼", href: "https://github.com/chunhao0613/quantitative_trading" },
      { label: "WorldQuant 實戰", href: "/blog/worldquant-alpha", internal: true },
    ],
  },
  {
    title: "AI 知識庫與購物客服（RAG）",
    period: "Apr – May 2026",
    positioning: "讓 LLM 根據本地或專屬資料回答，並套用到電商客服情境。",
    desc: "以 LangChain 整合外部 LLM API 建立檢索生成系統，有 Dockerfile 與 Jenkins CI；延伸出串接商品資料庫的購物聊天機器人。",
    role: "決定檢索資料的切分與來源範圍，並把通用知識庫與客服應用拆成兩個專案。",
    tags: ["Python", "LangChain", "RAG", "Jenkins", "Docker"],
    links: [
      { label: "線上 Demo", href: "https://ragproject--chunhao0613.replit.app/" },
      { label: "原始碼", href: "https://github.com/chunhao0613/rag_project" },
      { label: "技術筆記", href: "/blog/langchain-rag", internal: true },
    ],
  },
];
