import { Img, staticFile } from "remotion";
import { C, R } from "../theme/store";
/** 좌상단 락업 — [핀이 블루 스퀘어 마크] 보픽스토어 (접미어만 코랄 글자, 캠페인 락업 규칙) */
export const Lockup = () => (
  <div style={{ position: "absolute", left: 40, top: 34, display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.86)", borderRadius: R.pill, padding: "8px 16px 8px 10px" }}>
    <Img src={staticFile("brand/bopick-mark.png")} style={{ width: 28, height: 28, borderRadius: 7 }} />
    <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.6, color: C.ink, lineHeight: 1 }}>보픽<span style={{ color: C.coralInk }}>스토어</span></span>
  </div>
);
