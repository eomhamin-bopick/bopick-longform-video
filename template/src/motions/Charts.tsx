import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, R, SH } from "../theme/store";
import { Card, Check, Credit, MP, Title } from "./shared";

/** 연령 타임라인 — 0→100세 지바, "자녀 독립" 마커, 100세까지(코랄) vs 독립 시점까지(블루). emphasis:"long"은 단일 블루 바 */
export const AgeTimeline: React.FC<MP> = ({ data, compact }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const W = compact ? 500 : 1400;
  const fill = spring({ frame: frame - 6, fps, config: { damping: 200 }, durationInFrames: Math.round(1.2 * fps) });
  const bad = spring({ frame: frame - Math.round(1.6 * fps), fps, config: { damping: 200 }, durationInFrames: Math.round(1.2 * fps) });
  const markerPct = data.marker?.pct ?? 0.6;
  if (data.emphasis === "long") {
    return (
      <Card style={{ padding: compact ? "30px 36px" : "44px 64px", width: W + (compact ? 72 : 128) }}>
        <Title size={compact ? 32 : 40}>{data.label ?? "최대한 길게"}</Title>
        <div style={{ marginTop: 26, height: 30, borderRadius: 15, background: C.blueTint, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: C.blue, borderRadius: 15 }} />
        </div>
        <Axis compact={compact} />
      </Card>
    );
  }
  return (
    <Card style={{ padding: compact ? "30px 36px" : "44px 64px", width: W + (compact ? 72 : 128) }}>
      <Title size={compact ? 32 : 40}>사망 보장, 언제까지?</Title>
      <div style={{ marginTop: 30, position: "relative", height: compact ? 150 : 190 }}>
        {/* 적정: 독립 시점까지 */}
        <Row label={data.good?.label ?? "독립 시점까지"} color={C.blue} pct={fill * markerPct} y={0} compact={compact} />
        {/* 사례: 100세까지 */}
        <Row label={data.bad?.label ?? "100세까지"} color={C.coral} pct={bad} y={compact ? 78 : 100} compact={compact} dim={bad === 0} />
        {/* 마커 */}
        <div style={{ position: "absolute", left: `${markerPct * 100}%`, top: -8, bottom: -6, width: 3, background: C.ink, opacity: fill }} />
        <div style={{ position: "absolute", left: `${markerPct * 100}%`, top: -46, transform: "translateX(-50%)", background: C.ink, color: C.white, fontSize: compact ? 18 : 22, fontWeight: 700, padding: "6px 14px", borderRadius: R.pill, opacity: fill, whiteSpace: "nowrap" }}>{data.marker?.label ?? "자녀 독립"}</div>
      </div>
      <Axis compact={compact} />
    </Card>
  );
};
const Row: React.FC<{ label: string; color: string; pct: number; y: number; compact: boolean; dim?: boolean }> = ({ label, color, pct, y, compact, dim }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, opacity: dim ? 0 : 1 }}>
    <div style={{ fontSize: compact ? 20 : 24, fontWeight: 700, color: C.body, marginBottom: 8 }}>{label}</div>
    <div style={{ height: compact ? 26 : 34, borderRadius: 17, background: C.n30, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.max(0, pct) * 100}%`, background: color, borderRadius: 17 }} />
    </div>
  </div>
);
const Axis: React.FC<{ compact: boolean }> = ({ compact }) => (
  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: compact ? 18 : 22, color: C.muted, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
    {["0세", "20세", "40세", "60세", "80세", "100세"].map((t) => <span key={t}>{t}</span>)}
  </div>
);

/** 소득공백 스택 — 치료비(=실손, 블루) 위에 소득 공백(코랄) 블록이 올라옴 */
export const IncomeGapStack: React.FC<MP> = ({ data, compact }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const base = spring({ frame: frame - 4, fps, config: { damping: 200 }, durationInFrames: Math.round(0.8 * fps) });
  const gap = spring({ frame: frame - Math.round(1.1 * fps), fps, config: { damping: 16, stiffness: 110 } });
  const colW = compact ? 200 : 300, baseH = compact ? 150 : 220, gapH = compact ? 130 : 200;
  return (
    <Card style={{ padding: compact ? "30px 36px" : "44px 64px", display: "flex", alignItems: "flex-end", gap: compact ? 28 : 56 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: baseH + gapH + 30 }}>
        <div style={{ width: colW, height: gapH * gap, background: C.coral, borderRadius: `${R.card}px ${R.card}px 6px 6px`, boxShadow: SH.coral, marginBottom: 8, display: "grid", placeItems: "center", overflow: "hidden" }}>
          <span style={{ fontSize: compact ? 26 : 34, fontWeight: 800, color: C.ink, opacity: gap }}>{data.gap.label}</span>
        </div>
        <div style={{ width: colW, height: baseH * base, background: C.blue, borderRadius: `6px 6px ${R.card}px ${R.card}px`, display: "grid", placeItems: "center", overflow: "hidden" }}>
          <span style={{ fontSize: compact ? 24 : 30, fontWeight: 800, color: C.white, textAlign: "center", lineHeight: 1.2 }}>{data.base.label}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, opacity: gap }}>
        <Title size={compact ? 32 : 44}>일 못하는 동안<br />끊기는 소득</Title>
        <div style={{ fontSize: compact ? 24 : 30, color: C.body, fontWeight: 500, lineHeight: 1.45 }}>치료비는 실손이 커버해도<br />이 공백은 진단비가 메워요</div>
      </div>
    </Card>
  );
};

/** 정리 3단계 — 가로 3 스텝, 현재 블루 글로우, 지난 단계 ✓, complete면 전부 앰버 ✓ */
export const StepFlow: React.FC<MP> = ({ data, compact }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const steps: string[] = data.steps ?? ["무작정 해지하지 않기", "새 보험 가입 먼저, 정리는 그다음", "건강 상태 미리 확인"];
  const active = data.active ?? 1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: compact ? 12 : 28, flexDirection: compact ? "column" : "row" }}>
      {steps.map((t, i) => {
        const n = i + 1;
        const p = spring({ frame: frame - i * 7, fps, config: { damping: 14, stiffness: 120 } });
        const isActive = !data.complete && n === active, done = data.complete || n < active;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: compact ? 12 : 28 }}>
            <Card style={{ width: compact ? 520 : 470, minHeight: compact ? 120 : 210, padding: compact ? "18px 24px" : "30px 34px", display: "flex", flexDirection: compact ? "row" : "column", alignItems: compact ? "center" : "flex-start", gap: 16, transform: `scale(${p})`, boxShadow: isActive ? "0 0 0 6px rgba(0,102,255,.16), " + SH.card : SH.card, opacity: n > active && !data.complete ? 0.55 : 1 }}>
              {done ? <Check on amber={!!data.complete} size={44} /> : <span style={{ width: 44, height: 44, borderRadius: 999, display: "grid", placeItems: "center", fontSize: 24, fontWeight: 900, color: C.white, background: isActive ? C.blue : C.line }}>{n}</span>}
              <span style={{ fontSize: compact ? 30 : 36, fontWeight: 800, color: C.ink, letterSpacing: -0.8, lineHeight: 1.25, wordBreak: "keep-all" }}>{t}</span>
            </Card>
            {i < steps.length - 1 && !compact && <span style={{ fontSize: 40, color: C.blue90, fontWeight: 900 }}>→</span>}
          </div>
        );
      })}
    </div>
  );
};

/** 플로우차트 — 순서가 바뀌면 보장 공백(코랄 빗금) vs 가입 먼저면 공백 0 */
export const Flowchart: React.FC<MP> = ({ data, compact }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const rows: { title: string; boxes: string[]; bad: boolean }[] = [
    { title: "정리부터 하면", boxes: data.bad, bad: true },
    { title: "가입부터 하면", boxes: data.good, bad: false },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 18 : 30 }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", alignItems: "center", gap: compact ? 12 : 22 }}>
          <div style={{ width: compact ? 150 : 220, fontSize: compact ? 24 : 30, fontWeight: 800, color: row.bad ? C.coralInk : C.blue }}>{row.title}</div>
          {row.boxes.map((b, bi) => {
            const p = spring({ frame: frame - (ri * 24 + bi * 9), fps, config: { damping: 14, stiffness: 130 } });
            const isGap = /공백/.test(b) && row.bad;
            const zero = /공백 0/.test(b);
            return (
              <div key={bi} style={{ display: "flex", alignItems: "center", gap: compact ? 12 : 22, transform: `scale(${p})`, opacity: p }}>
                <div style={{ minWidth: compact ? 120 : 250, padding: compact ? "14px 18px" : "22px 28px", borderRadius: 16, textAlign: "center", fontSize: compact ? 24 : 32, fontWeight: 800, letterSpacing: -0.6, color: isGap ? C.coralInk : zero ? C.white : C.ink, background: isGap ? `repeating-linear-gradient(135deg, ${C.coralTint} 0 10px, ${C.coralLine} 10px 20px)` : zero ? C.blue : C.white, border: isGap ? `2px dashed ${C.coral}` : "none", boxShadow: SH.card }}>{b}</div>
                {bi < row.boxes.length - 1 && <span style={{ fontSize: compact ? 26 : 36, color: C.muted, fontWeight: 900 }}>→</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** 실손 세대 비교표 — 행 순차 등장, 하이라이트 셀, "나는 어느 세대?" 물음표, 출처 크레딧 */
export const GenerationTable: React.FC<MP> = ({ data, compact }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const cols: { key: string; label: string }[] = data.columns;
  const rows: any[] = data.rows;
  const gapF = data.rowGapFrames ?? 6;
  const keep = !!data.keep;
  const hl: { row: number; col: string; color: string; label?: string }[] = data.highlight ?? [];
  const q = data.question;
  const fsz = compact ? 18 : 24;
  const colW = [compact ? 70 : 150, compact ? 150 : 330, compact ? 120 : 330, compact ? 120 : 360, compact ? 110 : 260];
  return (
    <Card style={{ position: "relative", padding: compact ? "22px 24px 34px" : "30px 40px 44px", width: compact ? 570 : 1560 }}>
      {data.title && <Title size={compact ? 26 : 38}>{data.title}</Title>}
      <div style={{ marginTop: compact ? 14 : 22, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {cols.map((c, ci) => {
            const isQ = q && q.col === c.key;
            const qp = isQ ? spring({ frame: frame - 6, fps, config: { damping: 10, stiffness: 160 } }) : 0;
            return (
              <div key={c.key} style={{ width: colW[ci], padding: compact ? "8px 10px" : "12px 16px", borderRadius: 12, background: isQ && qp > 0 ? C.coralTint : C.blueTint, color: isQ && qp > 0 ? C.coralInk : C.blue, fontSize: fsz, fontWeight: 700, transform: `scale(${1 + 0.06 * Math.sin(qp * Math.PI)})` }}>
                {c.label}{isQ && <span style={{ marginLeft: 8, opacity: qp }}>{q.text}</span>}
              </div>
            );
          })}
        </div>
        {rows.map((r, ri) => {
          const p = keep ? 1 : spring({ frame: frame - 8 - ri * gapF, fps, config: { damping: 200, mass: 0.6 } });
          return (
            <div key={ri} style={{ display: "flex", gap: 8, opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
              {cols.map((c, ci) => {
                const h = hl.find((x) => x.row === ri && x.col === c.key);
                const hp = h ? spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 140 } }) : 0;
                const col = h?.color === "coral" ? C.coral : C.blue;
                return (
                  <div key={c.key} style={{ position: "relative", width: colW[ci], padding: compact ? "8px 10px" : "12px 16px", borderRadius: 12, background: ci === 0 ? C.n30 : C.white, border: `1.5px solid ${h ? col : C.line}`, boxShadow: h ? `0 0 0 ${4 * hp}px ${h.color === "coral" ? "rgba(255,106,69,.22)" : "rgba(0,102,255,.18)"}` : "none", fontSize: fsz, fontWeight: ci === 0 ? 800 : h ? 800 : 500, color: h ? (h.color === "coral" ? C.coralInk : C.blue) : ci === 0 ? C.ink : C.body, lineHeight: 1.3, wordBreak: "keep-all" }}>
                    {ci === 0 ? <>{r.gen}<div style={{ fontSize: fsz * 0.72, fontWeight: 500, color: C.muted }}>{r.label}</div></> : r[c.key]}
                    {h?.label && <div style={{ marginTop: 4, fontSize: fsz * 0.7, fontWeight: 800, color: col, opacity: hp, transform: `translateY(${(1 - hp) * 6}px)` }}>{h.label}</div>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {data.source && <Credit text={data.source.text} />}
    </Card>
  );
};
