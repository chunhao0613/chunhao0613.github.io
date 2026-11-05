# 內容與區塊

網站的文字內容都在這個資料夾，改完 push 到 `main` 就會自動部署，不需要碰程式碼。
**每個區塊、每種顏色的實際樣子請看 `/styleguide` 頁**（原始檔是 `content/styleguide.md`）。

| 檔案 | 內容 |
|---|---|
| `home.md` | 首頁：由上到下的段落與區塊、左側選單 |
| `projects/*.md` | 專案：一個檔案一個專案，首頁的精選專案與「其他專案」都從這裡讀 |
| `blog/*.md` | 文章：寫法見 `blog/README.md` |
| `styleguide.md` | 區塊與色彩展示頁的內容 |

---

## 區塊語法

區塊用 YAML 宣告，有兩種放法：

1. **放在檔案最上方的 frontmatter**（兩行 `---` 之間）
   - 首頁：`home.md` 的 `blocks:`
   - 文章：`highlights:`、`links:`、`award:` 等欄位
2. **插在 Markdown 內文裡**：寫一段語言標成 `block` 的程式碼區塊

````markdown
```block
block: steps          ← 有 block: 的是首頁區塊
title: 三個原則
items:
  - { title: 定義限制, desc: 先決定不能妥協的原則。, tone: sky }
```

```block
highlights:           ← 沒有 block: 的照文章 frontmatter 的欄位名稱寫
  title: 功能亮點
  items:
    - { title: 小標, desc: 說明。 }
```
````

另外兩個特殊區塊不需要內容：` ```tones ` 顯示所有色彩、` ```icons ` 顯示所有圖示。

**寫錯不會讓網站壞掉**：區塊類型打錯或 YAML 格式錯誤，只會在那個位置顯示紅色錯誤框（內文）或在建置 log 出現警告並略過（首頁）。
只有必填欄位缺少時會擋下建置，並在 log 指出是哪個檔案：首頁的 `sections`、每段的 `id`，以及專案的 `title`。

---

## 首頁：`home.md`

```yaml
sections:
  - id: projects        # 網址錨點（#projects），必填
    menu: 個人專案       # 左側選單文字，省略就不出現在選單
    icon: code          # 選單與段落大標的圖示
    title: 個人專案      # 段落大標，可省略
    blocks:             # 依序顯示的區塊
      - block: featured
        project: novacut
```

段落的外框依第一個區塊決定：`hero` 佔滿一屏、`contact` 置中，其他是一般段落。

### 首頁區塊

| 區塊 | 欄位 |
|---|---|
| `hero` 開場 | `status`、`statusTone`、`greeting`、`name`、`nickname`（點擊有彩蛋）、`role`、`intro`、`buttons`、`terminal` |
| `featured` 精選專案 | `project`（專案檔名，不含 `.md`）、`eyebrow`（日期前的小字） |
| `steps` 編號卡片 | `title`、`intro`、`items`（每項 `title`、`desc`、`tone`） |
| `projects` 專案卡片 | `title`、`intro`、`only`（只列指定的專案，省略就列全部、但不含已精選的） |
| `posts` 文章卡片列 | `title`、`intro`、`icon`、`limit`（最多幾篇） |
| `contact` 聯絡 | `title`、`text`、`buttons` |

**按鈕**（`buttons`、專案的 `links`）：`label`、`href`，以及可選的：

- `style`：`primary` 是實心大按鈕；hero 的 `ghost` 是純文字；contact 的其他值是下方小膠囊
- `icon`：圖示名稱（見下方）
- `href` 開頭是 `/` 是站內連結、`#` 是頁內錨點、`https://` 會開新分頁

**hero 的 terminal**：

```yaml
terminal:
  command: cat profile.json   # ➜ ~ 後面的指令
  commandTone: emerald
  keyTone: sky                # JSON key 的顏色
  valueTone: default          # JSON 值的顏色
  data:                       # 任意 YAML，會顯示成 JSON 的樣子
    name: Chun-Hao Yu
    skills:
      languages: [C++, Python]
```

---

## 專案：`projects/*.md`

檔名就是專案代號（`featured` 的 `project:` 填這個）。內文是卡片上的「我的角色」，空一行分段。

```yaml
---
title: Thaumio：IoT 行為與資料數位雙生引擎   # 必填
period: Jun 2026 · 獨立開源工具
order: 1                 # 排序，數字小的在前
positioning: 一句話定位。
summary: 兩三句說明。
tags: [Python, MQTT, Docker]
links:
  - { label: 案例文章, href: /blog/thaumio-digital-twin }
  - { label: 原始碼, href: "https://github.com/…" }
# 以下只有精選專案會用到
cover: novacut           # assets/images/covers/ 裡的檔名主幹
coverAlt: 封面圖說明
stats:
  - { value: 26 款, label: 競品功能矩陣, tone: sky }
---
我負責的部分……
```

---

## tone 色彩

| 名稱 | 顏色 | 用在 |
|---|---|---|
| `default` | 白 | |
| `muted` | 灰 | |
| `green` | 綠（hero 狀態燈） | `statusTone` |
| `emerald` | 翡翠綠（終端機指令） | `commandTone`、`stats`、`steps`、award 計分板 |
| `sky` | 天藍（終端機 key） | `keyTone`、`stats`、`steps`、award 計分板 |
| `purple` | 紫 | 同上 |
| `amber` | 琥珀 | 同上 |
| `rose` | 玫瑰紅 | 同上 |

沒填或打錯會用元件原本的顏色。要新增顏色，在 `src/lib/tones.js` 加一列。

## 圖示

| 用在 | 可用名稱 |
|---|---|
| 首頁段落、按鈕（`icon:`） | `user`、`code`、`book`、`mail`、`branch`、`arrow`、`github` |
| 文章的 `notes`、`highlights`（`icon:`） | `award`、`book`、`calculator`、`rocket`、`shield`、`trophy` |
