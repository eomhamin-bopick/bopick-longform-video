#!/usr/bin/env bash
# Step 1 — 촬영본 → 모노 16k mp3 → ElevenLabs Scribe(단어 타임스탬프) → data/words.raw.json
# 사용: ELEVENLABS_API_KEY=... scripts/transcribe.sh <video.mov> [lang=kor]
# 키가 셸에 없고 ElevenLabs MCP가 설정돼 있으면 ~/.claude.json 의 mcpServers.elevenlabs.env 에서 읽는다.
set -euo pipefail
SRC="$1"; LANG_CODE="${2:-kor}"; FF="${FFMPEG:-ffmpeg}"
KEY="${ELEVENLABS_API_KEY:-$(python3 -c 'import json,os;print(json.load(open(os.path.expanduser("~/.claude.json")))["mcpServers"]["elevenlabs"]["env"]["ELEVENLABS_API_KEY"])' 2>/dev/null || true)}"
[ -n "$KEY" ] || { echo "ELEVENLABS_API_KEY 없음"; exit 1; }
mkdir -p data out
"$FF" -v error -y -i "$SRC" -vn -ac 1 -ar 16000 -b:a 64k out/audio-mono16k.mp3
curl -sS --max-time 600 -X POST "https://api.elevenlabs.io/v1/speech-to-text" -H "xi-api-key: $KEY" \
  -F "model_id=scribe_v1" -F "language_code=$LANG_CODE" -F "timestamps_granularity=word" -F "diarize=false" -F "tag_audio_events=false" \
  -F "file=@out/audio-mono16k.mp3" -o data/words.raw.json
python3 -c 'import json;d=json.load(open("data/words.raw.json"));w=[x for x in d.get("words",[]) if x.get("type")=="word"];print("words:",len(w),"| lang:",d.get("language_code"),d.get("language_probability"))'
