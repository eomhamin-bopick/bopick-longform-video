# v1.1 디벨롭 레이어를 `bopick-video-production`(담당자 포크)에 머지하기

담당자 스킬은 v1.0에서 갈라져 모션 21종·UIMocks·`captions-manual.txt`·`EpisodeGraphicOnly`를 추가한 상태다. v1.1은 **파일 추가 + 소수 패치**라 그 확장과 충돌하지 않는다. 아래 순서대로 복사한다(예상 30분).

## 1. 그대로 복사(신규 파일)
| 파일 | 역할 |
|---|---|
| `references/develop-hook-readability.md` | 훅·가독성·리듬·사운드·엔딩 규칙 |
| `references/higgs-playbook.md` | Higgs 확장 지도(영상 B-roll·레퍼런스 분석·썸네일·쇼츠·캐릭터·배경제거) |
| `scripts/develop-audit.mjs` | 채점 + 훅 비트 제안 (`node scripts/develop-audit.mjs`) |
| `template/src/motions/Develop.tsx` | coldOpen · chapterCard · keywordChip · recapCard · promiseCard |
| `template/src/layers/Sfx.tsx` | 모션별 효과음 자동 매핑 + BGM 슬롯 |
| `docs/example-develop-plan-planner-ep1.md` | 2편("억대 연봉 3가지 습관")에 적용할 구체안 |

## 2. 패치(기존 파일, diff 작음)
1. `motions/index.tsx` — `import { ColdOpen, KeywordChip, RecapCard, PromiseCard } from "./Develop";` + 레지스트리에 `coldOpen, keywordChip, recapCard, promiseCard` 등록. (21종 그대로 유지)
2. `theme/store.ts` — 끝에 `END`(엔드스크린 rect)와 `READ`(가독성 상수) 추가.
3. `lib/data.ts` — `Scene`에 `chapterCard?`, `endScreen?`; `Timeline`에 `prerollFrames?`, `audio?`; `LAYOUT_SWITCHES`를 `{frame, mode}`(full/pip/hidden/end)로 교체하고 `lastSwitch`가 `{mode, prev, isFirst}`를 돌려주게. (v1.1 파일 통째로 교체 가능 — 담당자 쪽 변경이 없다면)
4. `layers/TalkingHead.tsx` — v1.1 파일로 교체(모드 4종 rect 보간, 프리롤 오프셋, 펀치인 3단 교대).
5. `layers/GraphicsLayer.tsx` — `ChapterCard` import, stage 모드 `SceneBeats` 맨 앞에 `scene.chapterCard` 45프레임 Sequence.
6. `layers/SceneTitle.tsx` — `if (scene.chapterCard && frame < 45) return null;`
7. `layers/Captions.tsx` — 키워드 span `fontSize:"1.15em"`, `endScreen` 씬이면 자막 중심 `END.x + END.w/2`.
8. `Episode.tsx` — 기존 인라인 `Sfx`를 지우고 `import { Sfx } from "./layers/Sfx"`.
9. `scripts/build-timeline.mjs` — v1.1로 교체. 바뀐 점: `hook.coldOpen` 프리롤(모든 out 프레임에 `PREROLL` 가산), 자막 큐 3.5s 분할, `timeline.prerollFrames/audio` 출력. **담당자의 `captions-manual.txt` 흐름은 자막 큐 생성 뒤 텍스트를 덮어쓰는 방식이면 그대로 동작**(큐 분할로 큐 수가 늘어날 수 있으니 `//` 구분 수를 재확인).
10. `EpisodeGraphicOnly.tsx`(담당자 파일) — `TalkingHead`를 안 쓰므로 영향 없음. 단 `Sfx`를 넣고 싶으면 같은 한 줄 추가.

## 3. 데이터(scenes.json)에 추가하는 것
```jsonc
"hook": { "coldOpen": { "sec": 5, "cards": [ {"value":"1시간→5분","label":"전산 야근"}, {"value":"20개","label":"일일이 로그인하던 전산"}, {"value":"1~2시간","label":"하루 14시간 중 고객 만나는 시간"} ] } },
"audio": { "sfx": true, "bgm": "bgm-light.mp3", "bgmVolume": 0.1 },
"captionStyle": { ..., "maxCueSec": 3.5 },
// 씬: "chapterCard": {"index":1,"total":3,"title":"실시간 배차"} · 마지막 씬 "endScreen": true
// 비트: promiseCard · keywordChip · recapCard
```
`public/sfx/` 에 pop·tick·whoosh·check·ding·tap.mp3, `public/audio/bgm-light.mp3`(선택). 없으면 `audio.sfx:false`.

## 4. 순서
```bash
node scripts/build-timeline.mjs && node scripts/develop-audit.mjs   # 점수 ≥80 될 때까지 scenes.json 보강
node scripts/stills.mjs --frame=30,<챕터카드 프레임>,<엔드스크린 프레임>
npx remotion render ...
```
## 5. 충돌 가능 지점
- 담당자가 `TalkingHead.tsx`/`data.ts`를 수정했다면 v1.1 교체 대신 위 3·4번 diff만 손으로 옮긴다.
- `incomeGapStack` 기본 문구 하드코딩(핸드오프 §9)은 v1.1에서도 `data` prop 우선이므로 그대로 두어도 되지만, 기본값을 빈 문자열로 바꾸는 편이 안전하다.
