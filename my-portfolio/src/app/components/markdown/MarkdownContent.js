// Markdown 內文的渲染，以及「區塊語法」：在內文裡寫一段 ```block 程式碼區塊，
// 內容是 YAML，就會被渲染成真正的區塊（首頁區塊或文章區塊都可以）。
//
//   ```block            ← 首頁區塊：有 block: 欄位
//   block: steps
//   title: 三個原則
//   items:
//     - { title: 定義限制, desc: …, tone: sky }
//   ```
//
//   ```block            ← 文章區塊：用文章 frontmatter 的欄位名稱
//   highlights:
//     title: 功能亮點
//     items: [ … ]
//   ```
//
//   ```tones            ← 顯示所有 tone 色彩
//   ```
//   ```icons            ← 顯示所有可用的圖示名稱
//   ```
//
// 只在伺服器端（建置期）執行。YAML 寫錯時會在頁面上顯示錯誤框，不會讓建置失敗。
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";

import { HOME_BLOCKS } from "@/lib/home";
import { TONES, TONE_NAMES } from "@/lib/tones";
import { HomeBlock } from "../home/HomeBlocks";
import { NamedIcon, ICON_NAMES } from "../home/icons";
import { CertificateCarousel } from "../post/CertificateCarousel";
import { AwardBanner, Highlights, ICONS as POST_ICONS, LinkCards, NoteCards, Outline, TagList } from "../post/PostBlocks";

// Markdown 產出的元素套上站內既有的深色樣式。
// 用明確的 components 對應而不是 prose class，是為了讓文章的外觀跟手寫區塊完全一致。
const base = {
  h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-zinc-200 mt-12 mb-4" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-zinc-200 mt-8 mb-3" {...props} />,
  p: ({ node, ...props }) => <p className="text-zinc-400 leading-relaxed mb-4" {...props} />,
  ul: ({ node, ...props }) => <ul className="space-y-3 text-zinc-400 leading-relaxed mb-6 pl-5 list-disc" {...props} />,
  ol: ({ node, ...props }) => <ol className="space-y-3 text-zinc-400 leading-relaxed mb-6 pl-5 list-decimal" {...props} />,
  li: ({ node, ...props }) => <li className="marker:text-zinc-600" {...props} />,
  strong: ({ node, ...props }) => <strong className="text-zinc-200 font-semibold" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-2 border-zinc-700 pl-4 text-zinc-400 italic my-6" {...props} />
  ),
  code: ({ node, children, className, ...props }) =>
    className ? (
      <code className={`${className} font-mono text-sm`} {...props}>
        {children}
      </code>
    ) : (
      <code className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-sm font-mono text-zinc-300 [overflow-wrap:anywhere]" {...props}>
        {children}
      </code>
    ),
  a: ({ node, href = "", ...props }) =>
    href.startsWith("/") ? (
      <Link href={href} className="text-white hover:text-zinc-300 underline" {...props} />
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-white hover:text-zinc-300 underline" {...props} />
    ),
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm text-zinc-400 border border-zinc-800 rounded-lg" {...props} />
    </div>
  ),
  th: ({ node, ...props }) => <th className="text-left text-zinc-300 font-semibold p-3 border-b border-zinc-800" {...props} />,
  td: ({ node, ...props }) => <td className="p-3 border-b border-zinc-800/50" {...props} />,
  img: ({ node, src = "", alt = "", ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" className="rounded-lg my-6 w-full" {...props} />
  ),
};

const PRE_CLASS = "bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto mb-6 text-sm";
const FENCES = ["block", "tones", "icons"];

// 用 gray-matter 解析 YAML：包成 frontmatter 再讀（不必另外裝 YAML 套件）
const parseYaml = (src) => matter(`---\n${src}\n---\n`).data ?? {};

function TonePalette() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {TONE_NAMES.map((name) => (
        <div key={name} className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
          <span className={`w-8 h-8 rounded-full shrink-0 ${TONES[name].swatch}`} />
          <div className="min-w-0">
            <div className={`font-bold ${TONES[name].text}`}>Aa 文字 123</div>
            <code className="text-xs font-mono text-zinc-500">tone: {name}</code>
          </div>
        </div>
      ))}
    </div>
  );
}

function IconRow({ title, names, render }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-mono text-zinc-500 mb-2">{title}</p>
      <div className="flex flex-wrap gap-3">
        {names.map((n) => (
          <span key={n} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/30 text-zinc-300">
            {render(n)}
            <code className="text-xs font-mono text-zinc-500">{n}</code>
          </span>
        ))}
      </div>
    </div>
  );
}

const renderPostIcon = (n) => {
  const Icon = POST_ICONS[n];
  return <Icon size={18} />;
};

function IconPalette() {
  return (
    <>
      <IconRow title="首頁區塊與段落（icon:）" names={ICON_NAMES} render={(n) => <NamedIcon name={n} size={18} />} />
      <IconRow title="文章的 notes／highlights（icon:）" names={Object.keys(POST_ICONS)} render={renderPostIcon} />
    </>
  );
}

// 文章區塊：欄位名稱和文章 frontmatter 一樣
function PostBlocks({ data }) {
  return (
    <>
      <AwardBanner award={data.award} />
      {data.notes || data.certificates ? (
        <NoteCards notes={data.notes}>
          {data.certificates ? <CertificateCarousel certificates={data.certificates} /> : null}
        </NoteCards>
      ) : null}
      <Highlights highlights={data.highlights} tags={data.tags} />
      <LinkCards links={data.links} />
      {!data.highlights && data.tags?.length ? (
        <div className="mb-10">
          <TagList tags={data.tags} />
        </div>
      ) : null}
      <Outline outline={data.outline} />
    </>
  );
}

function BlockError({ message, source }) {
  return (
    <div className="my-8 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm">
      <p className="text-rose-300 font-semibold mb-2">這個區塊沒辦法顯示：{message}</p>
      <pre className="text-rose-200/70 font-mono text-xs overflow-x-auto whitespace-pre-wrap">{source}</pre>
    </div>
  );
}

function Fence({ lang, source, ctx }) {
  let preview;
  if (lang === "tones") preview = <TonePalette />;
  else if (lang === "icons") preview = <IconPalette />;
  else {
    let data;
    try {
      data = parseYaml(source);
    } catch (e) {
      return <BlockError message={`YAML 格式錯誤（${e.reason ?? e.message}）`} source={source} />;
    }
    if (data.block) {
      if (!HOME_BLOCKS.includes(data.block)) {
        return <BlockError message={`未知的區塊類型「${data.block}」，可用的有：${HOME_BLOCKS.join("、")}`} source={source} />;
      }
      preview = <HomeBlock block={data} projects={ctx.projects} posts={ctx.posts} featured={[]} />;
    } else {
      preview = <PostBlocks data={data} />;
    }
  }

  // data-swarm="off"：內文裡的區塊直接顯示，不參與「AI 建造」效果
  if (!ctx.showSource || lang !== "block") {
    return (
      <div data-swarm="off" className="my-10">
        {preview}
      </div>
    );
  }
  // 展示頁：上面是寫法，下面是實際的樣子
  return (
    <div data-swarm="off" className="my-10 rounded-2xl border border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/60">
        <span className="text-xs font-mono text-zinc-500">寫法</span>
        <span className="text-xs font-mono text-zinc-600">```block</span>
      </div>
      <pre className="bg-zinc-950 p-4 overflow-x-auto text-xs leading-relaxed text-zinc-300 font-mono border-b border-zinc-800">{source.trim()}</pre>
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/60">
        <span className="text-xs font-mono text-zinc-500">實際樣子</span>
      </div>
      <div className="p-6 md:p-8 text-left">{preview}</div>
    </div>
  );
}

// ctx：{ projects, posts } 給首頁區塊用；showSource：展示頁要同時顯示寫法
export function MarkdownContent({ source, projects = [], posts = [], showSource = false }) {
  const ctx = { projects, posts, showSource };
  const components = {
    ...base,
    pre: ({ node, children, ...props }) => {
      const code = node?.children?.[0];
      const cls = code?.properties?.className ?? [];
      const lang = cls.find((c) => String(c).startsWith("language-"))?.slice(9);
      if (FENCES.includes(lang)) {
        const text = (code.children ?? []).map((c) => c.value ?? "").join("");
        return <Fence lang={lang} source={text} ctx={ctx} />;
      }
      return (
        <pre className={PRE_CLASS} {...props}>
          {children}
        </pre>
      );
    },
  };
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components}>
      {source}
    </Markdown>
  );
}
