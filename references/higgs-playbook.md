# Higgsfield 활용 지도 (v1.1)

| 용도 | 도구 | 규칙 |
|---|---|---|
| 상황 B-roll **영상** 5~8초 | `generate_video` (이미지→영상: 먼저 `generate_image` nano_banana_pro로 키프레임 → `kling3_0_turbo`/`seedance_2_0` 카메라 무빙) | 훅 상황 컷(퇴근길 차 안, 밤 사무실 전산)에만. `get_cost:true` 선확인, 배치 제출 → `jobs_wait`. 프롬프트에 브랜드 톤 문구 + no text/no faces. 세그먼트보다 1초 길게 뽑아 자름. `broll.video:"higgs-xx.mp4"` |
| 레퍼런스 떡상 영상 분석 | `video_analysis_create({youtube_url})` → `video_analysis_status` 폴링(3~5분) | 결과를 `data/higgs-notes/<videoId>.json` `{summary, hookVisual, editingPattern, captionStyle, signatureTechniques[], scenes[]}`로 저장 → Phase 2 원고 분석 프롬프트에 주입(훅 구조·컷 리듬 차용). 짧은 영상일수록 정확 |
| 썸네일 | `get_workflow_instructions({workflow:"thumbnail-generation"})` 로드 후 진행 | 후보 4장 → 고른 문구를 `hook.coldOpen.cards`·`promiseCard.text`에 그대로(클릭 전후 기대 일치). 한글은 이미지에 넣지 않고 Remotion `Still`로 얹는다 |
| 쇼츠 파생 3개 | `reframe`(16:9→9:16) + `shorts_studio_create` | 오딧 `suggestions`·훅 구간·수치 비트 중심으로 30~45초 3구간. 자막은 세로용 1줄 52px |
| 캐릭터 포즈 확장 | `get_workflow_instructions({workflow:"character-sheet"})` + `image_references` | 기존 포즈 PNG를 레퍼런스로 새 포즈(흰 배경 요청) → `scripts/keyout.py white` |
| 배경 제거 | `remove_background` | keyout.py로 안 될 때(그라데이션·머리카락) |
| 업스케일 | `upscale_image`(2k→4k) / `upscale_video` | 썸네일·풀블리드 B-roll |
| 자기 초안 분석 | `video_analysis_create`에 자기 렌더 업로드(`media_upload`) | 씬 단위 요약으로 "지루한 구간" 교차 확인(오딧 보조) |

원칙: 생성물은 항상 로컬 저장 후 `staticFile` · 한글 텍스트는 절대 생성하지 않음 · 실패 시 같은 프롬프트 재시도 · 크레딧 사용량을 제작 로그에 기록.
