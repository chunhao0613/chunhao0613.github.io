---
title: 區塊與色彩
intro: 這一頁列出網站上所有的區塊與 tone 色彩，每一個都附上寫法與實際樣子。這份檔案本身就是用「區塊語法」寫的，改了格式或樣式之後打開 /styleguide 看一眼，就知道有沒有東西壞掉。
---

## 怎麼寫

區塊有兩種放法：

1. **放在檔案最上方的 frontmatter**：首頁（`content/home.md` 的 `blocks:`）、專案（`content/projects/*.md`）、文章（`content/blog/*.md` 的 `highlights:`、`links:` 等欄位）。
2. **插在 Markdown 內文裡**：寫一段語言標成 `block` 的程式碼區塊，內容是 YAML。有 `block:` 欄位的是首頁區塊，沒有的就照文章 frontmatter 的欄位名稱寫。

另外有兩個不需要內容的特殊區塊：` ```tones ` 顯示所有色彩、` ```icons ` 顯示所有圖示。

## tone 色彩

在支援的欄位寫 `tone: sky` 這類名稱就能換顏色。沒填或打錯會用元件原本的顏色，不會壞掉。

```tones
```

| 可以填 tone 的地方 | 欄位 |
|---|---|
| 首頁 hero 的狀態燈 | `statusTone` |
| 首頁 hero 的終端機 | `commandTone`（指令）、`keyTone`（JSON 的 key）、`valueTone`（JSON 的值） |
| 精選專案的數字 | 專案檔 `stats` 每一項的 `tone` |
| steps 每一張卡片的編號 | `items` 每一項的 `tone` |
| 文章 award 計分板 | `scoreboard.stats` 每一項的 `tone` |

## 圖示

```icons
```

## 首頁區塊

首頁由 `content/home.md` 的 `sections` 組成：每一段有 `id`（網址錨點）、`menu`（左側選單文字）、`icon`、可選的 `title`（段落大標），以及依序排列的 `blocks`。

### hero：開場

```block
block: hero
status: Available for new opportunities
statusTone: green
greeting: Hi, I'm
name: Hugo
nickname: 鮭魚
role: 軟體開發者 / MCU-CSIE
intro: 一段自我介紹。
buttons:
  - { label: 查看個人專案, href: "#projects", style: primary }
  - { label: 聯絡我, href: "#contact", style: ghost }
terminal:
  command: cat profile.json
  commandTone: emerald
  keyTone: sky
  data:
    name: Chun-Hao Yu
    skills:
      languages: [C++, Python]
    mindset: [Curiosity]
```

### featured：精選專案

內容來自專案檔（這裡是 `content/projects/ezicut.md`），區塊只指定要放哪一個。被精選的專案不會再出現在「其他專案」列表。

```block
block: featured
project: ezicut
eyebrow: 精選專案
```

### steps：編號卡片

```block
block: steps
title: 我和 AI 的協作方式
intro: 卡片編號可以用 tone 上色。
items:
  - { title: 定義限制, desc: 先決定不能妥協的原則。, tone: sky }
  - { title: 先研究再動手, desc: 平行調查競品，產出功能矩陣。, tone: emerald }
  - { title: 用數據驗收, desc: 用有標準答案的測試量測。, tone: amber }
```

### projects：專案卡片

自動列出 `content/projects/` 裡的專案（依 `order` 排序），內文是「我的角色」。這裡用 `only` 只列兩個做示範。

```block
block: projects
title: 其他專案
intro: 每個專案都標出我負責的部分。
only: [thaumio, apk-extractor]
```

### posts：文章卡片列

自動列出 `content/blog/` 的文章，可以用 `limit` 限制數量。

```block
block: posts
title: 技術筆記
intro: 左右箭頭可以翻頁。
limit: 4
```

### contact：聯絡

`style: primary` 是大按鈕，其他是下方的小膠囊按鈕。

```block
block: contact
title: 準備好聊聊了嗎？
text: 一段邀請的話。
buttons:
  - { label: 發送 Email, href: "mailto:someone@example.com", icon: mail, style: primary }
  - { label: GitHub, href: "https://github.com/chunhao0613", icon: github, style: chip }
```

## 文章區塊

欄位名稱和文章 frontmatter 一樣，可以寫在文章最上方，也可以用 `block` 插在內文裡。

### highlights：功能亮點

```block
highlights:
  title: 功能亮點
  items:
    - { title: 全部在本機執行, desc: 不上傳任何檔案。 }
    - { title: 用數據驗收, desc: 每個功能都有量測紀錄。 }
tags: [WebCodecs, WebGL2, Web Audio]
```

### links：連結卡片

```block
links:
  - { kind: SOURCE CODE, title: 專案原始碼, desc: 一句話說明。, href: "https://github.com/chunhao0613", cta: 前往 GitHub }
  - { kind: LIVE DEMO, title: 線上試用, desc: 一句話說明。, href: "https://chunhao0613.github.io/ezi-cut/" }
```

### award：獎項與計分板

計分板的數字可以用 tone 上色，省略是白色。

```block
award:
  badge: 獎項名稱
  period: 2026/03 - 2026/05
  link: { href: "https://example.com", label: 官方網站 }
  heading: 大標題
  body: 一段說明。
  scoreboard:
    team: <Salmon>
    updated: 5/11 11:14
    stats:
      - { label: Rank, value: "4574" }
      - { label: Score, value: "8872", tone: purple }
      - { label: Sharpe, value: "1.92", tone: sky }
      - { label: Fitness, value: "1.31", tone: emerald }
      - { label: Turnover, value: 12%, tone: amber }
      - { label: Drawdown, value: 3.1%, tone: rose }
```

### notes：重點卡片

```block
notes:
  - { title: 遇到的問題, icon: shield, body: 一段說明。 }
  - { title: 怎麼解決, icon: rocket, body: 一段說明。 }
```

### certificates：證書輪播

```block
certificates:
  title: 證書
  items:
    - { title: Gold Medal, desc: 說明文字。, image: gold_medal }
    - { title: Silver Medal, desc: 說明文字。, image: silver_medal }
```

### outline：撰寫中大綱

```block
outline:
  - 第一個主題
  - 第二個主題
```

## 寫錯的時候

區塊類型打錯或 YAML 格式錯誤，只會在那個位置顯示紅色的錯誤框，不會讓網站建置失敗：

```block
block: heroo
title: 打錯字的區塊
```
