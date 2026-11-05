// 首頁與專案的資料來源：content/home.md、content/projects/*.md。
// 和文章（posts.js）一樣只在建置期執行，結果烘成靜態 HTML。
//
// 錯誤處理的原則與文章相同：
// - 缺少必要欄位（例如專案沒有 title）→ 建置失敗，並在 log 指出是哪個檔案
// - 區塊類型打錯、欄位缺漏 → 只跳過那個區塊並在 log 警告，不讓整個網站壞掉
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT = path.join(process.cwd(), "content");

export const HOME_BLOCKS = ["hero", "featured", "steps", "projects", "posts", "contact"];

const coverPath = (cover) => (cover ? `/covers/${cover}.webp` : null);

function readProject(filename) {
  const slug = filename.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(CONTENT, "projects", filename), "utf8");
  const { data, content } = matter(raw);
  if (!data.title) throw new Error(`content/projects/${filename} 缺少 title`);
  return {
    slug,
    title: data.title,
    period: data.period ?? "",
    order: Number.isFinite(data.order) ? data.order : 999,
    positioning: data.positioning ?? "",
    summary: data.summary ?? "",
    // 內文 = 「我的角色」，空行分段
    role: content.trim(),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    links: Array.isArray(data.links) ? data.links.filter((l) => l?.href && l?.label) : [],
    stats: Array.isArray(data.stats) ? data.stats : [],
    image: coverPath(data.cover),
    coverAlt: data.coverAlt ?? data.title,
  };
}

export function getProjects() {
  const dir = path.join(CONTENT, "projects");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map(readProject)
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

// 讀一個「區塊清單」檔（首頁 home.md、展示頁 styleguide.md 共用）
export function readBlocksFile(relPath) {
  const raw = fs.readFileSync(path.join(CONTENT, relPath), "utf8");
  const { data, content } = matter(raw);
  return { data, content, file: `content/${relPath}` };
}

export function checkBlock(block, where) {
  if (!block || !HOME_BLOCKS.includes(block.block)) {
    console.warn(`⚠ ${where}：未知的區塊類型「${block?.block}」，已略過。可用的有：${HOME_BLOCKS.join("、")}`);
    return false;
  }
  return true;
}

export function getHome() {
  const { data, file } = readBlocksFile("home.md");
  if (!Array.isArray(data.sections) || !data.sections.length) {
    throw new Error(`${file} 缺少 sections`);
  }
  const sections = data.sections.map((s, i) => {
    if (!s.id) throw new Error(`${file} 第 ${i + 1} 段缺少 id`);
    const blocks = (Array.isArray(s.blocks) ? s.blocks : []).filter((b, j) =>
      checkBlock(b, `${file} 第 ${i + 1} 段（${s.id}）第 ${j + 1} 個區塊`)
    );
    return { id: String(s.id), menu: s.menu ?? null, icon: s.icon ?? null, title: s.title ?? null, blocks };
  });
  return { sections };
}
