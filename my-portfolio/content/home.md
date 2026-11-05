---
# 首頁的內容與版面，由上到下依序排列。
# 每一段（section）是左側選單的一個項目；段落裡的 blocks 依序顯示。
# 可用的區塊、欄位與 tone 色彩見 content/README.md，實際樣子見 /styleguide。

sections:
  - id: about
    menu: 關於我
    icon: user
    blocks:
      - block: hero
        status: Available for new opportunities
        statusTone: green
        greeting: Hi, 我是
        name: 余駿豪
        nickname: 鮭魚
        role: 軟體開發者 / MCU-CSIE
        intro: 我對開發一直保持好奇，也習慣把想法做成能驗證的成果。擅長把複雜技術整理成好閱讀的架構與交接文件，包含嚴謹的 SRS 與系統分析。技術範圍從 AI RAG 應用到區塊鏈智慧家居，持續把點子落地成能解決真實問題的方案。
        buttons:
          - { label: 查看個人專案, href: "#projects", style: primary }
          - { label: 聯絡我, href: "#contact", style: ghost }
        terminal:
          command: cat profile.json
          commandTone: emerald
          keyTone: sky
          data:
            name: Chun-Hao Yu (鮭魚)
            education: MCU-CSIE
            skills:
              languages: [C++, Java, Python, PHP]
              ai_tech: [RAG, LangChain, LLM API]
              domain: [System Analysis, SRS, IOTA]
              tools: [Git, RESTful API]
            mindset: [Curiosity, Innovation]

  - id: projects
    menu: 個人專案
    icon: code
    title: 個人專案
    blocks:
      - block: featured
        project: novacut
        eyebrow: 精選專案
      - block: steps
        title: 我和 AI 的協作方式
        intro: AI 寫程式很快，但也會很有自信地寫錯。我的角色是把模糊的目標變成可驗證的範圍，並設計出有標準答案的測試，讓結果自己證明對錯。
        items:
          - { title: 定義限制, desc: 先決定不能妥協的原則（本機處理、免費、無浮水印），之後每個技術選擇都拿它來判斷。 }
          - { title: 先研究再動手, desc: 讓 AI 平行調查開源專案與 26 款競品，產出功能矩陣，我依缺口決定優先順序。 }
          - { title: 小批交付, desc: 每批只做 3–5 個功能，做完就驗收、更新文件，降低一次改壞的範圍。 }
          - { title: 用數據驗收, desc: 合成 440 Hz 純音、120 BPM 鼓聲、已知軌跡的方塊當標準答案；甚至用 Whisper 把 AI 語音辨識回文字比對。 }
          - { title: 追到根因, desc: 不接受「已知限制」。變速變調就自己實作 WSOLA；匯出全黑就讀回影格查像素，找到 1×1 圖層的真正原因。 }
          - { title: 回到使用者, desc: 定期以新使用者身分走一遍流程，把「不好用」變成具體、可排序的問題清單。 }
      - block: projects
        title: 其他專案
        intro: 每個專案都標出「我負責的部分」：程式碼由 AI 協作產出，我負責拆需求、定規格、做架構與技術選型，並寫交接文件讓工作能被接手。

  - id: blog
    menu: 技術筆記
    icon: book
    blocks:
      - block: posts
        title: 技術筆記
        intro: 除了寫程式，我也會把踩坑過程和學習心得記下來。這不只幫我整理思路，也希望能讓遇到同樣問題的人少走一點彎路。

  - id: contact
    menu: 聯絡資訊
    icon: mail
    blocks:
      - block: contact
        title: 準備好聊聊了嗎？
        text: 我目前正在尋找前端工程師的全職機會。如果你覺得我的經歷和技能符合團隊需求，歡迎直接用 Email 找我聊聊。
        buttons:
          - { label: 發送 Email, href: "https://mail.google.com/mail/?view=cm&fs=1&to=chunhao0613@gmail.com", icon: mail, style: primary }
          - { label: GitHub, href: "https://github.com/chunhao0613", icon: github, style: chip, title: 前往 GitHub 個人頁面 }
---
