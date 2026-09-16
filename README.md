# bopick-longform-video

촬영한 **토킹헤드 영상**을 브랜드 톤 그래픽·얼굴 PIP·싱크 자막이 얹힌 **유튜브 롱폼**으로 만드는 Claude Code 스킬.
2026-09 보픽스토어 "3가지 보험" 편(6:15)에서 확립한 파이프라인을 그대로 담았다.

- 전사(단어 타임스탬프) → 침묵·리테이크 자동 컷 → 문장 2줄 + 키워드 자막 → 씬 매니페스트(문장 번호 앵커) → Remotion 조립 → 스틸 게이트 → mp4 + SRT
- 원칙: **타임코드가 진실이고 화면은 거기에 붙는다.** 씬은 초가 아니라 문장 번호에 앵커해서 컷이 바뀌어도 안 깨진다.

## 설치
```bash
git clone https://github.com/shinsehoon1998/bopick-longform-video.git ~/.claude/skills/bopick-longform-video
```
Claude Code에서 "촬영본으로 유튜브 롱폼 만들어줘" 라고 하면 스킬이 활성화된다.

## 필요한 것
- Node 20+ · ffmpeg(PATH 또는 `FFMPEG=/path`) · Python 3 + Pillow(캐릭터 키잉)
- ElevenLabs API 키(전사) · Higgsfield MCP(B-roll·캐릭터 생성, 선택)
- Pretendard Variable woff2(OFL): https://github.com/orioncactus/pretendard → `public/fonts/`
- 브랜드 캐릭터 PNG·마크·효과음은 저장소에 포함하지 않는다(브랜드 자산). 사내 `bopick` 리포에서 가져온다.

## 구조
```
SKILL.md              스킬 본문(절차 8단계 · 변경 워크플로우 · 함정)
references/           interview(객관식 12문항) · motions(신호→모션 15종) · manifest(스키마) · brand-tokens · gates · lessons
scripts/              normalize.sh · transcribe.sh · sentences.mjs · cuts.mjs · build-timeline.mjs · stills.mjs · check.mjs · srt.mjs · keyout.py
template/             Remotion 프로젝트(src/ 레이어·모션·테마, package.json, tsconfig, remotion.config)
examples/             scenes.3insurance.json — 9씬 28비트 실제 매니페스트
docs/workflow.md      한 장 요약
```

## 새 에피소드 시작
```bash
cp -R ~/.claude/skills/bopick-longform-video/template ~/videos/<episode> && cd ~/videos/<episode>
cp -R ~/.claude/skills/bopick-longform-video/scripts ./scripts && npm install
scripts/normalize.sh <촬영본.mov>            # public/src/talk.mp4
scripts/transcribe.sh <촬영본.mov> kor        # data/words.raw.json
node scripts/sentences.mjs                    # data/sentences.json
# scenes.json 작성(examples 참고) → node scripts/cuts.mjs → node scripts/build-timeline.mjs
node scripts/stills.mjs && npx remotion render src/index.ts Episode out/final.mp4 --codec=h264 --crf=18
node scripts/check.mjs && node scripts/srt.mjs
```

## 라이선스
MIT. Pretendard는 SIL OFL 1.1(별도 다운로드).
