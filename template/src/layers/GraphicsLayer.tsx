import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { TL, Scene, Beat } from "../lib/data";
import { STAGE, OVERLAY } from "../theme/store";
import { MOTIONS } from "../motions";
import { BRoll } from "../motions/BRoll";
import { SceneTitle } from "./SceneTitle";
import { ChapterCard } from "../motions/Develop";

/** mode=stage: graphic-pip 씬의 그래픽(토킹헤드 아래) · mode=overlay: face-main 씬의 오버레이(토킹헤드 위) */
export const GraphicsLayer: React.FC<{ mode: "stage" | "overlay" }> = ({ mode }) => (
  <>
    {TL.scenes.filter((s) => (mode === "stage") === (s.layout !== "face-main")).map((s) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from} layout="none">
        <SceneBeats scene={s} mode={mode} />
      </Sequence>
    ))}
  </>
);

const SceneBeats: React.FC<{ scene: Scene; mode: "stage" | "overlay" }> = ({ scene, mode }) => {
  let lastTable: any = null;
  return (
    <>
      {mode === "stage" && <SceneTitle scene={scene} />}
      {mode === "stage" && scene.chapterCard && (
        <Sequence from={0} durationInFrames={45} layout="none"><ChapterCard {...scene.chapterCard} frames={45} /></Sequence>
      )}
      {scene.beats.map((b, i) => {
        let motion = b.motion;
        if (motion?.type === "generationTable") {                       // keep:true → 앞 비트 표 데이터 이어받기
          if (motion.data.keep && lastTable) motion = { type: "generationTable", data: { ...lastTable, ...motion.data } };
          else lastTable = motion.data;
        }
        if (motion) motion = { type: motion.type, data: { ...motion.data, parentFrom: b.from } };   // 절대 프레임(revealAt·wordTimes·at) → 비트 로컬 변환 기준
        if (!motion && !b.broll) return null;
        return (
          <Sequence key={i} from={b.from - scene.from} durationInFrames={Math.max(1, b.to - b.from)} layout="none">
            <MotionHost mode={mode} dur={b.to - b.from}>
              {b.broll && !motion ? <BRoll asset={b.broll.asset} focus={b.broll.focus} /> : null}
              {motion ? <MotionSwitch motion={motion} compact={mode === "overlay"} dur={b.to - b.from} /> : null}
            </MotionHost>
          </Sequence>
        );
      })}
    </>
  );
};

const MotionSwitch: React.FC<{ motion: Beat["motion"]; compact: boolean; dur: number }> = ({ motion, compact, dur }) => {
  if (!motion) return null;
  const Comp = MOTIONS[motion.type];
  if (!Comp) return <div style={{ color: "#D93D1A", fontSize: 28, fontWeight: 800 }}>missing motion: {motion.type}</div>;
  return <Comp data={motion.data} compact={compact} dur={dur} />;
};

/** 무대/오버레이 박스 + 진입·퇴장 페이드(8프레임) */
const MotionHost: React.FC<{ mode: "stage" | "overlay"; dur: number; children: React.ReactNode }> = ({ mode, dur, children }) => {
  const frame = useCurrentFrame();
  const box = mode === "stage" ? STAGE : OVERLAY;
  const op = interpolate(frame, [0, 8, Math.max(9, dur - 8), Math.max(10, dur)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, opacity: op, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};
