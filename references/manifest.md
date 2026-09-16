# 씬 매니페스트 스키마 (`data/scenes.json`)

```jsonc
{
  "project": "store-3insurance", "fps": 30, "width": 1920, "height": 1080, "theme": "store-light",
  "source": { "video": "public/src/talk.mp4", "durationSec": 412.9, "words": "data/words.json", "sentences": "data/sentences.json", "cuts": "data/cuts.json" },
  "layoutDefaults": { "graphic-pip": { "pip": { "shape": "card", "size": [512, 288], "pos": "br", "margin": 48 } } },
  "captionStyle": { "cueMax": 34, "oneLineMax": 18, "minTail": 6, "keywordMaxPerCue": 1, "keywordColor": "#FF6A45" },
  "cuts": { "silenceThresholdSec": 0.7, "silenceKeepSec": 0.25, "sentenceEndKeepSec": 0.4, "retakeWindowWords": 6, "whitelistSentences": [[16, 18], [53, 55]] },
  "creditStyle": { "size": 18, "color": "#70737C", "opacity": 0.45, "pos": "card-bottom-right" },
  "scenes": [
    {
      "id": "ch3-death", "title": "사망 보장 — 기간이 핵심",          // " — " 앞은 눈썹, 뒤는 타이틀 카드 본문
      "anchor": { "fromSentence": 21, "toSentence": 33 },              // 문장 번호만. 초 금지
      "layout": "graphic-pip", "spine": { "index": 1, "total": 3 },
      "beats": [
        { "anchor": { "fromSentence": 26, "toSentence": 29 }, "motion": { "type": "ageTimeline", "data": { "marker": { "label": "자녀 독립", "pct": 0.6 }, "bad": { "label": "100세까지" }, "good": { "label": "독립 시점까지" } } } },
        { "anchor": { "fromSentence": 63, "toSentence": 67 }, "motion": null, "broll": { "asset": "higgs-01.png", "kenBurns": true, "focus": "left" } }
      ],
      "character": { "pose": "think", "anchor": "fromSentence:30" },
      "keywords": ["기간", "독립할 시점", "100세"]                       // 자막 키워드 후보(큐당 1개 자동 선택)
    }
  ],
  "higgsQueue": [ { "id": "higgs-01", "scene": "ch7", "model": "nano_banana_pro", "aspect": "16:9", "prompt": "..." } ]
}
```
빌드(`build-timeline.mjs`)가 문장 번호를 컷 후 프레임으로 바꾸고, 씬을 타일링하고(빈 구간 0), numberCards/keywordTypo/eitherOr/phoneScene에 단어 시각을 주입한다.
