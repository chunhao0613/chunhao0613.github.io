// 「AI 建造」效果的共用設定，給 layout.js 的開場腳本與 SwarmBuild 元件共用。
//
// 只播一次是「每個頁面」各自計算：每個路徑一個 sessionStorage 鍵，
// 看過首頁之後第一次打開某篇文章，那篇文章仍然會播。

export const SWARM_MIN_WIDTH = 768; // 比這窄（手機）改用精簡模式播放

// 路徑正規化：靜態輸出可能帶 .html 或結尾斜線，視為同一頁
export const swarmKey = (pathname) => {
  const p = pathname.replace(/\.html$/, "").replace(/\/+$/, "");
  return `swarm:${p || "/"}`;
};

// 第一次繪製前執行（放在 <head>）：這一頁還沒播過就先把 [data-swarm] 區塊藏起來，
// 避免內容先閃一下再被藏。3.5 秒後無論如何都移除，就算 JS 沒載入成功，內容也不會一直藏著。
// 條件必須與 SwarmBuild 一致。
export const swarmBootScript = `try{var d=document.documentElement,p=location.pathname.replace(/\\.html$/,"").replace(/\\/+$/,"");if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&sessionStorage.getItem("swarm:"+(p||"/"))!=="1"){d.classList.add("swarm-intro");setTimeout(function(){d.classList.remove("swarm-intro")},3500)}}catch(e){}`;
