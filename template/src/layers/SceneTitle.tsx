import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Scene } from "../lib/data";
import { C, R, SH } from "../theme/store";

/** 비트가 없는 구간의 무대 채우기 — 씬 타이틀 카드(눈썹: 스파인 번호+주제 / 본문: 핵심 문장). 비트가 켜지면 페이드아웃 */
export const SceneTitle: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame + scene.from;
  const active = scene.beats.find((b) => local >= b.from - 8 && local < b.to);
  if (active && local >= active.from) return null;
  const fadeOut = active ? interpolate(local, [active.from - 8, active.from], [1, 0]) : 1;
  const enter = spring({ frame, fps, config: { damping: 200, mass: 0.7 } });
  const [eyebrow, main] = scene.title.includes(" — ") ? scene.title.split(" — ") : [null, scene.title];
  return (
    <div style={{ position: "absolute", left: 120, top: 96, width: 1680, height: 610, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, opacity: enter * fadeOut, transform: `translateY(${(1 - enter) * 24}px)` }}>
      {(eyebrow || scene.spine) && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.white, borderRadius: R.pill, padding: "10px 22px 10px 12px", boxShadow: SH.card }}>
          {scene.spine && <span style={{ width: 34, height: 34, borderRadius: 999, background: C.blue, color: C.white, display: "grid", placeItems: "center", fontSize: 20, fontWeight: 900 }}>{scene.spine.index}</span>}
          <span style={{ fontSize: 28, fontWeight: 800, color: C.blue, letterSpacing: -0.6 }}>{eyebrow ?? scene.title}</span>
        </div>
      )}
      <div style={{ fontSize: 88, fontWeight: 800, color: C.ink, letterSpacing: -3, lineHeight: 1.18, textAlign: "center", maxWidth: 1400, wordBreak: "keep-all" }}>{main}</div>
    </div>
  );
};
