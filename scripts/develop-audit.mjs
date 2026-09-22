// 디벨롭 오딧 — timeline.json + scenes.json 을 훅·가독성·리듬 게이트로 채점하고, 고칠 비트와 삽입 제안을 낸다.
// 사용: node scripts/develop-audit.mjs [--json]   (build-timeline 이후, 렌더 전에)
import fs from "node:fs";
const J = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const tl = J("data/timeline.json"), scenes = J("data/scenes.json");
const sentences = fs.existsSync("data/sentences.json") ? J("data/sentences.json") : [];
const FPS = tl.fps, sec = (f) => +(f / FPS).toFixed(1), mmss = (f) => `${Math.floor(f / FPS / 60)}:${String(Math.floor((f / FPS) % 60)).padStart(2, "0")}`;
const R = { hookFirstGraphicSec: 10, hookChangeSec: 12, hookWindowSec: 60, maxHoldSec: 8, maxFaceGapSec: 6, maxCueSec: 3.5, minBody: 32, minHead: 56, cardMinRatio: 0.6, endScreenSec: 15 };
const findings = []; const add = (sev, area, at, msg, fix) => findings.push({ sev, area, at, msg, fix });
const dispWidth = (s) => { let w = 0; for (const ch of String(s)) w += /[ᄀ-ᇿ㄰-㆏가-힣]/.test(ch) ? 1 : 0.55; return w; };
const preroll = tl.prerollFrames ?? 0;
const allBeats = tl.scenes.flatMap((s) => s.beats.map((b) => ({ ...b, scene: s })));

// ---- 1) 훅: 첫 그래픽 · 시각 변화 간격 · 콜드 오픈 · 약속 카드 ----
const firstGraphic = allBeats.filter((b) => b.scene.id !== "ch0-coldopen" && (b.motion || b.broll)).sort((a, b) => a.from - b.from)[0];
const firstGraphicSec = firstGraphic ? sec(firstGraphic.from - preroll) : Infinity;
if (firstGraphicSec > R.hookFirstGraphicSec) add("HIGH", "hook", mmss(firstGraphic?.from ?? 0), `첫 그래픽이 ${firstGraphicSec}s에 나옴 (기준 ≤${R.hookFirstGraphicSec}s)`, "훅 첫 수치·키워드 문장에 statCount/keywordChip 비트 추가");
if (!scenes.hook?.coldOpen) add("MED", "hook", "0:00", "콜드 오픈 없음", "scenes.hook.coldOpen = {sec:5, cards:[{value,label}×3]} — 본문 결과 수치 선공개");
const hasPromise = allBeats.some((b) => b.motion?.type === "promiseCard");
if (!hasPromise) add("MED", "hook", "-", "약속(프로미스) 카드 없음", "'끝까지 보시면 ~' 문장에 promiseCard {text,count:3}");
// 시각 변화 이벤트: 비트 시작·broll 시작·모드 전환·컷(세그먼트 시작, 얼굴 풀일 때 펀치인)
const changes = new Set();
allBeats.forEach((b) => changes.add(b.from));
for (let i = 1; i < tl.scenes.length; i++) if (tl.scenes[i].layout !== tl.scenes[i - 1].layout) changes.add(tl.scenes[i].from);
tl.segments.forEach((s) => changes.add(s.outStartFrame + preroll));
const ch = [...changes].filter((f) => f >= preroll && f <= preroll + R.hookWindowSec * FPS).sort((a, b) => a - b);
let prev = preroll;
for (const f of [...ch, preroll + R.hookWindowSec * FPS]) { const gap = sec(f - prev); if (gap > R.hookChangeSec) add("HIGH", "hook", `${mmss(prev)}~${mmss(f)}`, `훅 구간 ${gap}s 동안 시각 변화 없음 (기준 ≤${R.hookChangeSec}s)`, "이 구간 문장에 keywordChip/statCount/펀치인 추가"); prev = f; }

// ---- 2) 정적 홀드: 8s 넘는 단일 비트 (reveal 단계가 없는 유형) ----
const STAGED = new Set(["numberCards", "generationTable", "stepFlow", "checklist", "flowchart", "coldOpen", "recapCard"]);
for (const b of allBeats) {
  const dur = sec(b.to - b.from);
  if (b.motion && !STAGED.has(b.motion.type) && dur > R.maxHoldSec) add("MED", "hold", `${mmss(b.from)} (${b.scene.id})`, `${b.motion.type} ${dur}s 정지 (기준 ≤${R.maxHoldSec}s)`, "비트를 2개로 나누거나(값 갱신·항목 추가) broll/keywordTypo로 교체");
  if (!b.motion && b.broll && dur > R.maxHoldSec * 1.5) add("LOW", "hold", mmss(b.from), `B-roll ${dur}s`, "12초 넘으면 두 번째 이미지로 교체");
}

// ---- 3) 얼굴 구간: 6s 이상 오버레이 없음 ----
for (const s of tl.scenes.filter((s) => s.layout === "face-main")) {
  let cursor = s.from;
  const marks = [...s.beats.map((b) => [b.from, b.to]), [s.to, s.to]].sort((a, b) => a[0] - b[0]);
  for (const [bf, bt] of marks) { const gap = sec(bf - cursor); if (gap > R.maxFaceGapSec) add("MED", "face", `${mmss(cursor)}~${mmss(bf)} (${s.id})`, `얼굴 구간 ${gap}s 오버레이 없음 (기준 ≤${R.maxFaceGapSec}s)`, "keywordChip {text: 문장 키워드} 비트 추가"); cursor = Math.max(cursor, bt); }
}

// ---- 4) 자막: 큐 길이 · 줄 폭 ----
for (const c of tl.captions) { const d = sec(c.end - c.start); if (d > R.maxCueSec + 0.4) add("LOW", "caption", mmss(c.start), `자막 ${d}s "${c.text.slice(0, 18)}…"`, "build-timeline captionStyle.maxCueSec=3.5 적용 여부 확인"); if (c.lines.some((l) => dispWidth(l) > 20)) add("MED", "caption", mmss(c.start), `자막 한 줄 폭 초과 "${c.text.slice(0, 18)}…"`, "oneLineMax 18로 재빌드"); }

// ---- 5) 그래픽 텍스트 넘침 위험 (카드 유형별 폭 상한) ----
const LIMIT = { eitherOr: ["a", 12, "b", 12], numberCards: ["cards", 8], keywordChip: ["text", 12], speechBubble: ["text", 16], keywordTypo: ["text", 18] };
for (const b of allBeats) {
  const m = b.motion; if (!m || !LIMIT[m.type]) continue;
  const spec = LIMIT[m.type];
  for (let i = 0; i < spec.length; i += 2) { const v = m.data[spec[i]]; const vals = Array.isArray(v) ? v : [v]; for (const s of vals) { if (typeof s !== "string") continue; const w = Math.max(...s.split("\n").map(dispWidth)); if (w > spec[i + 1]) add("HIGH", "overflow", `${mmss(b.from)} ${m.type}.${spec[i]}`, `"${s}" 폭 ${w.toFixed(1)} > ${spec[i + 1]} — 어절 안 줄바꿈 위험`, "문구를 줄이거나 \\n 로 어절 경계 줄바꿈 지정"); } }
}

// ---- 6) 구조 안내·엔딩 ----
const graphicScenes = tl.scenes.filter((s) => s.layout === "graphic-pip");
const noChapter = graphicScenes.filter((s) => !s.chapterCard);
if (noChapter.length && graphicScenes.length) add("LOW", "structure", noChapter.map((s) => s.id).join(","), "챕터 전환 카드 없는 설명 씬", "scene.chapterCard = {index,total,title}");
const last = tl.scenes.at(-1);
if (!last.endScreen) add("MED", "ending", mmss(last.from), "엔드스크린 구간 없음", `마지막 ${R.endScreenSec}s를 endScreen:true 씬으로 분리(우측·하단 비움)`);
if (!allBeats.some((b) => b.motion?.type === "recapCard" || (b.motion?.type === "numberCards" && b.motion.data.complete))) add("LOW", "ending", "-", "리캡 카드 없음", "CTA 앞에 recapCard {items[], conclusion}");

// ---- 7) 훅 삽입 제안: 첫 60초 문장에서 수치·대립·열거 신호 ----
const suggestions = [];
for (let i = 0; i < sentences.length; i++) {
  const s = sentences[i]; if (s.start > R.hookWindowSec) break;
  const t = s.text;
  const num = t.match(/((?:\d+|몇십|몇|한|두|세|네|다섯|여섯|일곱|여덟|아홉|열|스무|서른|백|천)[0-9만천백십여]*\s?(?:시간|분|초|개|가지|명|원|배|%|세|년|살))/);
  if (num) suggestions.push({ sentence: i, at: `${Math.floor(s.start / 60)}:${String(Math.floor(s.start % 60)).padStart(2, "0")}`, signal: "수치", text: t.slice(0, 40), beat: { anchor: { fromSentence: i, toSentence: i }, motion: { type: "keywordChip", data: { text: num[0], accent: "coral" } } } });
  else if (/(아니라|vs|대신|말고|보다)/.test(t)) suggestions.push({ sentence: i, at: `${Math.floor(s.start / 60)}:${String(Math.floor(s.start % 60)).padStart(2, "0")}`, signal: "대립", text: t.slice(0, 40), beat: { anchor: { fromSentence: i, toSentence: i }, motion: { type: "keywordChip", data: { text: "<핵심 어절>", accent: "blue" } } } });
  else if (/(세 가지|3가지|첫째|둘째|하나,|둘,|셋,)/.test(t)) suggestions.push({ sentence: i, at: `${Math.floor(s.start / 60)}:${String(Math.floor(s.start % 60)).padStart(2, "0")}`, signal: "열거", text: t.slice(0, 40), beat: { anchor: { fromSentence: i, toSentence: i }, motion: { type: "promiseCard", data: { text: "<약속 문장>", count: 3 } } } });
}

// ---- 출력 ----
const score = Math.max(0, 100 - findings.reduce((n, f) => n + (f.sev === "HIGH" ? 12 : f.sev === "MED" ? 6 : 2), 0));
const report = { score, firstGraphicSec, findings, suggestions, rules: R };
fs.mkdirSync("out", { recursive: true }); fs.writeFileSync("out/develop-audit.json", JSON.stringify(report, null, 1));
if (process.argv.includes("--json")) { console.log(JSON.stringify(report, null, 1)); process.exit(0); }
console.log(`develop score ${score}/100 | first graphic ${firstGraphicSec}s | findings ${findings.length} (HIGH ${findings.filter((f) => f.sev === "HIGH").length})`);
for (const f of findings) console.log(`  [${f.sev}] ${f.area.padEnd(9)} ${String(f.at).padEnd(22)} ${f.msg}\n           → ${f.fix}`);
if (suggestions.length) { console.log(`\n훅 삽입 제안 ${suggestions.length}건 (scenes.json beats에 붙여넣기):`); for (const s of suggestions) console.log(`  ${s.at} [${s.signal}] 문장 ${s.sentence} "${s.text}" → ${JSON.stringify(s.beat.motion)}`); }
console.log("\n전체 리포트: out/develop-audit.json");
