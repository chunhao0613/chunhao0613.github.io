# 怎麼新增一篇文章

在這個資料夾建一個 `.md` 檔，檔名就是網址：
`content/blog/my-post.md` → `https://chunhao0613.github.io/blog/my-post`

推上 `main` 之後 GitHub Actions 會自動建置並部署，**不需要在本機安裝任何東西**。

---

## 最小範例

```markdown
---
title: 文章標題
date: 2026-06-01
excerpt: 首頁卡片上顯示的一兩句話。
---

## 第一個小節

正文用一般的 Markdown 寫就好。**粗體**、[連結](https://example.com)、清單、
表格、程式碼區塊都支援。
```

只要有 `title` 和 `date` 就能發佈，其餘欄位都可以省略。

---

## 封面圖

1. 把原圖（PNG 或 JPG，尺寸不用管，直接放原始大圖就好）上傳到
   `assets/images/covers/`，例如 `assets/images/covers/my-post.png`
2. 在 frontmatter 寫 `cover: my-post`（**不要加副檔名**）

建置時會自動壓成 WebP（給網站用）和 JPG（給社群分享預覽用），
你不需要自己轉檔。

---

## frontmatter 欄位

| 欄位 | 必填 | 說明 |
|---|---|---|
| `title` | ✅ | 文章標題，也會用在瀏覽器分頁與搜尋結果 |
| `date` | ✅ | `YYYY-MM-DD`。首頁依此排序，新的在前 |
| `excerpt` | | 首頁卡片的摘要 |
| `lede` | | 文章頁標題下方的導言。省略時用 `excerpt` |
| `cover` | | 封面圖檔名主幹，見上方說明 |
| `tags` | | 字串陣列，顯示成標籤 |
| `draft` | | `true` 會把結尾文字改成「文章仍在撰寫中」 |
| `width` | | `wide` 可讓版面加寬，適合有圖表的長文 |
| `outline` | | 字串陣列。用於還沒寫完的文章，顯示「將涵蓋以下主題」 |

### 選用的版面區塊

這些是為了保留現有文章的設計而做的。**平常寫文章用不到**，正文寫 Markdown 就夠了。

<details>
<summary><code>highlights</code> — 功能亮點的九宮格</summary>

```yaml
highlights:
  title: 功能亮點
  items:
    - title: 小標
      desc: 說明文字。
```
</details>

<details>
<summary><code>links</code> — 並排的連結卡片</summary>

```yaml
links:
  - kind: SOURCE CODE      # 卡片上方的小字，可省略
    title: 專案原始碼
    desc: 一句話說明。
    href: https://github.com/...
    cta: 前往 GitHub       # 按鈕文字，可省略
```
</details>

<details>
<summary><code>award</code> — 獎項橫幅與計分板</summary>

```yaml
award:
  badge: 獎項名稱
  period: 2026/03 - 2026/05
  link: { href: https://..., label: 官方網站 }
  heading: 大標題
  body: 說明段落。
  scoreboard:               # 可省略
    team: <Salmon>
    updated: 5/11 11:14
    stats:
      - { label: Rank, value: "4574" }
      # tone 可用 purple / sky / emerald / amber，省略為白色
      - { label: Score, value: "8872", tone: purple }
```
</details>

<details>
<summary><code>certificates</code> — 證書輪播</summary>

圖片同樣放 `assets/images/`（不是 `covers/`），`image` 填檔名主幹。

```yaml
certificates:
  title: 證書
  items:
    - title: Gold Medal
      desc: 說明文字。
      image: gold_medal
```

圖片還沒放上去也不會壞，會顯示「尚未提供 <檔名>」的佔位。
</details>

<details>
<summary><code>notes</code> — 單欄的重點卡片</summary>

```yaml
notes:
  - title: 小節標題
    icon: calculator        # award/book/calculator/rocket/shield/trophy
    body: 內容。
```
</details>

---

## 注意事項

- **frontmatter 必須夾在檔案最上方的兩行 `---` 之間**，這是唯一容易寫錯的地方。
- 欄位名稱打錯或缺漏，最多是那個區塊不顯示，不會讓網站建置失敗。
  但 `title` 或 `date` 缺少會擋下建置，並在 Actions 的 log 顯示是哪個檔案。
- 值裡面如果有冒號、`#` 或開頭是特殊符號，用引號包起來：`title: "Q&A：常見問題"`
