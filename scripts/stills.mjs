// 씬·비트별 대표 프레임 스틸 (검수 게이트). 사용: node scripts/stills.mjs [sceneId ...] [--scale=0.5]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
const args = process.argv.slice(2);
const scale = +(args.find((a) => a.startsWith("--scale="))?.split("=")[1] ?? 0.5);
const only = args.filter((a) => !a.startsWith("--"));
const tl = JSON.parse(fs.readFileSync("data/timeline.json", "utf8"));
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => {} });
const composition = await selectComposition({ serveUrl, id: "Episode" });
console.log("composition", composition.durationInFrames, "frames", composition.width + "x" + composition.height);
const targets = [];
const explicit = args.find((a) => a.startsWith("--frame="))?.split("=")[1];
if (explicit) explicit.split(",").forEach((f) => targets.push({ name: `frame-${f}`, frame: +f }));
for (const s of tl.scenes) {
  if (explicit) break;
  if (only.length && !only.includes(s.id)) continue;
  targets.push({ name: `${s.id}__scene`, frame: Math.min(s.from + 45, s.to - 1) });
  s.beats.forEach((b, i) => targets.push({ name: `${s.id}__b${i + 1}-${b.motion?.type ?? "broll"}`, frame: Math.min(b.from + 40, b.to - 1) }));
}
fs.mkdirSync("out/stills", { recursive: true });
for (const t of targets) {
  const output = path.resolve(`out/stills/${t.name}.jpg`);
  await renderStill({ composition, serveUrl, output, frame: t.frame, imageFormat: "jpeg", jpegQuality: 80, scale });
  console.log(`${t.name} @ ${(t.frame / tl.fps).toFixed(1)}s`);
}
