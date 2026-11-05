// 首頁「其他專案」卡片資料。新增專案只要在這裡加一筆。
// role：我在 AI 協作中負責的部分（拆需求、架構選型、交接文件）。
export const projects = [
  {
    title: "Thaumio：IoT 行為與資料數位雙生引擎",
    period: "Jun 2026 · 獨立開源工具",
    positioning: "讓 IoT 後端在沒有實體硬體時，也能用設定檔模擬大量裝置，跑整合測試與 CI。",
    desc: "只做數位雙生的「資料與行為」層，不碰 3D 和物理模擬。用一份 JSON 宣告整個拓撲（環境、閘道、協定、狀態公式），支援 mTLS、SAS Token、JWT。",
    role: "定義產品邊界（刻意不做 3D）、設計 JSON Schema 讓 IDE 能自動補完與驗證，並選擇雙緩衝狀態求值，解決 JSON key 順序造成公式相依失敗的問題。",
    tags: ["Python", "asyncio", "MQTT", "JSON Schema", "Docker"],
    links: [{ label: "原始碼", href: "https://github.com/chunhao0613/Thaumio" }],
  },
  {
    title: "安全智慧家居系統（IOTA）",
    period: "Apr – Nov 2026 · 團隊專題",
    positioning: "從 ESP32 門鎖到手機 App 再到區塊鏈公證，跨多個 repo 和多位成員的完整 IoT 系統。",
    desc: "ESP32 透過 MQTT（TLS 1.3、自簽 CA）連到 Docker 化的後端，Flutter App 遠端開鎖並接收門鈴、破壞警報。異常資料以 SHA-256 加 Merkle Tree 批次錨定到 IOTA Tangle，並以 Thaumio 模擬裝置做 4 條鏈的效能比較。",
    role: "負責跨 repo 整合：定 MQTT topic 協定與 UC 文件、拆分 API／前端／韌體的邊界，並撰寫 HANDOVER 交接文件，讓組員與 AI 都能接手。",
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
