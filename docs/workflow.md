# 워크플로우 한 장 요약

```
촬영본.mov ──Step0 normalize──▶ talk.mp4 (H.264 SDR, 타임코드 기준)
     └──Step1 transcribe──▶ words.raw.json ──sentences──▶ sentences.json (문장 번호)
                                   │
   Phase0 객관식 인터뷰 ───────────┤
   Phase2 원고 분석→연출 추천 ─────┴──▶ scenes.json (씬·비트 = 문장 번호 앵커)
                                   │
   Step2 cuts.mjs ▶ cuts.json (침묵·리테이크, approved) ─┐
   Step3/4 build-timeline.mjs ◀─────────────────────────┘ ▶ timeline.json (세그먼트·씬·비트·자막 큐, 프레임)
                                   │
   Phase5 소재(Higgs·캐릭터·캡처) ▶ public/assets, public/bodung
   Phase6 Remotion(template) ─────▶ stills.mjs 검수 ▶ render ▶ check.mjs ▶ srt.mjs ▶ mp4 + srt + 제작로그
```
변경: 항상 data/*.json → 재빌드 → 해당 씬 스틸 → 재렌더. Studio는 보기 전용.
