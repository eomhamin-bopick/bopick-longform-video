// 업로드용 SRT — 반드시 컷 후(최종 파일) 타임코드 기준 (참고 영상 함정 3)
import fs from "node:fs";
const tl = JSON.parse(fs.readFileSync("data/timeline.json", "utf8"));
const ts = (frame) => { const ms = Math.round((frame / tl.fps) * 1000); const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000), x = ms % 1000; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(x).padStart(3, "0")}`; };
const srt = tl.captions.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.lines.join("\n")}\n`).join("\n");
fs.writeFileSync("out/final.ko.srt", srt);
console.log("srt cues:", tl.captions.length, "| last end:", ts(tl.captions.at(-1).end));
