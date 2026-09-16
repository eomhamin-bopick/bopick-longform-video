// Step 1b — words.raw.json(ElevenLabs Scribe) → data/sentences.json (문장 단위 원본 타임코드; 씬 앵커의 기준)
import fs from "node:fs";
const raw = JSON.parse(fs.readFileSync("data/words.raw.json", "utf8"));
const words = raw.words.filter((w) => w.type === "word");
const sents = []; let cur = [];
for (const w of words) { cur.push(w); if (/[.?!]["”]?$/.test(w.text)) { sents.push(cur); cur = []; } }
if (cur.length) sents.push(cur);
const out = sents.map((s) => ({ start: +s[0].start.toFixed(2), end: +s[s.length - 1].end.toFixed(2), text: s.map((w) => w.text).join(" ") }));
fs.writeFileSync("data/sentences.json", JSON.stringify(out, null, 1));
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
console.log("sentences:", out.length);
out.forEach((s, i) => console.log(`${String(i).padStart(2, "0")} ${mmss(s.start)}-${mmss(s.end)} ${s.text.slice(0, 60)}`));
