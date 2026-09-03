// 將 NaniFont（23,739 字，7.4MB）裁切成本站實際用到的字元。
// 原字型採 SIL Open Font License 1.1，明文允許改作與再散布，
// 條件是衍生檔案需同樣以 OFL 釋出 —— 見 src/fonts/OFL.txt。
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import subsetFont from "subset-font";

const ROOT = path.resolve(import.meta.dirname, "..");
// 文章內容在 content/，程式碼在 src/ —— 兩邊都要掃，
// 否則新文章的字會漏出 subset 之外。
const SCAN_DIRS = [path.join(ROOT, "src"), path.join(ROOT, "content")];
const OUT_DIR = path.join(ROOT, "src/fonts");
const CACHE_DIR = path.join(ROOT, ".cache/fonts");

const FONT_VERSION = "1.036";
const FONT_URL = `https://cdn.jsdelivr.net/gh/max32002/nanifont@${FONT_VERSION}/webfont/NaniFont-Regular.woff2`;
const LICENSE_URL =
  "https://raw.githubusercontent.com/max32002/nanifont/master/SIL_Open_Font_License_1.1.txt";

const OUT_FONT = path.join(OUT_DIR, "NaniFont-subset.woff2");
const MANIFEST = path.join(OUT_DIR, ".subset-manifest.json");

// 一律保留的字元：ASCII 可見字元 + 常見中文標點與全形符號。
// 讓日後新增少量文案時不會立刻缺字。
const ALWAYS = [
  ...Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)),
  ..."　、。〈〉《》「」『』【】〔〕・…—～‧·¥°±×÷≈≠≤≥←→↑↓■□●○◆◇★☆",
  ..."！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝",
  ..."０１２３４５６７８９",
].join("");

async function collectSourceFiles(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "fonts") continue;
      out.push(...(await collectSourceFiles(full)));
    } else if (/\.(js|jsx|ts|tsx|css|md)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  const files = (
    await Promise.all(
      SCAN_DIRS.map((dir) => collectSourceFiles(dir).catch(() => []))
    )
  ).flat();
  const texts = await Promise.all(files.map((f) => fs.readFile(f, "utf8")));

  // 用到的字元 = 所有原始碼字元 ∪ 保留集。原始碼是文案的超集合，
  // 多收的識別字都是 ASCII，成本可忽略。
  const chars = new Set([...ALWAYS, ...texts.join("")]);
  for (const c of ["\n", "\r", "\t"]) chars.delete(c);

  const charset = [...chars].sort().join("");
  const hash = createHash("sha256")
    .update(`${FONT_VERSION} ${charset}`)
    .digest("hex")
    .slice(0, 16);

  const previous = await fs.readFile(MANIFEST, "utf8").then(JSON.parse, () => null);
  if (previous?.hash === hash) {
    const { size } = await fs.stat(OUT_FONT).catch(() => ({ size: 0 }));
    if (size > 0) {
      console.log(`  字型  ✓ 已是最新 (${previous.glyphs} 字, ${(size / 1024).toFixed(1)} KB)`);
      return;
    }
  }

  // 只有字元集真的變動時才需要下載 7.4MB 原始檔
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const cached = path.join(CACHE_DIR, `NaniFont-Regular-${FONT_VERSION}.woff2`);
  let source = await fs.readFile(cached).catch(() => null);
  if (!source) {
    console.log(`  字型  ↓ 下載原始字型 ${FONT_VERSION}…`);
    const res = await fetch(FONT_URL);
    if (!res.ok) throw new Error(`下載字型失敗: ${res.status} ${FONT_URL}`);
    source = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(cached, source);
  }

  const subset = await subsetFont(source, charset, { targetFormat: "woff2" });

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FONT, subset);
  await fs.writeFile(
    MANIFEST,
    `${JSON.stringify(
      { hash, version: FONT_VERSION, glyphs: chars.size, bytes: subset.length },
      null,
      2
    )}\n`
  );

  // OFL 要求衍生檔案隨附授權文件
  const licensePath = path.join(OUT_DIR, "OFL.txt");
  if (!(await fs.stat(licensePath).catch(() => null))) {
    const res = await fetch(LICENSE_URL);
    if (res.ok) await fs.writeFile(licensePath, await res.text());
  }

  const ratio = (source.length / subset.length).toFixed(0);
  console.log(
    `  字型  ✓ ${chars.size} 字  ${(source.length / 1024 / 1024).toFixed(2)} MB → ` +
      `${(subset.length / 1024).toFixed(1)} KB  (縮小 ${ratio}×)`
  );
}

await main();
