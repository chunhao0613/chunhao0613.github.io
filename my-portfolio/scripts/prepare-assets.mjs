// 建置前的資產處理入口。由 package.json 的 prebuild 自動觸發，
// 因此本機 `npm run build` 與 CI 走的是同一條路徑。
// 兩支子 script 都以 manifest 做快取，沒有變動時不做任何事。
console.log("準備資產…");
await import("./subset-font.mjs");
await import("./optimize-images.mjs");
