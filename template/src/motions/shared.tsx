import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, R, SH } from "../theme/store";
export type MP = { data: any; compact: boolean; dur: number };

export const usePop = (delay = 0, config: { damping: number; stiffness?: number; mass?: number } = { damping: 14, stiffness: 120 }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
};
export const useIn = (delay = 0, len = 10) => {
  const frame = useCurrentFrame();
  return interpolate(frame - delay, [0, len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};
/** wordTimes에서 특정 어절(앞 2글자)이 나오는 로컬 프레임. 없으면 fallback */
export const wordFrame = (data: any, key: string, from: number, fallback: number) => {
  const hit = (data?.wordTimes || []).find((w: any) => w.t.startsWith(key.slice(0, 2)));
  return hit ? Math.max(0, hit.at - from) : fallback;
};

export const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode; tint?: "white" | "blue" | "coral" }> = ({ style, children, tint = "white" }) => (
  <div style={{ background: tint === "blue" ? C.blueTint : tint === "coral" ? C.coralTint : C.white, borderRadius: R.card, boxShadow: SH.card, border: tint === "coral" ? `1.5px solid ${C.coralLine}` : "none", ...style }}>{children}</div>
);

/** 출처 크레딧 — 카드 우하단, 18px, 45% 불투명 (설계서 §4.7) */
export const Credit: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", right: 16, bottom: 12, fontSize: 18, fontWeight: 500, color: C.muted, opacity: 0.45, letterSpacing: -0.2 }}>{text}</div>
);

export const Title: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 44 }) => (
  <div style={{ fontSize: size, fontWeight: 800, color: C.ink, letterSpacing: -1, lineHeight: 1.2, wordBreak: "keep-all" }}>{children}</div>
);
export const Check: React.FC<{ on: boolean; amber?: boolean; size?: number }> = ({ on, amber, size = 36 }) => (
  <span style={{ width: size, height: size, borderRadius: 999, display: "inline-grid", placeItems: "center", fontSize: size * 0.5, fontWeight: 900, color: on ? C.white : C.muted, background: on ? (amber ? C.amber : C.blue) : C.blueTint, transition: "none" }}>{on ? "✓" : ""}</span>
);
