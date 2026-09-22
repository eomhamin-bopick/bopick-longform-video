import timeline from "../../data/timeline.json";
export type Motion = { type: string; data: any } | null;
export type Beat = { from: number; to: number; motion: Motion; broll?: { asset: string; kenBurns?: boolean }; anchor: any };
export type Layout = "face-main" | "graphic-pip" | "graphic-only";
export type Scene = { id: string; title: string; layout: Layout; from: number; to: number; beats: Beat[]; spine?: { index: number; total: number } | null; character?: { pose: string; at: number } | null; keywords: string[]; outro?: { lockup: boolean; seconds: number }; chapterCard?: { index?: number; total?: number; title: string } | null; endScreen?: boolean };
export type Cue = { text: string; lines: string[]; start: number; end: number; keyword: string | null };
export type Segment = { srcStart: number; srcEnd: number; srcStartFrame: number; outStartFrame: number; frames: number };
export type Timeline = { fps: number; width: number; height: number; outFrames: number; prerollFrames?: number; segments: Segment[]; scenes: Scene[]; captions: Cue[]; creditStyle: any; captionStyle: any; audio?: { bgm?: string | null; bgmVolume?: number; sfx?: boolean } };
export const TL = timeline as unknown as Timeline;
export const sceneAt = (f: number): Scene => TL.scenes.find((s) => f >= s.from && f < s.to) ?? TL.scenes[TL.scenes.length - 1];
export const isPip = (layout: Layout) => layout !== "face-main";
/** 토킹헤드 모드: full(얼굴 풀) · pip(카드) · hidden(프리롤·그래픽 전용) · end(엔드스크린 좌측 카드) */
export type HeadMode = "full" | "pip" | "hidden" | "end";
export const modeOf = (s: Scene): HeadMode => s.layout === "graphic-only" ? "hidden" : s.endScreen ? "end" : isPip(s.layout) ? "pip" : "full";
/** 모드가 바뀌는 프레임 목록 (전환 스프링 기준점) */
export const LAYOUT_SWITCHES: { frame: number; mode: HeadMode }[] = TL.scenes.reduce((acc, s, i) => {
  const mode = modeOf(s);
  if (i === 0 || mode !== modeOf(TL.scenes[i - 1])) acc.push({ frame: s.from, mode });
  return acc;
}, [] as { frame: number; mode: HeadMode }[]);
export const lastSwitch = (f: number) => { let idx = 0; for (let i = 0; i < LAYOUT_SWITCHES.length; i++) if (LAYOUT_SWITCHES[i].frame <= f) idx = i; return { ...LAYOUT_SWITCHES[idx], prev: LAYOUT_SWITCHES[idx - 1]?.mode ?? LAYOUT_SWITCHES[idx].mode, isFirst: idx === 0 }; };
