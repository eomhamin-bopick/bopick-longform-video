import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TL, lastSwitch, HeadMode } from "../lib/data";
import { PIP, END, SH, W, H } from "../theme/store";

const SWITCH_FRAMES = 14;
type Rect = { x: number; y: number; w: number; radius: number; alpha: number };
const RECT: Record<HeadMode, Rect> = {
  full: { x: 0, y: 0, w: W, radius: 0, alpha: 1 },
  pip: { x: PIP.x, y: PIP.y, w: PIP.w, radius: PIP.radius, alpha: 1 },
  end: { x: END.x, y: END.y, w: END.w, radius: END.radius, alpha: 1 },
  hidden: { x: PIP.x, y: PIP.y, w: PIP.w, radius: PIP.radius, alpha: 0 },
};
/** 컷 세그먼트 = Sequence 1개. 모드(full/pip/end/hidden) 전환은 마지막 전환 프레임 기준 스프링으로 transform·opacity만. 첫 모드는 스프링 없이 고정. */
export const TalkingHead = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sw = lastSwitch(frame);
  const p = sw.isFirst ? 1 : spring({ frame: frame - sw.frame, fps, config: { damping: 18, stiffness: 120, mass: 0.8 }, durationInFrames: SWITCH_FRAMES * 2 });
  const from = RECT[sw.prev], to = RECT[sw.mode];
  const lerp = (a: number, b: number) => interpolate(p, [0, 1], [a, b]);
  const w = lerp(from.w, to.w), scale = w / W;
  const x = lerp(from.x, to.x), y = lerp(from.y, to.y);
  const radius = lerp(from.radius, to.radius) / scale;
  const alpha = lerp(from.alpha, to.alpha);
  const fullness = sw.mode === "full" ? p : sw.prev === "full" ? 1 - p : 0;   // 펀치인 강도(풀일 때만)
  const shadow = scale < 0.98 ? SH.deep : "none";
  const preroll = TL.prerollFrames ?? 0;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: "0 0", borderRadius: radius, overflow: "hidden", boxShadow: shadow, backgroundColor: "#000", opacity: alpha }}>
      {TL.segments.map((s, i) => (
        <Sequence key={i} from={s.outStartFrame + preroll} durationInFrames={s.frames} layout="none">
          <Segment index={i} srcFrom={s.srcStartFrame} frames={s.frames} full={fullness} />
        </Sequence>
      ))}
    </div>
  );
};

/** 얼굴 풀 구간의 점프컷 은폐: 세그먼트마다 1.0 / 1.04 / 1.06 펀치인 교대 (PIP일 땐 0) */
const Segment: React.FC<{ index: number; srcFrom: number; frames: number; full: number }> = ({ index, srcFrom, frames, full }) => {
  const punchAmt = index % 3 === 1 ? 0.04 : index % 3 === 2 ? 0.06 : 0;
  const punch = 1 + punchAmt * full;
  return (
    <AbsoluteFill style={{ transform: `scale(${punch})`, transformOrigin: "50% 45%" }}>
      <OffthreadVideo src={staticFile("src/talk.mp4")} trimBefore={srcFrom} trimAfter={srcFrom + frames} style={{ width: W, height: H, objectFit: "cover" }} />
    </AbsoluteFill>
  );
};
