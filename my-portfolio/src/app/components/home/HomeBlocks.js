"use client";

// 首頁的版面區塊，由 content/home.md 的 `block:` 宣告驅動。
// 每個區塊的 DOM 與 class 刻意和原本手寫的版本完全相同：
// 「AI 建造」效果靠 class 判斷重複元件，白天模式的配色覆寫也是對 class 寫的。
//
// 區塊：hero、featured、steps、projects、posts、contact（欄位說明見 content/README.md）

import React, { useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { NamedIcon } from "./icons";
import Reveal from "../Reveal";
import { WaveText, DeconstructTitle, SalmonEasterEgg } from "../CanvasEffects";
import { toneDot, toneText } from "@/lib/tones";

// ---------------------------------------------------------------- 共用

// 連結：站內（/blog/…）用 next/link、頁內錨點（#…）用 <a>、外部連結開新分頁
function SmartLink({ href, className, children, ...rest }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }
  const external = /^https?:/.test(href);
  return (
    <a href={href} className={className} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
      {children}
    </a>
  );
}

// 「我的角色」：空行分段，用換行接起來（維持是一段文字，建造效果才會整段串流）
function Paragraphs({ text }) {
  const parts = String(text ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return parts.map((p, i) => (
    <React.Fragment key={i}>
      {i > 0 ? <br /> : null}
      {p}
    </React.Fragment>
  ));
}

// terminal 的資料：YAML 物件 → JSON 樣式，key 與字串值各自上色
function JsonValue({ value, depth, keyClass, valueClass }) {
  const pad = "  ".repeat(depth);
  if (Array.isArray(value)) {
    return (
      <>
        [
        {value.map((v, i) => (
          <React.Fragment key={i}>
            {i > 0 ? ", " : ""}
            <JsonValue value={v} depth={depth} keyClass={keyClass} valueClass={valueClass} />
          </React.Fragment>
        ))}
        ]
      </>
    );
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    return (
      <>
        {"{\n"}
        {entries.map(([k, v], i) => (
          <React.Fragment key={k}>
            {pad}
            {"  "}
            <span className={keyClass}>&quot;{k}&quot;</span>:{" "}
            <JsonValue value={v} depth={depth + 1} keyClass={keyClass} valueClass={valueClass} />
            {i < entries.length - 1 ? "," : ""}
            {"\n"}
          </React.Fragment>
        ))}
        {pad}
        {"}"}
      </>
    );
  }
  if (typeof value === "string") return <WaveText text={`"${value}"`} className={valueClass} />;
  return <span className={valueClass}>{String(value)}</span>;
}

// ---------------------------------------------------------------- hero

export function HeroBlock({ block }) {
  const t = block.terminal;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full [&>*]:min-w-0">
      <div>
        {block.status ? (
          <Reveal type="slide-left" triggerOnMount={true}>
            <p className="text-zinc-500 font-mono text-sm mb-6 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${toneDot(block.statusTone, "bg-green-500")} animate-pulse`} />
              {block.status}
            </p>
          </Reveal>
        ) : null}
        <Reveal delay={100} type="fade-up" triggerOnMount={true}>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight mb-4 font-handwriting">
            {block.greeting}
            <br />
            {block.name}{" "}
            {block.nickname ? (
              <span className="text-3xl md:text-5xl text-zinc-500 font-medium tracking-normal font-handwriting">
                / <SalmonEasterEgg>{block.nickname}</SalmonEasterEgg>
              </span>
            ) : null}
          </h1>
          {block.role ? (
            <h2 className="text-2xl md:text-3xl text-zinc-400 font-medium mb-8 font-handwriting tracking-wide">
              {block.role}
            </h2>
          ) : null}
        </Reveal>
        {block.intro ? (
          <Reveal delay={200} type="fade-up" triggerOnMount={true}>
            <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-lg">{block.intro}</p>
          </Reveal>
        ) : null}
        {block.buttons?.length ? (
          <Reveal delay={300} type="fade-up" triggerOnMount={true}>
            <div className="flex gap-4 items-center">
              {block.buttons.map((b) =>
                b.style === "primary" ? (
                  <SmartLink
                    key={b.href}
                    href={b.href}
                    className="bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    {b.label} <ArrowUpRight size={18} />
                  </SmartLink>
                ) : (
                  <SmartLink
                    key={b.href}
                    href={b.href}
                    className="text-zinc-400 hover:text-white px-6 py-3 transition-colors font-medium"
                  >
                    {b.label}
                  </SmartLink>
                )
              )}
            </div>
          </Reveal>
        ) : null}
      </div>

      {t ? (
        <Reveal delay={400} type="scale" triggerOnMount={true}>
          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-6 md:p-8 font-mono text-sm shadow-2xl relative group w-full lg:max-w-2xl ml-auto">
            <div className="flex gap-2 mb-4 border-b border-slate-800 pb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className={`${toneText(t.commandTone, "text-emerald-400")} mb-2`}>➜ ~ {t.command}</div>
            <pre className="text-slate-300 overflow-x-auto leading-relaxed">
              <code>
                <JsonValue
                  value={t.data ?? {}}
                  depth={0}
                  keyClass={toneText(t.keyTone, "text-sky-400")}
                  valueClass={toneText(t.valueTone, "text-white")}
                />
              </code>
            </pre>
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------- featured

export function FeaturedBlock({ block, projects }) {
  const p = projects.find((x) => x.slug === block.project);
  if (!p) return null;
  const coverHref = p.links[0]?.href;
  const cover = p.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={p.image}
      alt={p.coverAlt}
      width={1200}
      height={750}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 w-full h-full object-cover object-left-top group-hover:scale-[1.03] transition-transform duration-700 ease-out"
    />
  ) : null;
  const coverClass =
    "group relative block bg-zinc-950 aspect-[16/10] lg:aspect-auto overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-800";
  return (
    <Reveal type="fade-up">
      <article className="mb-16 md:mb-24 rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <div className="grid lg:grid-cols-[1.1fr_1fr]">
          {coverHref ? (
            <SmartLink href={coverHref} className={coverClass}>
              {cover}
            </SmartLink>
          ) : (
            <div className={coverClass}>{cover}</div>
          )}
          <div className="p-8 md:p-10 flex flex-col">
            <p className="text-zinc-500 font-mono text-sm mb-4 border-l-2 border-zinc-700 pl-3">
              {[block.eyebrow, p.period].filter(Boolean).join(" · ")}
            </p>
            <h3 className="text-3xl font-bold mb-4">{p.title}</h3>
            <p className="text-zinc-400 leading-relaxed mb-6">{p.summary}</p>
            {p.stats.length ? (
              <dl className="grid grid-cols-2 gap-4 mb-6">
                {p.stats.map((s) => (
                  <div key={s.label} className="border-l-2 border-zinc-700 pl-3">
                    <dt className={`text-xl font-bold ${toneText(s.tone, "text-zinc-100")} font-mono`}>{s.value}</dt>
                    <dd className="text-xs text-zinc-500 mt-1">{s.label}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <div className="flex flex-wrap gap-2 mb-8">
              {p.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 font-mono">
                  {tag}
                </span>
              ))}
            </div>
            {/* 主要按鈕自成一列、次要按鈕排在下一列：主次分明，也不會因為主要按鈕的字長被擠到換行 */}
            <div className="mt-auto flex flex-col items-start gap-3">
              {[p.links.filter((l) => l.style === "primary"), p.links.filter((l) => l.style !== "primary")]
                .filter((row) => row.length)
                .map((row, r) => (
                  <div key={r} className="flex flex-wrap gap-3">
                    {row.map((l) => (
                      <SmartLink
                        key={l.href}
                        href={l.href}
                        className={
                          l.style === "primary"
                            ? "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-white transition-colors"
                            : "inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
                        }
                      >
                        {l.icon ? (
                          <>
                            <NamedIcon name={l.icon} size={16} /> {l.label}
                          </>
                        ) : (
                          <>
                            {l.label} <ArrowUpRight size={16} />
                          </>
                        )}
                      </SmartLink>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

// ---------------------------------------------------------------- steps

export function StepsBlock({ block }) {
  return (
    <Reveal type="fade-up">
      <div className="mb-20 md:mb-32">
        {block.title ? <h3 className="text-2xl font-bold mb-3">{block.title}</h3> : null}
        {block.intro ? <p className="text-zinc-400 mb-10 max-w-3xl leading-relaxed">{block.intro}</p> : null}
        <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(block.items ?? []).map((item, i) => (
            <li key={item.title} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30">
              <span className={`font-mono text-xs ${toneText(item.tone, "text-zinc-500")}`}>{String(i + 1).padStart(2, "0")}</span>
              <h4 className="text-lg font-bold mt-2 mb-2 text-zinc-100">{item.title}</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}

// ---------------------------------------------------------------- projects

// 專案卡。wide：奇數張時的最後一張，在寬螢幕佔滿整列，左邊是介紹、右邊是角色、標籤與連結，
// 避免右半邊空一塊。一般卡片的 DOM 維持不變（建造效果靠 class 判斷重複元件）
function ProjectCard({ project, wide }) {
  const head = (
    <>
      <p className="text-zinc-500 font-mono text-xs mb-3 border-l-2 border-zinc-700 pl-3">{project.period}</p>
      <h4 className="text-2xl font-bold mb-3 text-zinc-100">{project.title}</h4>
      {project.positioning ? <p className="text-zinc-200 mb-3 leading-relaxed">{project.positioning}</p> : null}
      {project.summary ? <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{project.summary}</p> : null}
    </>
  );
  const tail = (
    <>
      {project.role ? (
        <div className="text-sm text-zinc-400 mb-6 leading-relaxed border-l-2 border-zinc-600 pl-3">
          <span className="font-mono text-xs text-zinc-500 block mb-1">我的角色</span>
          <Paragraphs text={project.role} />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2 mb-6">
        {project.tags.map((tag) => (
          <span key={tag} className="text-xs px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 font-mono">{tag}</span>
        ))}
      </div>
      <div className="mt-auto flex flex-wrap gap-3">
        {project.links.map((link) => (
          <SmartLink key={link.href} href={link.href} className="inline-flex items-center gap-1 text-sm text-zinc-300 hover:text-white transition-colors">
            {link.label} <ArrowUpRight size={14} />
          </SmartLink>
        ))}
      </div>
    </>
  );
  if (!wide) {
    return (
      <article className="h-full flex flex-col p-8 rounded-3xl border border-zinc-800 bg-zinc-900/30">
        {head}
        {tail}
      </article>
    );
  }
  return (
    <article className="h-full flex flex-col md:grid md:grid-cols-2 md:gap-x-10 p-8 rounded-3xl border border-zinc-800 bg-zinc-900/30">
      <div>{head}</div>
      <div className="flex flex-col">{tail}</div>
    </article>
  );
}

export function ProjectsBlock({ block, projects, featured = [] }) {
  // 已經被精選的專案不重複列出；block.only 可指定只列哪些（styleguide 用）
  const list = projects.filter((p) => (block.only ? block.only.includes(p.slug) : !featured.includes(p.slug)));
  return (
    <>
      {block.title || block.intro ? (
        <Reveal type="fade-up">
          {block.title ? <h3 className="text-2xl font-bold mb-3">{block.title}</h3> : null}
          {block.intro ? <p className="text-zinc-400 mb-10 max-w-3xl leading-relaxed">{block.intro}</p> : null}
        </Reveal>
      ) : null}
      <div className="grid md:grid-cols-2 gap-6">
        {list.map((project, i) => {
          const wide = list.length % 2 === 1 && i === list.length - 1;
          return (
            <Reveal key={project.slug} type="fade-up" className={wide ? "md:col-span-2" : ""}>
              <ProjectCard project={project} wide={wide} />
            </Reveal>
          );
        })}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- posts

export function PostsBlock({ block, posts }) {
  const scrollRef = useRef(null);
  const list = block.limit ? posts.slice(0, block.limit) : posts;

  const scrollBlog = useCallback((direction) => {
    const current = scrollRef.current;
    if (!current) return;
    // 一次翻一張卡片：卡片寬度＋卡片間距。用量的而不是容器寬度的 1/3，
    // 否則每次少 8px，只能靠捲動吸附硬拉回來，有些瀏覽器會看到偏移
    const card = current.firstElementChild;
    const gap = parseFloat(getComputedStyle(current).columnGap) || 0;
    const scrollAmount = card ? card.getBoundingClientRect().width + gap : current.clientWidth;
    current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  }, []);

  return (
    <>
      <Reveal type="slide-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-3xl md:text-4xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <NamedIcon name={block.icon ?? "book"} size={24} className="text-zinc-500" /> <DeconstructTitle>{block.title}</DeconstructTitle>
            </div>
            {block.intro ? <p className="text-zinc-400 max-w-2xl">{block.intro}</p> : null}
          </div>

          {/* 電腦端方向鍵 */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={() => scrollBlog("left")}
              aria-label="上一篇"
              className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollBlog("right")}
              aria-label="下一篇"
              className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </Reveal>

      <div className="relative -mx-6 px-6">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-12 pt-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {list.map((post, idx) => (
            <Reveal
              key={post.slug}
              delay={idx * 100}
              type="fade-up"
              className="w-full md:w-[calc(33.3333%-16px)] shrink-0 snap-start h-full"
            >
              <Link
                href={post.href}
                className="group/card flex flex-col h-full bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-600 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
              >
                <div className="aspect-[16/9] w-full bg-zinc-950 relative overflow-hidden border-b border-zinc-800/50">
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent z-10 pointer-events-none" />
                  {post.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.image}
                      alt={post.title}
                      width={800}
                      height={450}
                      // 前三張在首屏內，其餘延後載入
                      loading={idx < 3 ? "eager" : "lazy"}
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 group-hover/card:scale-105 transition-transform duration-700 ease-out bg-zinc-900">
                      <ImageIcon size={32} className="opacity-30 mb-2" />
                      <span className="font-mono text-xs tracking-wider opacity-50">IMAGE</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow justify-between bg-zinc-900/20">
                  <div>
                    <span className="text-xs font-mono text-zinc-500 mb-3 block">{post.displayDate}</span>
                    <h3 className="text-lg font-bold text-zinc-300 group-hover/card:text-white transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-3">{post.excerpt}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-xs font-medium text-zinc-400 group-hover/card:text-white transition-colors">
                    <span>閱讀文章</span>
                    <ArrowUpRight size={14} className="transition-transform duration-300 group-hover/card:translate-x-1 group-hover/card:-translate-y-1" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- contact

export function ContactBlock({ block }) {
  const buttons = block.buttons ?? [];
  const primary = buttons.filter((b) => b.style === "primary");
  const chips = buttons.filter((b) => b.style !== "primary");
  return (
    <Reveal type="scale" className="text-center">
      <DeconstructTitle className="text-4xl md:text-5xl font-bold tracking-tighter mb-8 relative z-10 font-handwriting justify-center">
        {block.title}
      </DeconstructTitle>
      {block.text ? (
        <p className="text-zinc-400 mb-12 max-w-lg mx-auto relative z-10 text-lg font-handwriting tracking-wide">{block.text}</p>
      ) : null}

      {primary.map((b) => (
        <SmartLink
          key={b.href}
          href={b.href}
          className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
        >
          <NamedIcon name={b.icon} /> {b.label}
        </SmartLink>
      ))}

      {chips.length ? (
        <div className="mt-16 md:mt-24 flex justify-center gap-6 relative z-10">
          {chips.map((b) => (
            <SmartLink
              key={b.href}
              href={b.href}
              aria-label={b.title ?? b.label}
              title={b.title ?? b.label}
              className="inline-flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all font-medium"
            >
              <NamedIcon name={b.icon} />
              <span>{b.label}</span>
            </SmartLink>
          ))}
        </div>
      ) : null}
    </Reveal>
  );
}

// ---------------------------------------------------------------- 分派與段落

const BLOCKS = {
  hero: HeroBlock,
  featured: FeaturedBlock,
  steps: StepsBlock,
  projects: ProjectsBlock,
  posts: PostsBlock,
  contact: ContactBlock,
};

export function HomeBlock({ block, projects, posts, featured }) {
  const Component = BLOCKS[block.block];
  return Component ? <Component block={block} projects={projects} posts={posts} featured={featured} /> : null;
}

// 段落的外框依第一個區塊決定：hero 佔滿一屏、contact 置中，其他是一般段落
export function HomeSection({ section, projects, posts, featured }) {
  const first = section.blocks[0]?.block;
  const className =
    first === "hero"
      ? "min-h-screen flex items-center border-b border-zinc-900 pt-28 pb-16 md:pt-20 md:pb-0"
      : first === "contact"
        ? "py-20 md:py-32 text-center relative"
        : "py-20 md:py-32 border-b border-zinc-900 relative";
  return (
    <section id={section.id} className={className}>
      {section.title ? (
        <Reveal>
          <div className="flex items-center gap-3 mb-12 md:mb-20">
            <NamedIcon name={section.icon} size={24} className="text-zinc-500" />
            <DeconstructTitle className="text-3xl md:text-4xl font-bold tracking-tight">{section.title}</DeconstructTitle>
          </div>
        </Reveal>
      ) : null}
      {section.blocks.map((block, i) => (
        <HomeBlock key={i} block={block} projects={projects} posts={posts} featured={featured} />
      ))}
    </section>
  );
}

// 首頁上被精選（featured）的專案，不再出現在「其他專案」列表
export const featuredSlugs = (sections) =>
  sections.flatMap((s) => s.blocks.filter((b) => b.block === "featured").map((b) => b.project));
