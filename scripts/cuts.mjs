// Step 2 — words.raw.json → data/words.json + data/cuts.json (침묵·리테이크 컷 후보, approved 플래그)
import fs from "node:fs";
const raw = JSON.parse(fs.readFileSync("data/words.raw.json", "utf8"));
const scenes = JSON.parse(fs.readFileSync("data/scenes.json", "utf8"));
const cfg = scenes.cuts;
const DURATION = scenes.source.durationSec;
const words = raw.words.filter((w) => w.type === "word").map((w, i) => ({ i, text: w.text, start: +w.start.toFixed(3), end: +w.end.toFixed(3) }));
fs.writeFileSync("data/words.json", JSON.stringify({ language: raw.language_code, count: words.length, words }, null, 1));

const sentences = JSON.parse(fs.readFileSync("data/sentences.json", "utf8"));
const wl = cfg.whitelistSentences.map(([a, b]) => [sentences[a].start - 0.1, sentences[b].end + 0.1]);
const inWL = (t) => wl.some(([a, b]) => t >= a && t <= b);
const SENT_END = /[.?!…]["”')\]]?$/;
const norm = (w) => w.text.replace(/[.,!?…"“”'’()]/g, "");
const key = (w) => { const n = norm(w); return n.length >= 2 ? n.slice(0, 2) : n; };
const cuts = [];
if (words[0].start > 0.5) cuts.push({ id: "lead", kind: "lead", srcStart: 0, srcEnd: +(words[0].start - 0.35).toFixed(3), approved: true, note: "시작 전 침묵" });
for (let i = 0; i < words.length - 1; i++) {
  const a = words[i], b = words[i + 1], gap = b.start - a.end;
  if (gap < cfg.silenceThresholdSec) continue;
  const keep = SENT_END.test(a.text) ? cfg.sentenceEndKeepSec : cfg.silenceKeepSec;
  const s = a.end + keep, e = b.start - 0.05;
  if (e - s > 0.15) cuts.push({ id: `sil-${i}`, kind: "silence", srcStart: +s.toFixed(3), srcEnd: +e.toFixed(3), approved: true, note: `${gap.toFixed(2)}s 침묵 → "${b.text}" 앞` });
}
for (let i = 0; i < words.length - 1; i++) {
  if (inWL(words[i].start)) continue;
  const k1 = key(words[i]), k2 = key(words[i + 1]);
  if (!k1 || !k2) continue;
  for (let j = i + 2; j <= Math.min(i + cfg.retakeWindowWords, words.length - 2); j++) {
    // 진짜 리테이크 조건: 앞 테이크가 문장 종결 없이 쉼표(호흡)로 끊긴 조각일 것
    const firstTake = words.slice(i, j);
    const isFragment = /[,，]$/.test(words[j - 1].text) && !firstTake.some((w) => SENT_END.test(w.text));
    if (isFragment && key(words[j]) === k1 && key(words[j + 1]) === k2) {
      cuts.push({ id: `rt-${i}`, kind: "retake", srcStart: +(words[i].start - 0.05).toFixed(3), srcEnd: +(words[j].start - 0.05).toFixed(3), approved: true, note: `"${words.slice(i, j).map((w) => w.text).join(" ")}" 반복 → 앞 테이크 제거` });
      i = j; break;
    }
  }
}
const last = words.at(-1);
if (last.end + 1.5 < DURATION) cuts.push({ id: "tail", kind: "tail", srcStart: +(last.end + 1.5).toFixed(3), srcEnd: DURATION, approved: true, note: "끝 침묵" });
cuts.sort((a, b) => a.srcStart - b.srcStart);
// 겹침 병합 — 리테이크 구간 안의 침묵 컷은 리테이크에 흡수
const merged = [];
for (const c of cuts) {
  const prev = merged.at(-1);
  if (prev && c.srcStart < prev.srcEnd) { prev.srcEnd = Math.max(prev.srcEnd, c.srcEnd); prev.note += ` (+${c.id} 흡수)`; continue; }
  merged.push({ ...c });
}
cuts.length = 0; cuts.push(...merged);
fs.writeFileSync("data/cuts.json", JSON.stringify({ generatedAt: new Date().toISOString(), durationSec: DURATION, cfg, cuts }, null, 1));
const removed = cuts.filter((c) => c.approved).reduce((n, c) => n + (c.srcEnd - c.srcStart), 0);
const by = (k) => cuts.filter((c) => c.kind === k);
console.log(`cuts: ${cuts.length} | silence ${by("silence").length} | retake ${by("retake").length} | lead/tail ${by("lead").length + by("tail").length}`);
console.log(`removed ${removed.toFixed(1)}s → output ≈ ${(DURATION - removed).toFixed(1)}s (${Math.floor((DURATION - removed) / 60)}:${String(Math.round((DURATION - removed) % 60)).padStart(2, "0")})`);
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
for (const c of by("retake")) console.log(`  retake ${mmss(c.srcStart)} (${(c.srcEnd - c.srcStart).toFixed(2)}s) ${c.note}`);
