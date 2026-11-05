import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProjects, readBlocksFile } from "@/lib/home";
import { getAllPosts } from "@/lib/posts";
import { MarkdownContent } from "../components/markdown/MarkdownContent";

// 區塊與色彩的展示頁：內容是 content/styleguide.md，用「區塊語法」寫成，
// 每個區塊同時顯示寫法與實際樣子。不放進搜尋引擎，也不出現在選單。
export const metadata = {
  title: "區塊與色彩",
  robots: { index: false, follow: false },
};

export default function Styleguide() {
  const { data, content } = readBlocksFile("styleguide.md");
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-10">
          <ArrowLeft size={16} /> 回首頁
        </Link>
        <header className="mb-12 border-b border-zinc-800 pb-8">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Styleguide</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6 tracking-tight">{data.title ?? "區塊與色彩"}</h1>
          {data.intro ? <p className="text-lg text-zinc-400 max-w-3xl leading-relaxed">{data.intro}</p> : null}
        </header>
        <MarkdownContent source={content} projects={getProjects()} posts={getAllPosts()} showSource />
      </div>
    </div>
  );
}
