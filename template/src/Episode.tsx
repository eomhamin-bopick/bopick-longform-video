import { AbsoluteFill } from "remotion";
import { loadPretendard } from "./lib/fonts";
import { TL } from "./lib/data";
import { C, FONT } from "./theme/store";
import { Background } from "./layers/Background";
import { TalkingHead } from "./layers/TalkingHead";
import { GraphicsLayer } from "./layers/GraphicsLayer";
import { Captions } from "./layers/Captions";
import { Spine } from "./layers/Spine";
import { Characters } from "./layers/Characters";
import { Lockup } from "./layers/Lockup";
import { Sfx } from "./layers/Sfx";

loadPretendard();

/** 레이어 순서(아래→위): 배경 → 무대 그래픽(graphic-pip) → 토킹헤드(풀/PIP) → 오버레이 그래픽(face-main) → 스파인 → 보둥이 → 자막 → 락업 */
export const Episode = () => (
  <AbsoluteFill style={{ backgroundColor: C.canvas, fontFamily: FONT, color: C.ink }}>
    <Background />
    <GraphicsLayer mode="stage" />
    <TalkingHead />
    <GraphicsLayer mode="overlay" />
    <Spine />
    <Characters />
    <Captions />
    <Lockup />
    <Sfx />
  </AbsoluteFill>
);
