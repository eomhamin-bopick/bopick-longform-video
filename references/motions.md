# 연출 신호 → 모션 카탈로그

## 원고 신호 6종 (Phase 2 태깅)
| 신호 | 예 | 모션 |
|---|---|---|
| ⓐ 수치 | "월 30만 원", "100세", "30초" | statCount · ageTimeline · countdown |
| ⓑ 열거 | "세 가지", "하나·둘·셋" | numberCards · stepFlow · 스파인(scene.spine) |
| ⓒ 대립 | "자산 vs 비용", "예전 vs 지금" | eitherOr · generationTable(하이라이트) |
| ⓓ 인과·순서 | "순서가 바뀌면 → 공백" | flowchart · stepFlow |
| ⓔ 인용·출처 | "금감원이 경보를 냈다" | quoteCard(+실캡처는 real:true만) |
| ⓕ 상황 묘사 | "엄마 친구가 권해서" | broll(Higgs 이미지, Ken Burns) |
신호 밀도 높은 챕터 = graphic-pip, 공감·호응·행동유도 = face-main.

## 모션 15종 (`template/src/motions/`) — `{type, data}`
| type | data | 비고 |
|---|---|---|
| statCount | from,to,prefix,suffix,caption | 코랄 숫자 900, 0.9s 카운트업 |
| numberCards | cards[3], title?, revealByWord?, complete? | revealByWord면 빌드가 단어 시각으로 revealAt/pulseAt 채움. 오버레이=세로, 무대=가로 |
| eitherOr | a,b,reveal:"b",strike?,style?:"coinFlip" | b 공개 시각 = b의 첫 2글자 단어 시각(없으면 42%) |
| checklist | items[] | 12프레임 간격 순차 체크 |
| iconRow | items[] | 칩 3개 |
| keywordTypo | text("\n" 줄바꿈) | 어절 단위 팝, 단어 시각 있으면 그 시각 |
| speechBubble | text | 말풍선 |
| quoteCard | headline, body, source{text} | 좌측 코랄 바 + 크레딧 |
| ageTimeline | marker{label,pct}, bad{label}, good{label} 또는 emphasis:"long",label | 0→100세 지바 |
| incomeGapStack | base{label}, gap{label} | 블루 블록 위 코랄 블록 |
| stepFlow | steps[3], active, complete? | 활성 블루 글로우, 완료 앰버 ✓ |
| flowchart | bad[], good[] | "공백" 박스 코랄 빗금, "공백 0" 블루 |
| generationTable | title, columns[{key,label}], rows[], reveal:"rowByRow", rowGapFrames, source / keep:true + highlight[{row,col,color,label}], question{text,col} | keep=앞 비트 표 이어받기 |
| phoneScene | asset, imageSize{w,h}, screenRect{x,y,w,h}, rotation, headerH, overlayBubbles[{side,text,atSentence}], badge:"예시 화면", real:false | 화면 패널이 생성 이미지 말풍선을 덮음. screenRect 없으면 코드 폰 폴백 |
| countdown | from:30, arrow | 0→30 카운트업 + 링 채움 |
비트에 `broll:{asset, kenBurns, focus:"left"|"center"}` 면 motion 없이 B-roll.

## 새 모션 추가 규칙
`motions/<Name>.tsx`에 `React.FC<MP>`로 작성 → `motions/index.tsx` 레지스트리 등록. transform/opacity/clip-path만 애니메이트. 절대 프레임 데이터가 필요하면 `data.parentFrom`을 빼서 로컬로.
