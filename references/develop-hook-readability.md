# 디벨롭 레이어 — 훅 · 가독성 · 리듬 규칙 (v1.1, 2026-09-22)

> 근거: 담당자 2편("억대 연봉 3가지 습관", 6:40) 프레임 분석 + 객관식 인터뷰 12문항. 규칙은 `scripts/develop-audit.mjs`가 채점한다(빌드 후 렌더 전 필수).

## 1. 훅 (0~60초)
| 규칙 | 값 | 구현 |
|---|---|---|
| 콜드 오픈 | 본문의 결과 수치 카드 3장, 5초, 무음, 1.2s 간격 | `scenes.hook.coldOpen = {sec:5, cards:[{value,label,sub?}×3]}` → 프리롤 씬 자동 생성(`coldOpen`) |
| 첫 그래픽 | 나레이션 시작 후 ≤10초 | 첫 수치·키워드 문장에 `statCount`/`keywordChip` |
| 시각 변화 간격 | ≤12초(8~12초마다 1개) | 비트 시작·B-roll·모드 전환·컷 펀치인 중 하나. 오딧이 위반 구간 출력 |
| 약속 카드 | "끝까지 보시면 ~" 문장에 풀화면 | `promiseCard {text, count:3}` — 번호 카드는 비어 있고 본문에서 채워짐 |
| 자기소개 | 약속 뒤 | 원고 단계에서 순서 확인(재촬영 없이는 컷 순서 변경) |
| 심의 | 훅 문구는 단정 금지 | "반으로 줄이는 방법" → "사례에서 절반 가까이 줄어든 흐름". 필수 안내 블록은 CTA 뒤 |

## 2. 구조 안내
- 상단 스파인 유지(글자 24px, 활성 블루 글로우), 설명 씬마다 `chapterCard {index,total,title}` 1.5초(무대만 덮음, PIP·자막 유지).

## 3. 가독성
| 규칙 | 값 |
|---|---|
| 카드 폭 | 무대 폭의 60~85% (`READ.cardMinRatio`) |
| 최소 글자 | 본문 32px · 헤드 56px · 자막 44px(30자 초과 38px) |
| 어절 안 줄바꿈 | 금지 — `keep-all` + 카드 유형별 폭 상한(오딧 `overflow`) — `\n`으로 어절 경계 지정 |
| 자막 큐 | ≤3.5초(빌드가 단어 경계 분할), 2줄, 키워드 1어절 1.15배·800·코랄 |
| 정적 홀드 | 같은 비트 ≤8초. 넘으면 2단계(값 갱신·항목 추가·줌) 또는 비트 분할 |
| 카운트업 | 시작값이 의미를 깨면(0시간→) 값 고정 + 링/바 채움으로 |

## 4. 얼굴 구간 리듬
- 얼굴 메인 구간에서 6초 이상 오버레이 없으면 `keywordChip`(문장 키워드 1~3어절, 우측 컬럼) 자동 제안.
- 펀치인 1.0 / 1.04 / 1.06 교대(세그먼트별).

## 5. 사운드
- SFX 자동 매핑(`layers/Sfx.tsx`): 카드 pop · 수치 tick · 체크 check · 리캡 ding · 전환 whoosh · 칩 tap. 볼륨 0.22~0.28.
- BGM: `scenes.audio = {bgm:"bgm-light.mp3", bgmVolume:0.1}` → `public/audio/`. 나레이션 대비 −20~−22 LU 목표(볼륨 0.08~0.12). 콜드 오픈은 무음.
- 생성: ElevenLabs `text_to_sound_effects`(pop/tick/whoosh/ding/tap 1초 내외) · `compose_music`(90초 루프, 밝은 마림바/피아노, 드럼 없음). 파일명 고정.

## 6. 엔딩
- `recapCard {items[], conclusion}` → CTA → 마지막 15초 `endScreen:true` 씬: 얼굴은 좌측 카드(880×495), 우측·하단 비움(유튜브 엔드 요소 자리), 자막은 카드 아래 중앙.

## 7. 오딧 실행
```bash
node scripts/build-timeline.mjs && node scripts/develop-audit.mjs
```
점수 100 − (HIGH 12 · MED 6 · LOW 2). **80 미만이면 렌더하지 않는다.** `out/develop-audit.json`의 `suggestions`는 scenes.json beats에 그대로 붙여넣을 수 있는 훅 비트 초안.
