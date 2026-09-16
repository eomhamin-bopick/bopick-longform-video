---
name: bopick-longform-video
description: 촬영한 토킹헤드 영상(iPhone 등)을 유튜브 롱폼으로 완성하는 파이프라인. 전사(단어 타임스탬프) → 침묵·리테이크 자동 컷 → 문장 2줄+키워드 자막 싱크 → 원고 분석 기반 연출 추천(객관식) → 씬 매니페스트(문장 번호 앵커) → 보픽 브랜드 톤 모션 그래픽·얼굴 PIP·캐릭터·Higgs B-roll을 Remotion으로 조립·렌더 → 스틸/게이트 검수 → mp4+SRT. Use when the user wants to edit recorded talking-head footage into a YouTube long-form with synced subtitles and explainer graphics, mentions Remotion/Higgsfield/자막 싱크/PIP/보픽 영상, or asks to re-render or change a scene of an existing episode. Korean triggers — 유튜브 롱폼 만들어줘, 촬영본 편집, 자막 싱크 맞춰줘, 리모션 렌더, 보픽 영상, 연출 화면 넣어줘, N번 장면 바꿔줘.
metadata:
  origin: 보픽(솔팅) · 2026-09-16 "3가지 보험" 편에서 확립
  version: 1.0
---

# bopick-longform-video — 토킹헤드 촬영본 → 브랜드 톤 유튜브 롱폼 (Remotion)

> 한 줄 원칙: **타임코드가 진실이고 화면은 거기에 붙는다.** 촬영 음성의 단어 타임스탬프가 모든 것의 기준이며, 씬은 초가 아니라 **문장 번호**에 앵커한다(컷을 바꿔도 씬이 안 깨진다).
> 페이스리스(TTS) 파이프라인이 아니다. 출연자가 말하는 촬영본이 입력이다. TTS 롱폼은 `subtract-tube/yt-render`를 쓴다.

## When to activate
- 촬영본(mov/mp4)을 주고 "유튜브 롱폼으로 만들어줘 / 자막·연출 넣어줘 / 편집해줘"
- 기존 에피소드의 장면 교체·순서 변경·자막 수정·재렌더 요청
- 다른 브랜드 톤으로 같은 워크플로우를 돌리는 요청(테마 파일만 교체)

## 입력
| 입력 | 필수 | 비고 |
|---|---|---|
| 촬영본 1개(가로 16:9 권장, HEVC/HDR 가능) | ✅ | Step 0에서 H.264 SDR로 정규화 |
| 브랜드 톤(보픽스토어/보픽플래너/기타) | ✅ | 인터뷰로 결정. `template/src/theme/store.ts` |
| 촬영 원고 | 선택 | 있으면 글자는 원고, 타이밍은 STT |
| 캐릭터 PNG·앱 캡처·표 데이터 | 선택 | 없으면 Higgs 생성 또는 코드 모션으로 대체 |

## 절차 (순서 엄수 — 중간부터 손대지 않는다)

### Phase 0 — 객관식 인터뷰 (AskUserQuestion, 4문항×3라운드)
`references/interview.md`의 12문항을 그대로 쓴다. 추천안은 첫 옵션에 "(Recommended)". 사용자가 "Other"로 덧붙인 요청을 끝까지 읽는다.
**전사 결과를 본 뒤 톤을 재확인**한다: 내용이 소비자 대상이면 보픽스토어(코랄·보둥이), 설계사 대상이면 보픽플래너(민트·핀이). `references/brand-tokens.md`.

### Phase 1 — 전사
```bash
scripts/transcribe.sh <video.mov> kor      # → data/words.raw.json (ElevenLabs Scribe v1, 단어 타임스탬프)
node scripts/sentences.mjs                 # → data/sentences.json (문장 번호 = 씬 앵커)
```
- ElevenLabs MCP `speech_to_text`는 단어 타임스탬프를 안 주고 `~/Desktop` 아래 파일만 받는다 → REST 직접 호출이 정석. 키는 셸 env 또는 `~/.claude.json` mcpServers.elevenlabs.env.
- 전사는 사용자 승인 후 실행(과금). 7분 한국어 ≈ 소액.

### Phase 2 — 원고 분석 → 연출 추천 (필수, 매 편)
`sentences.json`을 읽고 `references/motions.md`의 6가지 신호(수치·열거·대립·인과/순서·인용/출처·상황묘사)로 문장을 태깅 → 챕터(담화 표지: "첫 번째는", "정리하겠습니다", "자,") → **챕터×모션×소재×근거 문장 표**를 만들어 객관식으로 채택 여부를 묻는다. 채택된 것만 매니페스트에 넣는다.
리테이크(같은 구절 반복)와 의도된 반복(따라 읽기·리캡)을 여기서 구분해 두고, 의도된 반복은 `cuts.whitelistSentences`에 넣는다.

### Phase 3 — 씬 매니페스트 `data/scenes.json`
`references/manifest.md` 스키마. 예시: `examples/scenes.3insurance.json`(9씬 28비트).
- `layout`: `face-main`(얼굴 풀 + 우측 오버레이) | `graphic-pip`(그래픽 무대 + 얼굴 카드 PIP)
- 훅·호응·CTA = face-main, 정보 설명 = graphic-pip 가 기본.
- 비트 `anchor.fromSentence/toSentence`만 적는다. 초 단위 금지.
- 게이트: 씬 수 == 계획, 모든 문장이 정확히 한 씬에, 같은 motion.data 두 번 금지.

### Phase 4 — 정규화 · 컷 · 타임라인 · 자막
```bash
scripts/normalize.sh <video.mov> public/src/talk.mp4   # Step 0 (HEVC HLG → H.264 SDR bt709, -16 LUFS)
node scripts/cuts.mjs           # 침묵 ≥0.7s(0.25s 유지, 문장 끝 0.4s) + 리테이크(쉼표 조각 + 6단어 창 2어절 반복 → 앞 테이크 제거) → data/cuts.json
node scripts/build-timeline.mjs # 세그먼트·씬·비트·자막 큐(문장 병합→34폭 분할→6자 꼬리 흡수→2줄 균형) → data/timeline.json + 게이트 출력
```
컷 리스트는 사용자에게 보여 주고 거부는 `approved:false`. 리테이크 후보를 **반드시 눈으로 확인**한다(문장 종결 없이 쉼표로 끊긴 조각만 진짜 리테이크).

### Phase 5 — 소재
- Higgs 이미지: `nano_banana_pro` 16:9, 프롬프트에 **no text / no letters / no faces** + 브랜드 톤 문구(`references/brand-tokens.md` §프롬프트). 배치 제출 → `jobs_wait` → 로컬 저장 → `staticFile`. 이미지 안 한글은 절대 생성하지 않는다(깨짐). 텍스트는 Remotion이 얹는다.
- 캐릭터 PNG 배경 제거: `python3 scripts/keyout.py in.png out.png blue|white`. 새 포즈는 기존 포즈를 `image_references`로 Higgs 생성(흰 배경 요청).
- 정직성: 실캡처가 아닌 화면엔 "예시 화면" 배지, 외부 데이터·인용 카드엔 우하단 출처 크레딧(18px·45%). 캡처처럼 보이게 만들지 않는다.

### Phase 6 — Remotion 조립
`template/`를 `~/클로드코드/bopick/video/<episode>/`로 복사 → `npm install` → `public/`에 talk.mp4·fonts/PretendardVariable.woff2(OFL, github.com/orioncactus/pretendard)·assets·bodung·sfx 배치.
레이어(아래→위): 배경 → 무대 그래픽 → 토킹헤드(컷 세그먼트=Sequence, 풀↔PIP 스프링) → 오버레이 그래픽 → 스파인 → 캐릭터 → 자막 → 락업 → 효과음. 모션 카탈로그 15종은 `references/motions.md`.

### Phase 7 — 검수 (렌더 전 필수)
```bash
node scripts/stills.mjs                 # 씬/비트별 스틸 → out/stills/ (--frame=2,15 로 특정 프레임)
npx remotion render src/index.ts Episode out/preview.mp4 --frames=A-B   # 레이아웃 전환 구간 부분 렌더
```
스틸을 **직접 본다**(폰트 굵기 800 실제 렌더 여부, 겹침, 빈 무대, 코랄 면적 규칙). `references/gates.md` 체크리스트.

### Phase 8 — 렌더 · SRT · 전달
```bash
npx remotion render src/index.ts Episode out/final.mp4 --codec=h264 --crf=18 --concurrency=6
node scripts/check.mjs out/final.mp4    # 길이 ±0.5s · 트랙 · 스팟 프레임
node scripts/srt.mjs                    # out/final.ko.srt — 컷 후 타임코드
```
산출물: mp4 + srt + 제작 로그(게이트 결과·사람이 볼 검수 포인트). **업로드 공개 버튼은 자동화하지 않는다.**

## 바꿀 때
| 바뀌는 것 | 고치는 곳 | 다시 |
|---|---|---|
| 장면·모션 데이터 | `data/scenes.json` | build-timeline → stills(그 씬) → render |
| 컷 거부/추가 | `data/cuts.json` approved | build-timeline → render |
| 자막 오탈자 | `data/words.raw.json` 텍스트만 | cuts → build-timeline → render |
| 톤 | `src/theme/*.ts` | stills 전체 → render |
| 재촬영 | Phase 1부터 전부 |
"3번 장면을 바꿔 줘" 식 지시 → JSON 수정 → 개수·중복 게이트 → 그 씬 스틸 2장 보여 주고 승인 후 렌더.

## 함정 (한 번씩 밟은 것) — `references/lessons.md`
HEVC 10-bit HLG는 Remotion이 못 읽음 · 리테이크 탐지는 쉼표 조각 조건 없이는 오탐 · 화이트리스트는 씬이 아니라 문장 범위로 · 비트 안 useCurrentFrame은 로컬이므로 절대 프레임 데이터엔 `parentFrom` 주입 · 첫 레이아웃은 스프링 없이 고정 · 카운트다운은 나레이션 방향과 일치 · 생성 이미지의 "빈 우측" 요청은 띠 아티팩트를 만들 수 있음(크롭으로 해결).
