import { AbsoluteFill } from "remotion";
import { C } from "../theme/store";
/** 캔버스 #F7F7F8 위 블루 틴트 라디얼 — 그래픽 씬 배경 */
export const Background = () => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 38%, ${C.white} 0%, ${C.canvas} 40%, ${C.blueTint} 100%)` }} />
);
