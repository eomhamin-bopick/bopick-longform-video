import { Audio, Sequence, staticFile } from "remotion";
import { TL, LAYOUT_SWITCHES } from "../lib/data";

/** 사운드 — 모션 유형별 효과음 자동 매핑 + 모드 전환 whoosh + BGM(−22 LU 근사: volume 0.1). 콜드 오픈(프리롤)은 무음. */
const SFX_BY_TYPE: Record<string, string> = {
  statCount: "tick", numberCards: "pop", eitherOr: "pop", checklist: "check", iconRow: "pop", keywordTypo: "pop", speechBubble: "pop", quoteCard: "pop",
  ageTimeline: "whoosh", incomeGapStack: "pop", stepFlow: "pop", flowchart: "pop", generationTable: "pop", phoneScene: "pop", countdown: "tick",
  keywordChip: "tap", recapCard: "ding", promiseCard: "whoosh", coldOpen: "",
};
export const Sfx = () => {
  const on = TL.audio?.sfx !== false;
  const preroll = TL.prerollFrames ?? 0;
  const bgm = TL.audio?.bgm;
  return (
    <>
      {on && TL.scenes.flatMap((s) => s.beats).map((b, i) => {
        const name = b.motion ? SFX_BY_TYPE[b.motion.type] ?? "pop" : "";
        if (!name) return null;
        return <Sequence key={`sfx-${i}`} from={b.from} durationInFrames={24} layout="none"><Audio src={staticFile(`sfx/${name}.mp3`)} volume={0.28} /></Sequence>;
      })}
      {on && LAYOUT_SWITCHES.slice(1).map((sw, i) => (
        <Sequence key={`sw-${i}`} from={sw.frame} durationInFrames={20} layout="none"><Audio src={staticFile("sfx/whoosh.mp3")} volume={0.22} /></Sequence>
      ))}
      {bgm && (
        <Sequence from={preroll} durationInFrames={TL.outFrames - preroll} layout="none">
          <Audio src={staticFile(`audio/${bgm}`)} volume={TL.audio?.bgmVolume ?? 0.1} loop />
        </Sequence>
      )}
    </>
  );
};
