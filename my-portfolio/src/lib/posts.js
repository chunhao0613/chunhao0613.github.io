// 文章的唯一資料來源：content/blog/*.md。
// 首頁列表、文章頁、metadata 全部從這裡讀，不再有手動維護的陣列。
// 只在伺服器端（建置期）執行 —— static export 會把結果烘成靜態 HTML。
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

function readPost(filename) {
  const slug = filename.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
  const { data, content } = matter(raw);

  if (!data.title) throw new Error(`content/blog/${filename} 缺少 title`);
  if (!data.date) throw new Error(`content/blog/${filename} 缺少 date`);

  // frontmatter 的 date 會被 YAML 解析成 Date 物件；統一轉成字串避免
  // server/client 之間的序列化落差。
  const date = data.date instanceof Date
    ? data.date.toISOString().slice(0, 10)
    : String(data.date);

  return {
    slug,
    href: `/blog/${slug}`,
    title: data.title,
    date,
    // 卡片上顯示的日期格式（維持原本的 "May 12, 2026" 樣式）
    displayDate: new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      timeZone: "UTC",
    }),
    excerpt: data.excerpt ?? "",
    lede: data.lede ?? data.excerpt ?? "",
    // cover 只寫檔名主幹，副檔名由資產管線決定
    image: data.cover ? `/covers/${data.cover}.webp` : null,
    ogImage: data.cover ? `/covers/${data.cover}.jpg` : null,
    draft: data.draft === true,
    width: data.width === "wide" ? "wide" : "normal",
    tags: data.tags ?? [],
    outline: data.outline ?? null,
    highlights: data.highlights ?? null,
    links: data.links ?? null,
    award: data.award ?? null,
    notes: data.notes ?? null,
    certificates: data.certificates ?? null,
    body: content.trim(),
  };
}

export function getAllPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    // 排除說明文件與底線開頭的草稿檔，它們不是文章
    .filter((f) => f.endsWith(".md") && f !== "README.md" && !f.startsWith("_"))
    .map(readPost)
    .sort((a, b) => b.date.localeCompare(a.date)); // 新的在前
}

export function getPost(slug) {
  const post = getAllPosts().find((p) => p.slug === slug);
  if (!post) throw new Error(`找不到文章: ${slug}`);
  return post;
}
