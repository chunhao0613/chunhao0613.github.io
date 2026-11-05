// tone 色彩：MD 裡用 `tone: sky` 這類名稱指定顏色，對應到 Tailwind class。
// 首頁區塊與文章區塊共用同一份，新增顏色只要在這裡加一列（class 要寫完整字串，Tailwind 才掃得到）。
//
//   text：文字顏色    dot：小圓點、狀態燈    swatch：/styleguide 展示用的色塊
export const TONES = {
  default: { text: "text-white", dot: "bg-white", swatch: "bg-white" },
  muted: { text: "text-zinc-400", dot: "bg-zinc-400", swatch: "bg-zinc-400" },
  green: { text: "text-green-400", dot: "bg-green-500", swatch: "bg-green-500" },
  emerald: { text: "text-emerald-400", dot: "bg-emerald-400", swatch: "bg-emerald-400" },
  sky: { text: "text-sky-400", dot: "bg-sky-400", swatch: "bg-sky-400" },
  purple: { text: "text-purple-400", dot: "bg-purple-400", swatch: "bg-purple-400" },
  amber: { text: "text-amber-400", dot: "bg-amber-400", swatch: "bg-amber-400" },
  rose: { text: "text-rose-400", dot: "bg-rose-400", swatch: "bg-rose-400" },
};

export const TONE_NAMES = Object.keys(TONES);

// 找不到（沒填或打錯）就用元件自己的預設樣式，不會讓畫面壞掉
export const toneText = (tone, fallback = "") => TONES[tone]?.text ?? fallback;
export const toneDot = (tone, fallback = "") => TONES[tone]?.dot ?? fallback;
