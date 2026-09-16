import { Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TL } from "../lib/data";
import { C, R, SH } from "../theme/store";

const ITEMS = ["사망 보장", "실손 보장", "진단비 보장"];
/** 상단 스파인 — "꼭 챙길 3가지 · 1 · 2 · 3", 완료 ✓, 현재 항목 블루 글로우 (ch3~5) */
export const Spine = () => (
  <>
    {TL.scenes.filter((s) => s.spine).map((s) => {
      const allDone = s.beats.some((b) => b.motion?.type === "numberCards" && b.motion.data.complete);
      const doneFrom = allDone ? s.beats.find((b) => b.motion?.type === "numberCards" && b.motion.data.complete)!.from : Infinity;
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from} layout="none">
          <SpineBar index={s.spine!.index} doneFromLocal={doneFrom - s.from} />
        </Sequence>
      );
    })}
  </>
);

const SpineBar: React.FC<{ index: number; doneFromLocal: number }> = ({ index, doneFromLocal }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200, mass: 0.6 } });
  const y = interpolate(enter, [0, 1], [-30, 0]);
  const allDone = frame >= doneFromLocal;
  return (
    <div style={{ position: "absolute", top: 30, left: "50%", transform: `translateX(-50%) translateY(${y}px)`, opacity: enter, display: "flex", alignItems: "center", gap: 14, background: C.white, borderRadius: R.pill, padding: "10px 22px 10px 18px", boxShadow: SH.card }}>
      <span style={{ fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: -0.4 }}>꼭 챙길 3가지</span>
      <span style={{ width: 1, height: 22, background: C.line }} />
      {ITEMS.map((label, i) => {
        const n = i + 1;
        const done = allDone || n < index;
        const active = !allDone && n === index;
        return (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 22, fontWeight: 700, color: active ? C.blue : done ? C.body : C.muted, opacity: active || done ? 1 : 0.6 }}>
            <span style={{ width: 28, height: 28, borderRadius: 999, display: "grid", placeItems: "center", fontSize: 15, fontWeight: 800, color: active ? C.white : done ? C.white : C.muted, background: active ? C.blue : done ? C.blue90 : C.n30, boxShadow: active ? "0 0 0 6px rgba(0,102,255,.18)" : "none" }}>{done ? "✓" : n}</span>
            {label}
          </span>
        );
      })}
    </div>
  );
};
