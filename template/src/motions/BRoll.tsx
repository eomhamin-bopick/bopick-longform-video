import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { R, SH, STAGE } from "../theme/store";
/** Higgs 이미지 B-roll — Ken Burns(scale 1.08→1.2, 살짝 팬), 20px 곡률 카드 */
export const BRoll: React.FC<{ asset: string; focus?: "left" | "center" }> = ({ asset, focus = "center" }) => {
  const frame = useCurrentFrame(); const { durationInFrames } = useVideoConfig();
  const s = interpolate(frame, [0, durationInFrames], [1.08, 1.2], { extrapolateRight: "clamp" });
  const x = interpolate(frame, [0, durationInFrames], [-1.5, 1.5], { extrapolateRight: "clamp" });
  return (
    <div style={{ width: STAGE.w, height: STAGE.h, borderRadius: R.card, overflow: "hidden", boxShadow: SH.deep, background: "#EAF2FE" }}>
      <Img src={staticFile(`assets/${asset}`)} style={{ width: focus === "left" ? "166%" : "100%", height: "100%", objectFit: "cover", objectPosition: focus === "left" ? "0% 50%" : "50% 50%", transform: `scale(${s}) translateX(${x}%)`, transformOrigin: focus === "left" ? "30% 50%" : "50% 50%" }} />
    </div>
  );
};
