import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, R, SH, STAGE } from "../theme/store";
import { Card, Check, MP } from "./shared";

/** 콜드 오픈 — 본문의 결과 수치 카드 3장을 5초 안에 순서대로(1.2s 간격), 무음. 프리롤 씬(ch0)에서만 쓴다 */
export const ColdOpen: React.FC<MP> = ({ data }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const cards: { value: string; label: string; sub?: string }[] = data.cards ?? [];
  const gap = Math.round((data.intervalSec ?? 1.2) * fps);
  return (
    <div style={{ display: "flex", gap: 40, alignItems: "stretch" }}>
      {cards.map((c, i) => {
        const p = spring({ frame: frame - 6 - i * gap, fps, config: { damping: 13, stiffness: 120 } });
        return (
          <Card key={i} style={{ width: 500, minHeight: 320, padding: "40px 44px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})`, opacity: p }}>
            <div style={{ fontSize: 96, fontWeight: 900, color: C.coral, letterSpacing: -4, lineHeight: 1, fontVariantNumeric: "tabular-nums", wordBreak: "keep-all" }}>{c.value}</div>
            <div style={{ fontSize: 34, fontWeight: 800, color: C.ink, letterSpacing: -0.8, lineHeight: 1.25, wordBreak: "keep-all" }}>{c.label}</div>
            {c.sub && <div style={{ fontSize: 24, fontWeight: 500, color: C.muted, wordBreak: "keep-all" }}>{c.sub}</div>}
          </Card>
        );
      })}
    </div>
  );
};

/** 챕터 전환 카드 — 씬 시작 1.5초, 무대만 덮음(PIP·자막 유지). scene.chapterCard {index,total,title} */
export const ChapterCard: React.FC<{ index?: number; total?: number; title: string; frames: number }> = ({ index, total, title, frames }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 140 } });
  const out = interpolate(frame, [frames - 10, frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: STAGE.x, top: STAGE.y, width: STAGE.w, height: STAGE.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, opacity: enter * out }}>
      {index != null && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.blue, color: C.white, borderRadius: R.pill, padding: "10px 24px", fontSize: 28, fontWeight: 800, transform: `scale(${enter})` }}>
          {index}{total ? ` / ${total}` : ""}
        </div>
      )}
      <div style={{ fontSize: 96, fontWeight: 800, color: C.ink, letterSpacing: -3.5, lineHeight: 1.15, textAlign: "center", maxWidth: 1400, wordBreak: "keep-all", transform: `translateY(${(1 - enter) * 24}px)` }}>{title}</div>
      <div style={{ width: interpolate(enter, [0, 1], [0, 160]), height: 8, borderRadius: 4, background: C.coral }} />
    </div>
  );
};

/** 키워드 칩 — 얼굴 구간(face-main) 우측 오버레이에 1~3어절. 6초 이상 얼굴 구간의 시각 변화용. data {text, accent?:"coral"|"blue", sub?} */
export const KeywordChip: React.FC<MP> = ({ data }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 12, stiffness: 150 } });
  const accent = data.accent === "blue" ? C.blue : C.coral;
  const words: string[] = String(data.text).split(" ");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, transform: `translateX(${(1 - p) * 40}px)`, opacity: p }}>
      <div style={{ background: C.white, borderRadius: R.card, padding: "22px 30px", boxShadow: SH.deep, borderLeft: `10px solid ${accent}`, maxWidth: 560 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "flex-end" }}>
          {words.map((w, i) => {
            const wp = spring({ frame: frame - 3 - i * 4, fps, config: { damping: 12, stiffness: 160 } });
            return <span key={i} style={{ fontSize: 52, fontWeight: 800, color: C.ink, letterSpacing: -1.5, lineHeight: 1.15, display: "inline-block", transform: `scale(${0.85 + 0.15 * wp})`, opacity: wp }}>{w}</span>;
          })}
        </div>
        {data.sub && <div style={{ marginTop: 6, fontSize: 24, fontWeight: 500, color: C.muted, textAlign: "right", wordBreak: "keep-all" }}>{data.sub}</div>}
      </div>
    </div>
  );
};

/** 리캡 카드 — N가지 전부 체크 + 한 줄 결론. data {items[], conclusion?} */
export const RecapCard: React.FC<MP> = ({ data, compact }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const items: string[] = data.items ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: compact ? "flex-end" : "center" }}>
      <div style={{ display: "flex", gap: compact ? 12 : 28, flexDirection: compact ? "column" : "row" }}>
        {items.map((t, i) => {
          const p = spring({ frame: frame - i * 9, fps, config: { damping: 13, stiffness: 130 } });
          return (
            <Card key={i} style={{ width: compact ? 520 : 440, padding: compact ? "18px 24px" : "30px 34px", display: "flex", alignItems: "center", gap: 18, transform: `scale(${p})`, opacity: p }}>
              <Check on amber size={44} />
              <span style={{ fontSize: compact ? 30 : 36, fontWeight: 800, color: C.ink, letterSpacing: -0.8, wordBreak: "keep-all" }}>{t}</span>
            </Card>
          );
        })}
      </div>
      {data.conclusion && <div style={{ fontSize: compact ? 34 : 48, fontWeight: 800, color: C.ink, letterSpacing: -1.2, opacity: spring({ frame: frame - items.length * 9 - 6, fps, config: { damping: 200 } }), wordBreak: "keep-all" }}>{data.conclusion}</div>}
    </div>
  );
};

/** 프로미스 카드 — 약속 문장 크게 + 빈 번호 카드 N장(본문에서 채워짐). data {text, count, labels?:[]} */
export const PromiseCard: React.FC<MP> = ({ data, compact }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200, mass: 0.7 } });
  const n: number = data.count ?? 3;
  const cardW = compact ? 170 : 360, cardH = compact ? 110 : 150;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: compact ? "flex-end" : "center", gap: compact ? 18 : 36, width: compact ? 560 : undefined }}>
      <div style={{ fontSize: compact ? 44 : 76, fontWeight: 800, color: C.ink, letterSpacing: compact ? -1.2 : -2.5, lineHeight: 1.2, textAlign: compact ? "right" : "center", maxWidth: compact ? 560 : 1500, wordBreak: "keep-all", whiteSpace: "pre-line", opacity: enter, transform: `translateY(${(1 - enter) * 20}px)`, textShadow: compact ? "0 2px 12px rgba(255,255,255,.9)" : "none" }}>{data.text}</div>
      <div style={{ display: "flex", gap: compact ? 14 : 28 }}>
        {Array.from({ length: n }).map((_, i) => {
          const p = spring({ frame: frame - 14 - i * 6, fps, config: { damping: 13, stiffness: 130 } });
          const label = data.labels?.[i];
          return (
            <Card key={i} style={{ width: cardW, height: cardH, display: "flex", alignItems: "center", justifyContent: "center", gap: compact ? 10 : 18, transform: `scale(${p})`, opacity: p }}>
              <span style={{ fontSize: compact ? 44 : 64, fontWeight: 900, color: label ? C.blue : C.line, lineHeight: 1 }}>{i + 1}</span>
              <span style={{ fontSize: compact ? 26 : 34, fontWeight: 800, color: label ? C.ink : C.muted, wordBreak: "keep-all" }}>{label ?? "?"}</span>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
