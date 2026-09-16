// 렌더 후 게이트 — 길이(±0.5s)·트랙·스팟 프레임 (설계서 §3 Step 7)
import { spawnSync } from "node:child_process";
import fs from "node:fs";
const FF = process.env.FFMPEG ?? "ffmpeg";   // PATH에 없으면 FFMPEG=/path/to/ffmpeg
const tl = JSON.parse(fs.readFileSync("data/timeline.json", "utf8"));
const file = process.argv[2] ?? "out/final.mp4";
const info = spawnSync(FF, ["-hide_banner", "-i", file], { encoding: "utf8" }).stderr;
const dur = info.match(/Duration: (\d+):(\d+):([\d.]+)/);
const sec = dur ? +dur[1] * 3600 + +dur[2] * 60 + +dur[3] : NaN;
const hasV = /Video: h264/.test(info), hasA = /Audio: aac/.test(info);
const diff = Math.abs(sec - tl.outSec);
console.log(`file ${file} | duration ${sec.toFixed(2)}s vs timeline ${tl.outSec}s → diff ${diff.toFixed(2)}s ${diff <= 0.5 ? "OK" : "FAIL"}`);
console.log(`tracks video=${hasV} audio=${hasA} ${hasV && hasA ? "OK" : "FAIL"}`);
fs.mkdirSync("out/check", { recursive: true });
for (const t of [0.5, 60, 150, 250, 330, sec - 1]) {
  const out = `out/check/f-${Math.round(t)}s.jpg`;
  spawnSync(FF, ["-v", "error", "-y", "-ss", String(t), "-i", file, "-frames:v", "1", "-vf", "scale=640:-2", out]);
  console.log("spot", out, fs.existsSync(out) ? "ok" : "MISSING");
}
