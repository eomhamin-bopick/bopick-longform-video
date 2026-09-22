// Step 3·4 — words + cuts + scenes → data/timeline.json (컷 후 출력 타임라인: 세그먼트·씬·비트·자막 큐, 전부 프레임 단위)
import fs from "node:fs";
const J = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const { words } = J("data/words.json");
const sentences = J("data/sentences.json");
const { cuts, durationSec } = J("data/cuts.json");
const scenes = J("data/scenes.json");
const FPS = scenes.fps ?? 30;
const f = (sec) => Math.round(sec * FPS);

// ---------- 1) 컷 → 유지 세그먼트 (src → out) ----------
const removed = cuts.filter((c) => c.approved).sort((a, b) => a.srcStart - b.srcStart);
const segments = [];
let cursor = 0, outFrame = 0;
const pushSeg = (s, e) => {
  if (e - s < 0.05) return;
  const frames = f(e - s);
  segments.push({ srcStart: +s.toFixed(3), srcEnd: +e.toFixed(3), srcStartFrame: f(s), outStartFrame: outFrame, frames });
  outFrame += frames;
};
for (const c of removed) { pushSeg(cursor, c.srcStart); cursor = Math.max(cursor, c.srcEnd); }
pushSeg(cursor, durationSec);
const PREROLL = Math.round((scenes.hook?.coldOpen?.sec ?? 0) * FPS);   // 콜드 오픈 프리롤: 나레이션 전 무음 그래픽
const OUT_FRAMES = outFrame + PREROLL;

const toOut = (src, snap) => {
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (src >= s.srcStart && src <= s.srcEnd) return PREROLL + s.outStartFrame + (src - s.srcStart) * FPS;
    if (src < s.srcStart) return PREROLL + (snap === "end" ? (i > 0 ? segments[i - 1].outStartFrame + segments[i - 1].frames : 0) : s.outStartFrame);
  }
  return OUT_FRAMES;
};
const inRemoved = (src) => removed.some((c) => src >= c.srcStart && src < c.srcEnd);

// ---------- 2) 문장 ↔ 단어 ----------
const sentOf = (w) => { let best = -1; for (let i = 0; i < sentences.length; i++) if (w.start >= sentences[i].start - 0.05 && w.start <= sentences[i].end + 0.05) { best = i; break; } return best; };
const sentWords = sentences.map(() => []);
for (const w of words) { const si = sentOf(w); if (si >= 0) sentWords[si].push(w); }
const sentOutStart = (i) => toOut(sentences[i].start, "start");
const sentOutEnd = (i) => toOut(sentences[i].end, "end");

// ---------- 3) 씬·비트 해상 ----------
const LEAD = 0.15, TAIL = 0.25;
const norm = (t) => t.replace(/[.,!?…"“”'’()]/g, "");
const resolvedScenes = scenes.scenes.map((sc) => ({ ...sc, from: Math.max(PREROLL, Math.round(sentOutStart(sc.anchor.fromSentence) - LEAD * FPS)), to: Math.round(sentOutEnd(sc.anchor.toSentence) + TAIL * FPS) }));
if (PREROLL > 0) {
  const co = scenes.hook.coldOpen;
  resolvedScenes.unshift({ id: "ch0-coldopen", title: co.title ?? "", layout: "graphic-only", anchor: { fromSentence: -1, toSentence: -1 }, from: 0, to: PREROLL, keywords: [],
    beats: [{ anchor: { fromSentence: -1, toSentence: -1 }, from: 0, to: PREROLL, motion: { type: "coldOpen", data: { cards: co.cards, intervalSec: co.intervalSec ?? 1.2 } } }] });
}
for (let i = 0; i < resolvedScenes.length; i++) {
  const sc = resolvedScenes[i];
  if (i > 0) sc.from = Math.max(sc.from, resolvedScenes[i - 1].to);
  if (i > 0 && resolvedScenes[i - 1].id === "ch0-coldopen") sc.from = PREROLL;   // 프리롤 직후 씬은 리드 없이 정확히 이어붙임
  if (sc.id === "ch0-coldopen") continue;
  sc.to = i < resolvedScenes.length - 1 ? Math.max(sc.from + 1, Math.round(sentOutStart(resolvedScenes[i + 1].anchor.fromSentence) - LEAD * FPS)) : OUT_FRAMES;
}
for (const sc of resolvedScenes) {
  if (sc.id === "ch0-coldopen") continue;
  const beats = (sc.beats || []).map((b) => ({ ...b, from: Math.round(sentOutStart(b.anchor.fromSentence) - 0.1 * FPS), to: Math.round(sentOutEnd(b.anchor.toSentence) + TAIL * FPS) }));
  for (let i = 0; i < beats.length; i++) {
    beats[i].from = Math.max(beats[i].from, sc.from, i > 0 ? beats[i - 1].to : 0);
    beats[i].to = i < beats.length - 1 ? Math.max(beats[i].from + 1, Math.round(sentOutStart(beats[i + 1].anchor.fromSentence) - 0.1 * FPS)) : sc.to;
    const DEFAULT_MAX_SEC = { keywordChip: 6, speechBubble: 6, statCount: 8 };
    const maxSec = beats[i].motion?.data?.maxSec ?? DEFAULT_MAX_SEC[beats[i].motion?.type];
    if (maxSec) beats[i].to = Math.min(beats[i].to, beats[i].from + Math.round(maxSec * FPS));
    const m = beats[i].motion;
    if (m?.type === "numberCards" && m.data.revealByWord) {
      // 카드 라벨의 첫 2글자가 나오는 단어 시각(비트 안) → 1차 등장, 2차 등장은 펄스
      const inRange = words.filter((w) => w.start >= sentences[beats[i].anchor.fromSentence].start - 0.05 && w.end <= sentences[beats[i].anchor.toSentence].end + 0.05 && !inRemoved(w.start));
      m.data.revealAt = m.data.cards.map((c) => { const hit = inRange.find((w) => norm(w.text).startsWith(c.slice(0, 2))); return hit ? Math.round(toOut(hit.start, "start")) : beats[i].from; });
      m.data.pulseAt = m.data.cards.map((c) => { const hits = inRange.filter((w) => norm(w.text).startsWith(c.slice(0, 2))); return hits[1] ? Math.round(toOut(hits[1].start, "start")) : null; });
    }
    if (m?.type === "phoneScene") m.data.overlayBubbles = m.data.overlayBubbles.map((bb, k) => ({ ...bb, at: Math.round(sentOutStart(bb.atSentence) + k % 2 * 0.9 * FPS) }));
    if (m?.type === "keywordTypo" || m?.type === "statCount" || m?.type === "eitherOr" || m?.type === "checklist" || m?.type === "stepFlow") {
      m.data.wordTimes = words.filter((w) => w.start >= sentences[beats[i].anchor.fromSentence].start - 0.05 && w.end <= sentences[beats[i].anchor.toSentence].end + 0.05 && !inRemoved(w.start)).map((w) => ({ t: norm(w.text), at: Math.round(toOut(w.start, "start")) }));
    }
  }
  sc.beats = beats;
  if (sc.character?.anchor) { const n = +sc.character.anchor.split(":")[1]; sc.character.at = Math.round(sentOutStart(n)); }
}

// ---------- 4) 자막 큐 (regroupCues 포팅: 문장 병합 → cueMax 분할 → 꼬리 흡수 → 2줄 균형) ----------
const cs = scenes.captionStyle;
const dispWidth = (s) => { let w = 0; for (const ch of s) w += /[ᄀ-ᇿ㄰-㆏가-힣　-〿＀-￯]/.test(ch) ? 1 : 0.55; return w; };
const balanceTwoLines = (text, oneLineMax) => {
  const ws = text.split(/\s+/).filter(Boolean);
  if (ws.length < 2 || dispWidth(text) <= oneLineMax) return [text];
  const total = dispWidth(text); let acc = 0, best = 1, bestScore = Infinity;
  for (let i = 0; i < ws.length - 1; i++) {
    acc += dispWidth(ws[i]) + 0.5;
    const score = Math.abs(acc - (total - acc)) - (/[,，]$/.test(ws[i]) ? 4 : 0) + (ws[i].replace(/[.,!?…]/g, "").length <= 1 ? 3 : 0);
    if (score < bestScore) { bestScore = score; best = i + 1; }
  }
  return [ws.slice(0, best).join(" "), ws.slice(best).join(" ")];
};
const cues = [];
for (let si = 0; si < sentences.length; si++) {
  const ws = sentWords[si].filter((w) => !inRemoved(w.start));
  if (!ws.length) continue;
  let bucket = [];
  const flush = () => { if (!bucket.length) return; cues.push({ words: bucket, text: bucket.map((w) => w.text).join(" ").replace(/\s+/g, " ") }); bucket = []; };
  for (const w of ws) {
    const projected = [...bucket, w].map((x) => x.text).join(" ");
    if (bucket.length && dispWidth(projected) > cs.cueMax) flush();
    bucket.push(w);
    if (/[,，]$/.test(w.text) && dispWidth(bucket.map((x) => x.text).join(" ")) >= cs.cueMax * 0.66) flush();
  }
  flush();
  // 꼬리 흡수 (같은 문장 안에서만)
  const mine = cues.filter((c) => c.words[0].start >= ws[0].start);
  if (mine.length >= 2) { const last = mine.at(-1), prev = mine.at(-2); if (dispWidth(last.text) < cs.minTail && dispWidth(prev.text + " " + last.text) <= cs.cueMax * 1.15) { prev.words.push(...last.words); prev.text = prev.words.map((w) => w.text).join(" "); cues.splice(cues.indexOf(last), 1); } }
}
// 큐 길이 상한: maxCueSec 초과 시 시간 중앙에 가까운 단어 경계에서 분할(가독성: 한 화면 3.5s)
const MAX_CUE = (cs.maxCueSec ?? 3.5);
for (let i = 0; i < cues.length; i++) {
  const c = cues[i];
  const span = c.words.at(-1).end - c.words[0].start;
  if (span <= MAX_CUE || c.words.length < 4) continue;
  const mid = c.words[0].start + span / 2;
  let k = 1, best = Infinity;
  for (let j = 1; j < c.words.length; j++) { const d = Math.abs(c.words[j].start - mid); if (d < best) { best = d; k = j; } }
  const a = c.words.slice(0, k), b = c.words.slice(k);
  if (a.at(-1).end - a[0].start < 1.0 || b.at(-1).end - b[0].start < 1.0) continue;
  cues.splice(i, 1, { words: a, text: a.map((w) => w.text).join(" ") }, { words: b, text: b.map((w) => w.text).join(" ") });
}
const sceneAt = (frame) => resolvedScenes.find((s) => frame >= s.from && frame < s.to);
const captions = cues.map((c) => {
  const start = Math.round(toOut(c.words[0].start, "start")), rawEnd = Math.round(toOut(c.words.at(-1).end, "end"));
  const sc = sceneAt(start);
  const keyword = (sc?.keywords || []).find((k) => c.text.includes(k)) || null;
  return { text: c.text, lines: balanceTwoLines(c.text, cs.oneLineMax), start, end: Math.max(rawEnd, start + Math.round(0.8 * FPS)), keyword };
});
for (let i = 0; i < captions.length - 1; i++) captions[i].end = Math.min(captions[i].end + Math.round(0.35 * FPS), captions[i + 1].start - 1);
captions.at(-1).end = Math.min(captions.at(-1).end + Math.round(0.35 * FPS), OUT_FRAMES);

// ---------- 5) 출력 + 게이트 ----------
const timeline = { fps: FPS, width: scenes.width, height: scenes.height, outFrames: OUT_FRAMES, prerollFrames: PREROLL, audio: scenes.audio ?? {}, outSec: +(OUT_FRAMES / FPS).toFixed(2), segments, scenes: resolvedScenes, captions, theme: scenes.theme, creditStyle: scenes.creditStyle, captionStyle: cs, layoutDefaults: scenes.layoutDefaults, generatedAt: new Date().toISOString() };
fs.writeFileSync("data/timeline.json", JSON.stringify(timeline, null, 1));
const maxLine = Math.max(...captions.flatMap((c) => c.lines.map(dispWidth)));
const orphans = captions.filter((c) => dispWidth(c.text) <= cs.minTail).length;
const short = captions.filter((c) => c.end - c.start < 0.8 * FPS).length;
const covered = resolvedScenes.every((s, i) => i === 0 || s.from === resolvedScenes[i - 1].to);
console.log(`preroll ${(PREROLL / FPS).toFixed(1)}s | out ${timeline.outSec}s (${Math.floor(timeline.outSec / 60)}:${String(Math.round(timeline.outSec % 60)).padStart(2, "0")}) | segments ${segments.length} | scenes ${resolvedScenes.length} tiled=${covered} | beats ${resolvedScenes.reduce((n, s) => n + s.beats.length, 0)}`);
console.log(`captions ${captions.length} | max line width ${maxLine.toFixed(1)} (limit 20) | orphans ${orphans} | <0.8s ${short} | keyworded ${captions.filter((c) => c.keyword).length}`);
for (const s of resolvedScenes) console.log(`  ${s.id.padEnd(18)} ${(s.from / FPS).toFixed(1).padStart(6)}s → ${(s.to / FPS).toFixed(1).padStart(6)}s  ${s.layout}  beats=${s.beats.length}`);
