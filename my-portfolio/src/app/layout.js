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
      className={`${nanifont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
