# 余駿豪（鮭魚）的作品集

部署：推上 `main` 後由 GitHub Actions 自動建置並發佈到 GitHub Pages。

| 想做的事 | 改哪裡 |
|---|---|
| 新增專案 | `content/projects/` 加一個 `.md` |
| 新增文章 | `content/blog/` 加一個 `.md`，寫法見 `content/blog/README.md` |
| 修改首頁內容、順序、選單 | `content/home.md` |
| 看所有區塊與色彩的樣子 | 打開 `/styleguide`（內容在 `content/styleguide.md`） |

區塊與色彩的完整寫法見 `content/README.md`。首頁區塊的元件在 `src/app/components/home/HomeBlocks.js`，
要新增一種區塊：在那裡加元件並登記到 `BLOCKS`，再把名稱加進 `src/lib/home.js` 的 `HOME_BLOCKS`。

## 「AI 建造」效果

第一次打開頁面時，一群游標像 agent 一樣，把頁面從線框、骨架、內容一路做到上色。
程式在 `src/app/components/SwarmBuild.js`，共用設定在 `src/lib/swarm.js`。

- **哪些內容會被建造**：標了 `data-swarm` 的區塊。`<Reveal>`（`src/app/components/Reveal.js`）會自動加上，
  區塊裡的文字、圖片、卡片、重複元件都會自動判斷，不用另外設定。
- **完整版與輕量版**：
  - `<SwarmBuild />`：完整版，有尺規、參考線、間距標註、⌥ 複製（首頁）
  - `<SwarmBuild mode="light" />`：輕量版，只有拉框、串流、去噪、上色與紀錄（文章頁只建造標題區和封面，內文直接顯示）
- **只播一次**：每個頁面在同一個瀏覽器分頁裡只播一次（以網址路徑區分）。想重看就開新分頁或無痕視窗。
- **不播放的情況**：螢幕寬度小於 768px、系統開啟「減少動態效果」。
- **某個元素不要套用**：加上 `data-swarm="off"`，它和裡面的內容會照常直接顯示。
- **保底**：每個區塊進入畫面後最多 2.6–5.5 秒（依元素數量）一定完整顯示，內容不會卡住。

### 新頁面要套用時

1. 頁面裡放一個 `<SwarmBuild />`（或 `mode="light"`）。
2. 想被建造的區塊用 `<Reveal>` 包起來，或直接加 `data-swarm=""`。

注意：有 `data-swarm` 的頁面一定要放 `<SwarmBuild />`。`layout.js` 的開場腳本會在第一次繪製前把這些區塊藏起來，
沒有 `<SwarmBuild />` 接手的話，要等 3.5 秒的保底才會出現。

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
