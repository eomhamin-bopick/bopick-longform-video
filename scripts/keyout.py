"""캐릭터 PNG 배경 제거 — 흰색/블루·시안 그라데이션 배경을 가장자리 연결 성분만 제거(눈 흰자 등 내부 보존) → 1024² 투명 PNG.
사용: python3 scripts/keyout.py <in.png> <out.png> [white|blue]"""
import sys
from collections import deque
from PIL import Image, ImageFilter
src, dst, mode = sys.argv[1], sys.argv[2], (sys.argv[3] if len(sys.argv) > 3 else "blue")
im = Image.open(src).convert("RGBA").resize((1024, 1024), Image.LANCZOS); w, h = im.size; px = im.load()
def isbg(c):
    r, g, b, _ = c
    if r > 232 and g > 232 and b > 232: return True
    return mode == "blue" and ((b > r + 16 and g > r + 6) or (b > r + 30))
seen = bytearray(w * h); q = deque()
for x in range(w):
    for y in (0, h - 1):
        if isbg(px[x, y]) and not seen[y * w + x]: q.append((x, y)); seen[y * w + x] = 1
for y in range(h):
    for x in (0, w - 1):
        if isbg(px[x, y]) and not seen[y * w + x]: q.append((x, y)); seen[y * w + x] = 1
while q:
    x, y = q.popleft()
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and isbg(px[nx, ny]): seen[ny * w + nx] = 1; q.append((nx, ny))
for y in range(h):
    for x in range(w):
        if seen[y * w + x]: px[x, y] = (0, 0, 0, 0)
im.putalpha(im.split()[3].filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.0)))
crop = im.crop(im.getbbox()); side = max(crop.size) + 80
cv = Image.new("RGBA", (side, side), (0, 0, 0, 0)); cv.paste(crop, ((side - crop.width) // 2, (side - crop.height) // 2), crop)
cv.resize((1024, 1024), Image.LANCZOS).save(dst); print("keyed →", dst)
