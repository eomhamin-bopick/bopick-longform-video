import { continueRender, delayRender, staticFile } from "remotion";
// Pretendard Variable 로컬 로드 — 로드 전 렌더 금지(대체 폰트로 조용히 렌더되는 함정 4 방지)
let started = false;
export const loadPretendard = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("Pretendard Variable");
  const face = new FontFace("Pretendard Variable", `url(${staticFile("fonts/PretendardVariable.woff2")}) format("woff2")`, { weight: "45 920" });
  face.load().then((f) => { document.fonts.add(f); continueRender(handle); }).catch((e) => { console.error("font load failed", e); continueRender(handle); });
};
