import timeline from "../../data/timeline.json";
export type Motion = { type: string; data: any } | null;
export type Beat = { from: number; to: number; motion: Motion; broll?: { asset: string; kenBurns?: boolean }; anchor: any };
export type Layout = "face-main" | "graphic-pip" | "graphic-only";
export type Scene = { id: string; title: string; layout: Layout; from: number; to: number; beats: Beat[]; spine?: { index: number; total: number } | null; character?: { pose: string; at: number } | null; keywords: string[]; outro?: { lockup: boolean; seconds: number } };
export type Cue = { text: string; lines: string[]; start: number; end: number; keyword: string | null };
export type Segment = { srcStart: number; srcEnd: number; srcStartFrame: number; outStartFrame: number; frames: number };
export type Timeline = { fps: number; width: number; height: number; outFrames: number; segments: Segment[]; scenes: Scene[]; captions: Cue[]; creditStyle: any; captionStyle: any };
export const TL = timeline as unknown as Timeline;
export const sceneAt = (f: number): Scene => TL.scenes.find((s) => f >= s.from && f < s.to) ?? TL.scenes[TL.scenes.length - 1];
export const isPip = (layout: Layout) => layout !== "face-main";
/** 레이아웃이 바뀌는 프레임 목록 (전환 스프링 기준점) */
export const LAYOUT_SWITCHES: { frame: number; pip: boolean }[] = TL.scenes.reduce((acc, s, i) => {
  const pip = isPip(s.layout);
  if (i === 0 || pip !== isPip(TL.scenes[i - 1].layout)) acc.push({ frame: s.from, pip });
  return acc;
}, [] as { frame: number; pip: boolean }[]);
export const lastSwitch = (f: number) => { let cur = LAYOUT_SWITCHES[0]; for (const s of LAYOUT_SWITCHES) if (s.frame <= f) cur = s; return cur; };
