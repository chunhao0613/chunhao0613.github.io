import Link from "next/link";

import { getAliasTarget, getAllPosts, getPost } from "@/lib/posts";
import { getProjects } from "@/lib/home";
import { MarkdownContent } from "../../components/markdown/MarkdownContent";
import { BackButton } from "./BackButton";
import SwarmBuild from "../../components/SwarmBuild";
import { CertificateCarousel } from "../../components/post/CertificateCarousel";
import {
  AwardBanner,
  Highlights,
  LinkCards,
  NoteCards,
  Outline,
  TagList,
} from "../../components/post/PostBlocks";

// static export：把每個 slug 都烘成靜態頁
// 舊網址（frontmatter 的 aliases）也各產生一頁，內容只是轉到新網址
export function generateStaticParams() {
  const posts = getAllPosts();
  return [...posts.map((post) => post.slug), ...posts.flatMap((post) => post.aliases)].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const moved = getAliasTarget(slug);
  if (moved) return { title: moved.title, alternates: { canonical: moved.href }, robots: { index: false } };
  const post = getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: post.href },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: post.href,
      siteName: "Chun-Hao Yu Portfolio",
      type: "article",
      publishedTime: post.date,
      images: post.ogImage ? [post.ogImage] : undefined,
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  // 舊網址：用 meta refresh 立刻轉到新網址（不靠 JavaScript，搜尋引擎也看得懂），並附上連結
  const moved = getAliasTarget(slug);
  if (moved) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center p-6">
        <meta httpEquiv="refresh" content={`0; url=${moved.href}`} />
        <p>
          這篇文章搬到了新網址：
          <Link href={moved.href} className="text-white underline">
            {moved.title}
          </Link>
        </p>
      </div>
    );
  }
  const post = getPost(slug);
  const container = post.width === "wide" ? "max-w-5xl" : "max-w-3xl";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans pt-20 pb-20">
      {/* 「AI 建造」完整版：標題、封面、文章區塊與內文的每一段，進入畫面時各自被建造 */}
      <SwarmBuild />
      <div className={`${container} mx-auto px-6`}>
        <BackButton />

        <article className="max-w-none">
          <header data-swarm="" className="mb-12 border-b border-zinc-800 pb-8">
            <time className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              {post.displayDate}
            </time>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6 tracking-tight">{post.title}</h1>
            {post.lede ? (
              <p className="text-lg md:text-xl text-zinc-400 max-w-3xl leading-relaxed">
                {post.lede}
              </p>
            ) : null}
          </header>

          {post.image ? (
            <div data-swarm="" className="mb-12">
              <figure className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 aspect-[16/9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image}
                  alt={`${post.title} 封面`}
                  width={1200}
                  height={675}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </figure>
            </div>
          ) : null}

          <AwardBanner award={post.award} />

          {post.notes || post.certificates ? (
            <NoteCards notes={post.notes}>
              {post.certificates ? (
                <CertificateCarousel certificates={post.certificates} />
              ) : null}
            </NoteCards>
          ) : null}

          <Highlights highlights={post.highlights} tags={post.tags} />
          <LinkCards links={post.links} />

          {post.body ? (
            // 內文支援 ```block 區塊語法（見 content/README.md）
            <MarkdownContent source={post.body} projects={getProjects()} posts={getAllPosts()} swarm />
          ) : null}

          {!post.body && !post.highlights && post.tags?.length ? (
            <div data-swarm="" className="mb-10">
              <TagList tags={post.tags} />
            </div>
          ) : null}

          <Outline outline={post.outline} />

          <section data-swarm="" className="mt-12 pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              {post.draft
                ? "文章仍在撰寫中。如果你有想看的內容或建議，歡迎"
                : "文章仍在持續補充中。如果你有想看的主題或希望我補充的技術細節，歡迎"}
              <Link href="/#contact" className="text-white hover:text-zinc-300 underline">
                聯絡我
              </Link>
              。
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
