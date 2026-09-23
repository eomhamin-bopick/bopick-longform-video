# 브랜드 톤 → 영상 토큰 (`template/src/theme/store.ts`)

## 보픽스토어 (소비자 대상) — 기본 테마
"보픽 블루 위에, 보둥이 코랄로 부른다." 바탕·구조·신뢰 = 블루, 행동·강조·수치 = 코랄. 민트 금지. 밝고 가볍게(다크 아님).
| 역할 | HEX | 영상에서 |
|---|---|---|
| 캔버스 / 블루 틴트 | #F7F7F8 / #EAF2FE | 그래픽 배경 라디얼 |
| 블루 / 호버 | #0066FF / #005EEB | 다이어그램·스파인 활성·2차 강조 |
| 코랄 / 코랄 글자 | #FF6A45 / #D93D1A | 수치·자막 키워드(잉크 박스 위)·CTA / 밝은 카드 위 코랄 텍스트 |
| 코랄 틴트·선 | #FFF1EC / #FFD9CF | 강조 카드 바탕·테두리 |
| 잉크 / 본문 / 보조 | #171719 / #37383C / #70737C | 헤드라인·자막 박스(.86) / 본문 / 크레딧 |
| 앰버 | #FF9200 | 완료 체크 1곳만 |
규칙: 화면당 코랄 강조 1 + 알약 1. 자막 키워드는 큐당 1어절(굵기 800 + 코랄).
서체 Pretendard Variable — 헤드 800 / 본문 500 / 숫자 900 tabular. keep-all. 자막 44px(30자 초과 38px).
곡률 카드 20 · 버튼 14 · 알약 999. 그림자 카드 0 4 12 rgba(23,23,25,.08), 코랄 CTA 0 8 20 -8 rgba(255,106,69,.55).
모션: 진입 spring damping 200 · 카드 spring(.34,1.56,.64,1) 14f · 캐릭터 둥둥 5.5s · 전환 fade 8f · 풀↔PIP 스프링 14f.
캐릭터 보둥이: wave(훅) · think(질문) · notify(경고) · cheer(CTA) · hug(엔딩). 씬당 1회, 좌하단 280px.
락업: 마크 28px + "보픽" 잉크 + "스토어" 코랄 글자.

## 보픽플래너 (설계사 대상) 로 바꿀 때
> ⚠️ 2026-09-16 정정: 이전 버전은 "코랄→민트"로 적혀 있었으나 틀렸다. **보픽플래너는 블루 계열, 보픽스토어는 코랄 계열**이 맞다(팀 확인).

플래너는 코랄/민트 같은 별도 강조색을 쓰지 않고 **블루 하나로 통일**한다 — 구조색과 강조색이 모두 블루 계열(캔버스·틴트는 스토어와 동일, 강조 role만 코랄 대신 블루 자체나 더 진한 블루 톤 사용). 캐릭터 핀이(point/notify/cheer/think/phone/bye), 접미어 "플래너" 잉크.
> 정확한 강조용 블루 hex(예: #0066FF를 그대로 쓸지, 더 진한 별도 톤을 쓸지)는 이 문서 작성 시점 기준 확정되지 않았다. `theme/store.ts`에 반영하기 전에 팀에 정확한 값을 확인할 것 — 확인 없이 추측한 hex를 최종본에 박아 넣지 않는다.

## Higgs 프롬프트 톤 문구
"bright soft off-white canvas (#F7F7F8) with pale blue tint, glossy 3D-rendered illustration style consistent with a rounded mascot character, gentle studio light, single coral (#FF6A45) accent object only, no text, no letters, no logos, no human face close-up, 16:9" + 장면. "empty right third" 같은 여백 지시는 띠 아티팩트를 만들 수 있으니 결과를 보고 `broll.focus:"left"`로 크롭한다.
