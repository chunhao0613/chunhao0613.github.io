import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getAllPosts, getPost } from "@/lib/posts";
import { BackButton } from "./BackButton";
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
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
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

// Markdown 產出的元素套上站內既有的深色樣式。
// 用明確的 components 對應而不是 prose class，是為了讓文章的外觀
// 跟手寫區塊完全一致。
const markdownComponents = {
  h2: (props) => <h2 className="text-2xl font-bold text-zinc-200 mt-12 mb-4" {...props} />,
  h3: (props) => <h3 className="text-xl font-bold text-zinc-200 mt-8 mb-3" {...props} />,
  p: (props) => <p className="text-zinc-400 leading-relaxed mb-4" {...props} />,
  ul: (props) => <ul className="space-y-3 text-zinc-400 leading-relaxed mb-6 pl-5 list-disc" {...props} />,
  ol: (props) => <ol className="space-y-3 text-zinc-400 leading-relaxed mb-6 pl-5 list-decimal" {...props} />,
  li: (props) => <li className="marker:text-zinc-600" {...props} />,
  strong: (props) => <strong className="text-zinc-200 font-semibold" {...props} />,
  blockquote: (props) => (
    <blockquote className="border-l-2 border-zinc-700 pl-4 text-zinc-400 italic my-6" {...props} />
  ),
  code: ({ children, className, ...props }) =>
    className ? (
      <code className={`${className} font-mono text-sm`} {...props}>
        {children}
      </code>
    ) : (
      <code
        className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-sm font-mono text-zinc-300"
        {...props}
      >
        {children}
      </code>
    ),
  pre: (props) => (
    <pre
      className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto mb-6 text-sm"
      {...props}
    />
  ),
  a: ({ href = "", ...props }) =>
    href.startsWith("/") ? (
      <Link href={href} className="text-white hover:text-zinc-300 underline" {...props} />
    ) : (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-zinc-300 underline"
        {...props}
      />
    ),
  table: (props) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm text-zinc-400 border border-zinc-800 rounded-lg" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="text-left text-zinc-300 font-semibold p-3 border-b border-zinc-800" {...props} />
  ),
  td: (props) => <td className="p-3 border-b border-zinc-800/50" {...props} />,
  img: ({ src = "", alt = "", ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" className="rounded-lg my-6 w-full" {...props} />
  ),
};

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  const container = post.width === "wide" ? "max-w-5xl" : "max-w-3xl";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans pt-20 pb-20">
      <div className={`${container} mx-auto px-6`}>
        <BackButton />

        <article className="max-w-none">
          <header className="mb-12 border-b border-zinc-800 pb-8">
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
            <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {post.body}
            </Markdown>
          ) : null}

          {!post.body && !post.highlights && post.tags?.length ? (
            <div className="mb-10">
              <TagList tags={post.tags} />
            </div>
          ) : null}

          <Outline outline={post.outline} />

          <section className="mt-12 pt-8 border-t border-zinc-800">
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
