#!/usr/bin/env bash
# Step 0 — 촬영본 정규화: HEVC/HDR(HLG·PQ) → H.264 SDR bt709 30fps + 라우드니스 -16 LUFS. 이후 모든 타임코드의 기준 파일.
# 사용: scripts/normalize.sh <video.mov> [public/src/talk.mp4]
set -euo pipefail
SRC="$1"; OUT="${2:-public/src/talk.mp4}"; FF="${FFMPEG:-ffmpeg}"; mkdir -p "$(dirname "$OUT")"
if "$FF" -hide_banner -filters 2>/dev/null | grep -q " zscale "; then
  VF="zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
else
  echo "zscale 없음 → 톤매핑 생략(색 약간 물빠짐 가능)"; VF="format=yuv420p"
fi
"$FF" -hide_banner -y -i "$SRC" -vf "$VF" -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -r 30 -g 60 -movflags +faststart \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 "$OUT"
"$FF" -hide_banner -i "$OUT" 2>&1 | grep -E "Duration|Stream"
