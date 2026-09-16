# 밟은 함정과 해법 (2026-09-16 "3가지 보험" 편)

| 증상 | 원인 | 해법 |
|---|---|---|
| Remotion이 촬영본을 못 읽거나 색이 물빠짐 | iPhone HEVC 10-bit HLG(HDR) | Step 0 zscale+tonemap → H.264 SDR bt709. 이 파일이 타임코드 기준 |
| 리테이크 탐지 오탐(진짜 문장 3초 삭제) | 2어절 반복만으로 판정 | 앞 테이크가 **쉼표로 끊긴 조각**이고 문장 종결이 없을 때만, 창 6단어 |
| 의도된 반복(따라 읽기) 컷됨 / 진짜 리테이크 놓침 | 화이트리스트를 씬 전체로 잡음 | `whitelistSentences` 문장 범위로 |
| 리테이크와 침묵 컷 겹침 에러 | 두 후보가 겹침 | 정렬 후 병합(흡수) |
| 비트 안 단어 시각 모션이 안 나옴 | Sequence 안 useCurrentFrame은 로컬, 데이터는 절대 프레임 | GraphicsLayer가 `data.parentFrom = beat.from` 주입, 모션은 `at - parentFrom` |
| 영상 첫 0.5초가 PIP→풀로 커짐 | 첫 레이아웃도 스프링 적용 | 첫 전환점은 스프링 없이 고정 |
| 카운트다운이 "0초 안에 상담"으로 끝남 | 방향 반대 | 0→30 카운트업 + 링 채움 |
| 표 하이라이트 라벨이 윗줄과 겹침 | 셀 위 절대 배치 | 셀 안 2행 |
| 생성 이미지 우측에 반투명 띠 | "empty right third" 프롬프트 | `broll.focus:"left"` 크롭(166% 폭, 좌측 정렬) |
| 캐릭터 PNG 흰 배경 아님 | 블루 라디얼 박스 | keyout.py blue 모드(가장자리 연결 성분만 제거) |
| 비트 시작 전 빈 무대 | 씬 시작과 첫 비트 사이 공백 | SceneTitle 폴백(눈썹+본문) |
| ElevenLabs MCP 경로 오류 | `~/Desktop` 밖 파일 거부, 단어 타임스탬프 없음 | REST scribe_v1 직접 호출 |
| macOS `timeout`·`ffprobe` 없음 | 기본 미설치 | `ffmpeg -i`로 메타, `FFMPEG` env로 경로 지정 |
