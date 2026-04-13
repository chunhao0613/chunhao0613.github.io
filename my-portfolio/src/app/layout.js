import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "余駿豪 (鮭魚) | 軟體工程師 Portfolio",
  description: "軟體開發者余駿豪的個人作品集。擅長系統架構、AI RAG 應用、IoT 與區塊鏈技術。",
  canonical: "https://chunhao0613.github.io",
  openGraph: {
    title: "余駿豪 (鮭魚) | 軟體工程師 Portfolio",
    description: "軟體開發者余駿豪的個人作品集。",
    url: "https://chunhao0613.github.io",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
