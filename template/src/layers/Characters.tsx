import { Img, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TL } from "../lib/data";
import { BODUNG } from "../theme/store";

const SHOW_SEC = 4.2;
/** 보둥이 리액션 — 씬당 1회, 좌하단, 등장 스프링 + 5.5s 둥둥 + 코랄 글로우 */
export const Characters = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      {TL.scenes.filter((s) => s.character?.at != null).map((s) => (
        <Sequence key={s.id} from={s.character!.at} durationInFrames={Math.round(SHOW_SEC * fps)} layout="none">
          <Bodung pose={s.character!.pose} />
        </Sequence>
      ))}
    </>
  );
};

export const Bodung: React.FC<{ pose: string; x?: number; y?: number; size?: number }> = ({ pose, x = BODUNG.x, y = BODUNG.y, size = BODUNG.size }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const out = spring({ frame: frame - (durationInFrames - 12), fps, config: { damping: 200 }, durationInFrames: 12 });
  const bob = Math.sin((frame / fps) * ((2 * Math.PI) / 5.5)) * 8;
  return (
    <Img src={staticFile(`bodung/${pose}.png`)} style={{ position: "absolute", left: x, top: y + bob, width: size, height: size, transform: `scale(${pop * (1 - out)})`, transformOrigin: "50% 90%", filter: "drop-shadow(0 18px 28px rgba(255,106,69,0.35))" }} />
  );
};
