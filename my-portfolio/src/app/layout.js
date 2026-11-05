import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// 由 scripts/subset-font.mjs 產生（僅含本站用到的字元）。
// 原字型 NaniFont 採 SIL OFL 1.1，授權見 src/fonts/OFL.txt。
const nanifont = localFont({
  src: "../fonts/NaniFont-subset.woff2",
  variable: "--font-nani",
  display: "swap",
  weight: "100 900",
  // 保留 adjustFontFallback 預設值，Next 會自動產生度量對齊的備援字型，
  // 減少 swap 時的版面跳動
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://chunhao0613.github.io"),
  title: {
    default: "余駿豪 (鮭魚) | 軟體工程師 Portfolio",
    template: "%s | 余駿豪 (鮭魚)",
  },
  description: "軟體開發者余駿豪的個人作品集。擅長系統架構、AI RAG 應用、IoT 與區塊鏈技術。",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "余駿豪 (鮭魚) | 軟體工程師 Portfolio",
    description: "軟體開發者余駿豪的個人作品集。",
    url: "/",
    siteName: "Chun-Hao Yu Portfolio",
    type: "website",
  },
};

// 在第一次繪製前就決定是否播放開場建構動畫（條件與 SwarmBuild.js 相同），
// 避免首頁內容先閃一下再被藏起來。3.5 秒後無論如何都移除，
// 就算 JS 沒載入成功，內容也不會一直藏著。
const swarmBoot = `try{var d=document.documentElement;if(location.pathname==="/"&&innerWidth>=768&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&sessionStorage.getItem("swarm-intro-done")!=="1"){d.classList.add("swarm-intro");setTimeout(function(){d.classList.remove("swarm-intro")},3500)}}catch(e){}`;

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "余駿豪",
    alternateName: "鮭魚",
    url: "https://chunhao0613.github.io",
    email: "chunhao0613@gmail.com",
    sameAs: [
      "https://github.com/chunhao0613"
    ],
    jobTitle: "Software Engineer",
    description: "軟體開發者。擅長系統架構、AI RAG 應用、IoT 與區塊鏈技術。",
  };

  return (
    <html
      lang="zh-TW"
      suppressHydrationWarning
      className={`${nanifont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: swarmBoot }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
