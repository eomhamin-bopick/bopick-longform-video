import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, R, SH } from "../theme/store";
import { Card, MP } from "./shared";

/** 카톡 상담 예시 — Higgs 폰 장면 위에 화면 패널(생성된 빈 말풍선을 덮음) + Remotion 말풍선 + "예시 화면" 배지.
 *  screenRect/imageSize/rotation/headerH(이미지 px)는 scenes.json에서. 없으면 코드 폰 프레임 폴백 */
export const PhoneScene: React.FC<MP> = ({ data, compact }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200, mass: 0.7 } });
  const boxW = compact ? 580 : 900, boxH = 600;
  const bubbles: { side: string; text: string; at: number }[] = data.overlayBubbles ?? [];
  const parentFrom = data.parentFrom ?? 0;
  const sr = data.screenRect, img = data.imageSize, rot = data.rotation ?? 0, headerH = data.headerH ?? 0;
  const hasImg = !!data.asset && !!sr && !!img;
  let scale = 1, imgLeft = 0, imgTop = 0, panel = { x: 0, y: 0, w: 0, h: 0 };
  if (hasImg) {
    scale = Math.min((boxW - 60) / sr.w, boxH / sr.h);
    imgLeft = boxW / 2 - (sr.x + sr.w / 2) * scale;
    imgTop = -sr.y * scale;
    panel = { x: imgLeft + sr.x * scale + 6, y: imgTop + (sr.y + headerH) * scale, w: sr.w * scale - 12, h: (sr.h - headerH) * scale };
  }
  const bubbleList = (
    <>
      {bubbles.map((b, i) => {
        const p = spring({ frame: frame - Math.max(0, b.at - parentFrom), fps, config: { damping: 13, stiffness: 150 } });
        const me = b.side === "me";
        return (
          <div key={i} style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: "88%", padding: "9px 13px", borderRadius: 16, background: me ? "#FEE500" : C.white, color: C.ink, fontSize: 18, fontWeight: 500, lineHeight: 1.35, whiteSpace: "pre-line", wordBreak: "keep-all", boxShadow: SH.card, transform: `scale(${p})`, transformOrigin: me ? "right bottom" : "left bottom", opacity: p }}>{b.text}</div>
        );
      })}
    </>
  );
  return (
    <div style={{ position: "relative", width: boxW, height: boxH, opacity: enter, transform: `translateY(${(1 - enter) * 30}px)`, overflow: "hidden", borderRadius: R.card }}>
      {hasImg ? (
        <>
          <Img src={staticFile(`assets/${data.asset}`)} style={{ position: "absolute", left: imgLeft, top: imgTop, width: img.w * scale, height: img.h * scale }} />
          <div style={{ position: "absolute", left: panel.x, top: panel.y, width: panel.w, height: panel.h, transform: `rotate(${rot}deg)`, transformOrigin: "50% 0%", background: "rgba(246,246,248,0.97)", padding: 12, display: "flex", flexDirection: "column", gap: 9, borderRadius: 4 }}>{bubbleList}</div>
        </>
      ) : (
        <div style={{ position: "absolute", left: (boxW - 330) / 2, top: 10, width: 330, height: 580, borderRadius: 44, background: C.ink, boxShadow: SH.deep, padding: 12 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 34, background: "#F5F5F7", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 54, background: "#FEE500", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: C.ink }}>보픽 상담</div>
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 9 }}>{bubbleList}</div>
          </div>
        </div>
      )}
      {data.badge && <div style={{ position: "absolute", left: 12, top: 12, background: "rgba(255,255,255,.92)", color: C.muted, fontSize: 16, fontWeight: 700, padding: "5px 12px", borderRadius: R.pill, border: `1px solid ${C.line}` }}>{data.badge}</div>}
    </div>
  );
};

/** 30초 카운트다운 — 코랄 링 + 숫자, 아래 "고정댓글 ↓" 바운스 */
export const Countdown: React.FC<MP> = ({ data, compact, dur }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const runF = Math.min(Math.round(3 * fps), Math.max(1, dur - 20));
  const t = interpolate(frame, [4, 4 + runF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const n = Math.round(interpolate(t, [0, 1], [0, data.from ?? 30]));
  const size = compact ? 300 : 360, r = size / 2 - 18, circ = 2 * Math.PI * r;
  const pop = spring({ frame, fps, config: { damping: 13, stiffness: 120 } });
  const bounce = Math.abs(Math.sin((frame / fps) * Math.PI * 1.4)) * 10;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, transform: `scale(${pop})` }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} stroke={C.coralLine} strokeWidth={18} fill={C.white} />
          <circle cx={size / 2} cy={size / 2} r={r} stroke={C.coral} strokeWidth={18} fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - t)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: compact ? 104 : 128, fontWeight: 900, color: C.coral, lineHeight: 1, fontVariantNumeric: "tabular-nums", letterSpacing: -4 }}>{n}</span>
          <span style={{ fontSize: compact ? 22 : 26, fontWeight: 700, color: C.body }}>초 안에 상담</span>
        </div>
      </div>
      <Card style={{ padding: "12px 26px", transform: `translateY(${bounce}px)`, background: C.ink }}>
        <span style={{ fontSize: compact ? 30 : 36, fontWeight: 800, color: C.white }}>{data.arrow ?? "고정댓글 ↓"}</span>
      </Card>
    </div>
  );
};
