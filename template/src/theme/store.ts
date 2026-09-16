// 보픽스토어 톤 — brand-guide.md §4~§10 을 영상 토큰으로 옮김 (설계서 §4)
export const W = 1920;
export const H = 1080;
export const FONT = '"Pretendard Variable", "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
export const C = {
  canvas: "#F7F7F8", blueTint: "#EAF2FE", blue200: "#C9DEFE", blue90: "#69A5FF",
  blue: "#0066FF", blueHover: "#005EEB", blueDeep: "#0047B3",
  coral: "#FF6A45", coralHover: "#FF5A33", coralInk: "#D93D1A", coralLine: "#FFD9CF", coralTint: "#FFF1EC",
  ink: "#171719", body: "#37383C", muted: "#70737C", line: "#DBDCDF", n30: "#EBEBED", white: "#FFFFFF", amber: "#FF9200",
} as const;
export const R = { card: 20, btn: 14, pill: 999, input: 12 } as const;
export const SH = {
  card: "0 4px 12px rgba(23,23,25,.08)",
  deep: "0 12px 32px rgba(23,23,25,.14)",
  coral: "0 8px 20px -8px rgba(255,106,69,.55)",
} as const;
export const PIP = { w: 512, h: 288, x: 1360, y: 744, radius: 20 } as const;
export const STAGE = { x: 120, y: 96, w: 1680, h: 610 } as const;      // graphic-pip 모션 무대 (PIP 위쪽)
export const OVERLAY = { x: 1300, y: 110, w: 580, h: 600 } as const;   // face-main 우측 오버레이 컬럼
export const BODUNG = { x: 24, y: 740, size: 280 } as const;
export const CAPTION = { bottom: 58, size: 44, sizeLong: 38, centerX: 960, centerXWithPip: 800 } as const;
