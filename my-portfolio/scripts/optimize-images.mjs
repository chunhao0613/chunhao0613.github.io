// 把 assets/images/ 底下的原圖轉成 WebP 輸出到 public/。
// 丟任何新的 png/jpg/jpeg/tif 進 assets/images/ 都會自動被處理，
// 不需要改這支 script —— 只有想調整尺寸上限時才需要動 RULES。
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC_DIR = path.join(ROOT, "assets/images");
const OUT_DIR = path.join(ROOT, "public");
const MANIFEST = path.join(ROOT, "assets/.image-manifest.json");

const SOURCE_EXT = /\.(png|jpe?g|tiff?|webp)$/i;

// 依輸出路徑前綴決定寬度上限（取最先命中的規則）。
// 上限 = 版面顯示寬度 x2，供 retina 螢幕使用。
// ogJpeg: 另外產一份 JPEG。社群平台（尤其 LinkedIn）對 WebP 的
// 支援不一致，og:image 用 JPEG 比較保險。
const RULES = [
  { prefix: "covers/", maxWidth: 800, quality: 80, ogJpeg: true }, // 卡片約 380px 寬
  { prefix: "", maxWidth: 1200, quality: 82 }, // 其餘（獎章輪播等）
];

function ruleFor(relative) {
  return RULES.find((r) => relative.startsWith(r.prefix)) ?? RULES.at(-1);
}

async function walk(dir, base = dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, base)));
    else if (SOURCE_EXT.test(entry.name)) out.push(path.relative(base, full));
  }
  return out;
}

async function main() {
  const sources = await walk(SRC_DIR).catch(() => []);
  if (sources.length === 0) {
    console.log("  圖片  – assets/images/ 沒有可處理的圖檔");
    return;
  }

  const manifest = await fs.readFile(MANIFEST, "utf8").then(JSON.parse, () => ({}));
  const next = {};
  let converted = 0;
  let srcBytes = 0;
  let outBytes = 0;

  for (const relative of sources.sort()) {
    const srcPath = path.join(SRC_DIR, relative);
    const outRelative = relative.replace(SOURCE_EXT, ".webp");
    const outPath = path.join(OUT_DIR, outRelative);
    const rule = ruleFor(outRelative);

    const buffer = await fs.readFile(srcPath);
    srcBytes += buffer.length;
    const key = createHash("sha256")
      .update(buffer)
      .update(`${rule.maxWidth}:${rule.quality}`)
      .digest("hex")
      .slice(0, 16);

    const jpegRelative = rule.ogJpeg ? outRelative.replace(/\.webp$/, ".jpg") : null;
    const stillThere = await fs.stat(outPath).catch(() => null);
    const jpegThere = jpegRelative
      ? await fs.stat(path.join(OUT_DIR, jpegRelative)).catch(() => null)
      : true;

    if (manifest[outRelative] === key && stillThere && jpegThere) {
      next[outRelative] = key;
      outBytes += stillThere.size;
      // 一併保留 og JPEG 的登記，否則下方的孤兒檔清理會把它刪掉
      if (jpegRelative) {
        next[jpegRelative] = key;
        outBytes += jpegThere.size;
      }
      continue;
    }

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    const result = await sharp(buffer)
      .resize({ width: rule.maxWidth, withoutEnlargement: true })
      .webp({ quality: rule.quality, effort: 6 })
      .toFile(outPath);

    next[outRelative] = key;
    outBytes += result.size;
    converted++;
    let extra = "";

    if (rule.ogJpeg) {
      const jpegRelative = outRelative.replace(/\.webp$/, ".jpg");
      const jpeg = await sharp(buffer)
        .resize({ width: rule.maxWidth, withoutEnlargement: true })
        .jpeg({ quality: rule.quality, mozjpeg: true })
        .toFile(path.join(OUT_DIR, jpegRelative));
      next[jpegRelative] = key;
      outBytes += jpeg.size;
      extra = ` (+og ${(jpeg.size / 1024).toFixed(0)} KB)`;
    }

    console.log(
      `  圖片  ✓ ${outRelative.padEnd(30)} ` +
        `${(buffer.length / 1024).toFixed(0)} KB → ${(result.size / 1024).toFixed(0)} KB${extra}`
    );
  }

  // 清掉來源已刪除、但仍殘留在 public/ 的產物
  for (const stale of Object.keys(manifest)) {
    if (next[stale]) continue;
    await fs.rm(path.join(OUT_DIR, stale), { force: true });
    console.log(`  圖片  ✗ 移除孤兒檔 ${stale}`);
  }

  await fs.writeFile(MANIFEST, `${JSON.stringify(next, null, 2)}\n`);

  const summary =
    `${sources.length} 張  ${(srcBytes / 1024 / 1024).toFixed(2)} MB → ` +
    `${(outBytes / 1024).toFixed(0)} KB`;
  console.log(
    converted === 0 ? `  圖片  ✓ 已是最新 (${summary})` : `  圖片  ✓ 轉換 ${converted} 張，共 ${summary}`
  );
}

await main();
