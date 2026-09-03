// 由 frontmatter 資料驅動的版面區塊。
// 文章作者只需要在 .md 的 frontmatter 填欄位，不必碰 JSX ——
// 這是「能在 GitHub 網頁上安全編輯」的關鍵：填錯欄位頂多少一個區塊，
// 不會像手寫 JSX 那樣讓整個建置失敗。
import { ArrowUpRight, Award, BookOpen, Calculator, Rocket, ShieldAlert, Trophy } from "lucide-react";

const ICONS = {
  award: Award,
  book: BookOpen,
  calculator: Calculator,
  rocket: Rocket,
  shield: ShieldAlert,
  trophy: Trophy,
};

const TONES = {
  default: "text-white",
  purple: "text-purple-400",
  sky: "text-sky-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
};

const CARD = "bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-6";

function SectionHeading({ icon, children }) {
  const Icon = ICONS[icon] ?? BookOpen;
  return (
    <div className="inline-flex items-center gap-2 text-zinc-300 mb-4">
      <Icon size={18} />
      <h2 className="text-xl font-bold">{children}</h2>
    </div>
  );
}

export function TagList({ tags }) {
  if (!tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-xs px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 font-mono"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export function Highlights({ highlights, tags }) {
  if (!highlights?.items?.length) return null;
  return (
    <section className={`${CARD} mb-12`}>
      <SectionHeading icon={highlights.icon ?? "book"}>
        {highlights.title ?? "功能亮點"}
      </SectionHeading>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {highlights.items.map((item) => (
          <div key={item.title} className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-zinc-200 font-semibold mb-2">{item.title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
      <TagList tags={tags} />
    </section>
  );
}

export function LinkCards({ links }) {
  if (!links?.length) return null;
  return (
    <section className="grid md:grid-cols-2 gap-6 mb-10">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group block ${CARD} hover:border-zinc-600 transition-all hover:-translate-y-1`}
        >
          {link.kind ? (
            <span className="text-xs font-mono text-zinc-500 mb-3 block">{link.kind}</span>
          ) : null}
          <h3 className="text-2xl font-bold text-zinc-300 group-hover:text-white transition-colors mb-3">
            {link.title}
          </h3>
          <p className="text-zinc-400 leading-relaxed mb-4">{link.desc}</p>
          <span className="inline-flex items-center gap-2 text-zinc-300 group-hover:text-white transition-colors">
            {link.cta ?? "前往"} <ArrowUpRight size={16} />
          </span>
        </a>
      ))}
    </section>
  );
}

export function NoteCards({ notes, children }) {
  if (!notes?.length && !children) return null;
  return (
    <section className="grid lg:grid-cols-2 gap-6 mb-12">
      {notes?.map((note) => (
        <div key={note.title} className={`${CARD} flex flex-col justify-center`}>
          <div>
            <SectionHeading icon={note.icon}>{note.title}</SectionHeading>
            <p className="text-zinc-400 leading-relaxed">{note.body}</p>
          </div>
        </div>
      ))}
      {children}
    </section>
  );
}

export function AwardBanner({ award }) {
  if (!award) return null;
  const board = award.scoreboard;

  return (
    <section className="bg-gradient-to-br from-amber-500/10 to-zinc-900/40 border border-amber-500/20 rounded-xl p-8 mb-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Trophy size={160} className="text-amber-500" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {award.badge ? (
            <div className="inline-flex items-center gap-2 text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
              <Trophy size={18} />
              <span className="font-bold tracking-wide">{award.badge}</span>
            </div>
          ) : null}
          {award.period ? (
            <div className="text-zinc-400 text-sm px-4 py-2 border border-zinc-800 rounded-full bg-zinc-950/50">
              {award.period}
            </div>
          ) : null}
          {award.link ? (
            <a
              href={award.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-mono text-sm px-3 py-2 border border-sky-500/30 rounded-full bg-sky-500/10 transition-colors"
            >
              {award.link.label} <ArrowUpRight size={14} />
            </a>
          ) : null}
        </div>

        {award.heading ? (
          <h2 className="text-3xl font-bold mb-4 text-white">{award.heading}</h2>
        ) : null}
        {award.body ? (
          <p className="text-zinc-300 leading-relaxed max-w-2xl mb-4 text-lg">{award.body}</p>
        ) : null}

        {board?.stats?.length ? (
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
            <div className="mb-6 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 border-b border-zinc-800/50 pb-4">
              {board.team ? (
                <div className="text-sky-400 font-mono flex items-center gap-3 text-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                  Team: {board.team}
                </div>
              ) : null}
              {board.updated ? (
                <div className="text-zinc-500 font-mono text-sm">Last Updated: {board.updated}</div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {board.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-zinc-500 font-mono text-sm mb-1">{stat.label}</div>
                  <div className={`text-3xl font-bold ${TONES[stat.tone] ?? TONES.default}`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function Outline({ outline }) {
  if (!outline?.length) return null;
  return (
    <div className={`${CARD} p-8`}>
      <h2 className="text-2xl font-bold mb-4">📝 文章尚在撰寫中</h2>
      <p className="text-zinc-400 mb-6">這篇文章將涵蓋以下主題：</p>
      <ul className="space-y-3 text-zinc-400">
        {outline.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="text-zinc-500 mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
