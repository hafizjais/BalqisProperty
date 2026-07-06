// Scans public/photos/<folder>/ and writes lib/photo-manifest.json
// mapping each folder name (= sheet `id` column, e.g. "prop-002")
// to its image paths. Runs automatically before `npm run dev` / `npm run build`.
import { readdirSync, statSync, writeFileSync, existsSync } from "fs";
import path from "path";

const photosDir = path.join(process.cwd(), "public", "photos");
const outFile = path.join(process.cwd(), "src", "lib", "photo-manifest.json");

const manifest = {};

if (existsSync(photosDir)) {
  for (const folder of readdirSync(photosDir)) {
    const dir = path.join(photosDir, folder);
    if (!statSync(dir).isDirectory()) continue;

    const files = readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
      );

    // cover.* always goes first
    const coverIdx = files.findIndex((f) => /^cover\./i.test(f));
    if (coverIdx > 0) files.unshift(files.splice(coverIdx, 1)[0]);

    if (files.length > 0) {
      manifest[folder] = files.map((f) => `/photos/${folder}/${f}`);
    }
  }
}

writeFileSync(outFile, JSON.stringify(manifest, null, 2));

const total = Object.values(manifest).reduce((n, a) => n + a.length, 0);
console.log(
  `photo-manifest: ${Object.keys(manifest).length} folders, ${total} images → src/lib/photo-manifest.json`
);
