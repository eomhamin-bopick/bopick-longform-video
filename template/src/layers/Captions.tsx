import { interpolate, useCurrentFrame } from "remotion";
import { TL, isPip, sceneAt } from "../lib/data";
import { C, CAPTION, FONT } from "../theme/store";

/** 문장 2줄 자막 — 잉크 박스 위 흰 글자 700, 키워드 1어절만 800 + 코랄. 어절 균형 줄바꿈은 빌드 단계(timeline.json)에서 확정. */
export const Captions = () => {
  const frame = useCurrentFrame();
  const cue = TL.captions.find((c) => frame >= c.start && frame < c.end);
  if (!cue) return null;
  const local = frame - cue.start;
  const op = interpolate(local, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const ty = interpolate(local, [0, 5], [8, 0], { extrapolateRight: "clamp" });
  const pip = isPip(sceneAt(frame).layout);
  const centerX = pip ? CAPTION.centerXWithPip : CAPTION.centerX;
  const size = cue.text.length > 30 ? CAPTION.sizeLong : CAPTION.size;
  return (
    <div style={{ position: "absolute", left: centerX, bottom: CAPTION.bottom, transform: `translateX(-50%) translateY(${ty}px)`, opacity: op, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {cue.lines.map((line, i) => (
        <div key={i} style={{ fontFamily: FONT, fontWeight: 700, fontSize: size, lineHeight: 1.3, color: C.white, background: "rgba(23,23,25,0.86)", padding: "10px 30px", borderRadius: 14, letterSpacing: -0.6, whiteSpace: "nowrap", wordBreak: "keep-all" }}>
          <Highlight line={line} keyword={cue.keyword} />
        </div>
      ))}
    </div>
  );
};

const Highlight: React.FC<{ line: string; keyword: string | null }> = ({ line, keyword }) => {
  if (!keyword) return <>{line}</>;
  const at = line.indexOf(keyword);
  if (at < 0) return <>{line}</>;
  return (<>{line.slice(0, at)}<span style={{ color: C.coral, fontWeight: 800 }}>{keyword}</span>{line.slice(at + keyword.length)}</>);
};
