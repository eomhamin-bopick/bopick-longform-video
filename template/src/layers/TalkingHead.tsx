import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TL, lastSwitch, LAYOUT_SWITCHES } from "../lib/data";
import { PIP, SH, W, H } from "../theme/store";

const SWITCH_FRAMES = 14;
/** 컷 세그먼트 = Sequence 1개. 레이아웃(풀↔PIP)은 마지막 전환 프레임 기준 스프링으로 transform만 애니메이트. */
export const TalkingHead = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sw = lastSwitch(frame);
  const isFirst = sw.frame === LAYOUT_SWITCHES[0].frame;
  const raw = isFirst ? 1 : spring({ frame: frame - sw.frame, fps, config: { damping: 18, stiffness: 120, mass: 0.8 }, durationInFrames: SWITCH_FRAMES * 2 });
  const p = sw.pip ? raw : 1 - raw;                       // 0 = 풀, 1 = PIP
  const scale = interpolate(p, [0, 1], [1, PIP.w / W]);
  const x = interpolate(p, [0, 1], [0, PIP.x]);
  const y = interpolate(p, [0, 1], [0, PIP.y]);
  const radius = interpolate(p, [0, 1], [0, PIP.radius]) / scale;
  const shadow = p > 0.05 ? SH.deep : "none";
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: "0 0", borderRadius: radius, overflow: "hidden", boxShadow: shadow, backgroundColor: "#000" }}>
      {TL.segments.map((s, i) => (
        <Sequence key={i} from={s.outStartFrame} durationInFrames={s.frames} layout="none">
          <Segment index={i} srcFrom={s.srcStartFrame} frames={s.frames} full={1 - p} />
        </Sequence>
      ))}
    </div>
  );
};

/** 얼굴 풀 구간의 점프컷 은폐: 세그먼트마다 1.0 / 1.04 펀치인 교대 (PIP일 땐 0) */
const Segment: React.FC<{ index: number; srcFrom: number; frames: number; full: number }> = ({ index, srcFrom, frames, full }) => {
  const punch = 1 + (index % 2 === 1 ? 0.04 : 0) * full;
  return (
    <AbsoluteFill style={{ transform: `scale(${punch})`, transformOrigin: "50% 45%" }}>
      <OffthreadVideo src={staticFile("src/talk.mp4")} trimBefore={srcFrom} trimAfter={srcFrom + frames} style={{ width: W, height: H, objectFit: "cover" }} />
    </AbsoluteFill>
  );
};
