import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, R, SH } from "../theme/store";
import { Card, Check, Credit, MP, Title, useIn, usePop, wordFrame } from "./shared";

/** 수치 카운트업 — 코랄 숫자 900, tabular-nums */
export const StatCount: React.FC<MP> = ({ data, compact }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 4, fps, config: { damping: 200 }, durationInFrames: Math.round(0.9 * fps) });
  const val = Math.round(interpolate(p, [0, 1], [data.from ?? 0, data.to]));
  const pop = usePop(0, { damping: 14, stiffness: 110 });
  const big = compact ? 120 : 176;
  return (
    <Card style={{ transform: `scale(${pop})`, padding: compact ? "34px 40px" : "48px 72px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, lineHeight: 1 }}>
        {data.prefix && <span style={{ fontSize: big * 0.36, fontWeight: 800, color: C.body }}>{data.prefix}</span>}
        <span style={{ fontSize: big, fontWeight: 900, color: C.coral, fontVariantNumeric: "tabular-nums", letterSpacing: -4 }}>{val}</span>
        {data.suffix && <span style={{ fontSize: big * 0.36, fontWeight: 800, color: C.body }}>{data.suffix}</span>}
      </div>
      {data.caption && <div style={{ fontSize: compact ? 24 : 30, color: C.muted, fontWeight: 500 }}>{data.caption}</div>}
    </Card>
  );
};

/** 번호 카드 1·2·3 — 오버레이(세로 스택) / 무대(가로 3장). revealAt·pulseAt은 빌드가 단어 시각으로 채움 */
export const NumberCards: React.FC<MP> = ({ data, compact, dur }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const cards: string[] = data.cards;
  const parentFrom = (data.parentFrom as number) ?? 0;
  return (
    <div style={{ display: "flex", flexDirection: compact ? "column" : "row", gap: compact ? 18 : 40, alignItems: "stretch" }}>
      {cards.map((label, i) => {
        const revealLocal = data.revealAt ? Math.max(0, data.revealAt[i] - parentFrom) : i * 6;
        const pop = spring({ frame: frame - revealLocal, fps, config: { damping: 13, stiffness: 130 } });
        const pulseLocal = data.pulseAt?.[i] != null ? data.pulseAt[i] - parentFrom : null;
        const pulse = pulseLocal != null ? spring({ frame: frame - pulseLocal, fps, config: { damping: 8, stiffness: 200 }, durationInFrames: 16 }) : 0;
        const scale = pop * (1 + 0.06 * Math.sin(pulse * Math.PI));
        const unknown = label === "?";
        return (
          <Card key={i} style={{ position: "relative", transform: `scale(${scale})`, width: compact ? 520 : 480, height: compact ? 150 : 300, display: "flex", flexDirection: compact ? "row" : "column", alignItems: "center", justifyContent: "center", gap: compact ? 24 : 12, padding: compact ? "0 32px" : 0 }}>
            <span style={{ fontSize: compact ? 64 : 110, fontWeight: 900, color: unknown ? C.line : C.blue, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
            <span style={{ fontSize: compact ? 38 : 44, fontWeight: 800, color: unknown ? C.muted : C.ink, letterSpacing: -0.8 }}>{unknown ? "?" : label}</span>
            {data.complete && <span style={{ position: "absolute", right: 16, top: 16 }}><Check on amber size={40} /></span>}
          </Card>
        );
      })}
    </div>
  );
};

/** 양자택일 카드 — a ✕ / b 강조(코랄). coinFlip 스타일은 b가 뒤집혀 등장 */
export const EitherOr: React.FC<MP> = ({ data, compact, dur }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const revealAt = wordFrame(data, data.b, data.parentFrom ?? 0, Math.round(dur * 0.42));
  const r = spring({ frame: frame - revealAt, fps, config: { damping: 12, stiffness: 120 } });
  const inA = usePop(0, { damping: 200 });
  const dim = interpolate(r, [0, 1], [1, 0.42]);
  const flip = data.style === "coinFlip" ? interpolate(r, [0, 1], [28, 0]) : 0;   // 살짝 기울어 대기 → 공개 시 정면
  const w = compact ? 250 : 520, h = compact ? 200 : 300, fs = compact ? 40 : 56;
  return (
    <div style={{ display: "flex", gap: compact ? 20 : 48, alignItems: "center", position: "relative" }}>
      <Card style={{ width: w, height: h, display: "grid", placeItems: "center", opacity: dim, transform: `scale(${inA})`, position: "relative" }}>
        <span style={{ fontSize: fs, fontWeight: 800, color: C.body, letterSpacing: -1 }}>{data.a}</span>
        {(data.strike || data.reveal === "b") && <div style={{ position: "absolute", left: "14%", right: "14%", top: "50%", height: 6, borderRadius: 3, background: C.muted, transform: `scaleX(${r})`, transformOrigin: "left" }} />}
      </Card>
      <span style={{ fontSize: compact ? 28 : 36, fontWeight: 800, color: C.muted }}>vs</span>
      <Card tint="coral" style={{ width: w, height: h, display: "grid", placeItems: "center", transform: `perspective(1200px) rotateY(${flip}deg) scale(${0.9 + 0.14 * r})`, boxShadow: r > 0.5 ? SH.coral : SH.card }}>
        <span style={{ fontSize: fs, fontWeight: 800, color: C.coralInk, letterSpacing: -1, opacity: interpolate(r, [0, 0.4, 1], [0.35, 0.6, 1]) }}>{data.b}</span>
      </Card>
    </div>
  );
};

/** 체크리스트 — 항목 순차 등장 + 블루 체크 */
export const Checklist: React.FC<MP> = ({ data, compact }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const items: string[] = data.items;
  return (
    <Card tint="blue" style={{ padding: compact ? "28px 32px" : "40px 56px", display: "flex", flexDirection: "column", gap: compact ? 16 : 22, minWidth: compact ? 500 : 900 }}>
      {items.map((t, i) => {
        const p = spring({ frame: frame - 6 - i * 12, fps, config: { damping: 14, stiffness: 120 } });
        const on = frame > 6 + i * 12 + 14;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, transform: `translateX(${(1 - p) * 30}px)`, opacity: p }}>
            <Check on={on} size={compact ? 40 : 48} />
            <span style={{ fontSize: compact ? 34 : 42, fontWeight: 700, color: C.ink, letterSpacing: -0.8, wordBreak: "keep-all" }}>{t}</span>
          </div>
        );
      })}
    </Card>
  );
};

/** 아이콘 칩 행 — 암·뇌혈관·심장 */
export const IconRow: React.FC<MP> = ({ data, compact }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", gap: compact ? 16 : 36 }}>
      {(data.items as string[]).map((t, i) => {
        const p = spring({ frame: frame - i * 8, fps, config: { damping: 13, stiffness: 130 } });
        return (
          <Card key={i} style={{ transform: `scale(${p})`, padding: compact ? "22px 30px" : "34px 48px", display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ width: compact ? 28 : 40, height: compact ? 28 : 40, borderRadius: 999, background: C.blue, boxShadow: "0 0 0 8px rgba(0,102,255,.14)" }} />
            <span style={{ fontSize: compact ? 34 : 52, fontWeight: 800, color: C.ink, letterSpacing: -1 }}>{t}</span>
          </Card>
        );
      })}
    </div>
  );
};

/** 키워드 타이포 — 한 문장이 화면 중앙에 크게, 어절 단위 팝(단어 시각이 있으면 그 시각에) */
export const KeywordTypo: React.FC<MP> = ({ data, compact }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const lines: string[] = String(data.text).split("\n");
  let idx = 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", gap: compact ? 12 : 22, flexWrap: "wrap", justifyContent: "center" }}>
          {line.split(" ").map((w, wi) => {
            const k = idx++;
            const at = wordFrame(data, w, data.parentFrom ?? 0, 4 + k * 5);
            const p = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 140 } });
            return <span key={wi} style={{ display: "inline-block", fontSize: compact ? 64 : 104, fontWeight: 800, color: C.ink, letterSpacing: -3, lineHeight: 1.15, transform: `translateY(${(1 - p) * 26}px) scale(${0.85 + 0.15 * p})`, opacity: p, textShadow: "0 2px 0 rgba(255,255,255,.6)" }}>{w}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

/** 말풍선 */
export const SpeechBubble: React.FC<MP> = ({ data, compact }) => {
  const p = usePop(0, { damping: 11, stiffness: 150 });
  return (
    <div style={{ position: "relative", transform: `scale(${p})`, transformOrigin: "20% 100%" }}>
      <Card style={{ padding: compact ? "22px 30px" : "30px 44px", borderRadius: 28 }}>
        <span style={{ fontSize: compact ? 38 : 54, fontWeight: 800, color: C.ink, letterSpacing: -1 }}>{data.text}</span>
      </Card>
      <div style={{ position: "absolute", left: 48, bottom: -18, width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: `22px solid ${C.white}` }} />
    </div>
  );
};

/** 인용 카드 — 좌측 코랄 바, 헤드라인 800, 본문 500, 크레딧. 캡처처럼 보이게 만들지 않는다 */
export const QuoteCard: React.FC<MP> = ({ data, compact }) => {
  const p = usePop(0, { damping: 200, mass: 0.6 });
  const y = interpolate(p, [0, 1], [30, 0]);
  return (
    <Card style={{ position: "relative", padding: compact ? "34px 40px 44px 44px" : "48px 64px 56px 72px", maxWidth: compact ? 540 : 1320, transform: `translateY(${y}px)`, opacity: p }}>
      <div style={{ position: "absolute", left: 0, top: 28, bottom: 28, width: 10, borderRadius: 6, background: C.coral }} />
      <Title size={compact ? 36 : 50}>{data.headline}</Title>
      <div style={{ marginTop: 18, fontSize: compact ? 26 : 34, fontWeight: 500, color: C.body, lineHeight: 1.5, whiteSpace: "pre-line", wordBreak: "keep-all" }}>{data.body}</div>
      {data.source && <Credit text={data.source.text} />}
    </Card>
  );
};
