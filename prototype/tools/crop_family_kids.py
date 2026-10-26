"""Cut Valentina and Samuel out of the existing Restrepo family picture (prototype/assets/family.webp).
No new art: the family picture already shows them as the character bible describes them
(Valentina: dark curly hair; Samuel: short dark hair, a t-shirt and jeans). Each child is cut along
their own outline: in a band at each side, a row ends at the first pixel that is transparent or
nearer a neighbour's colours; the row ends are smoothed (median of 11 rows) and only the largest
connected shape is kept. CPU only (Pillow).
Run from prototype/: python3 tools/crop_family_kids.py assets/family.webp assets"""
import sys
from collections import deque
from statistics import median
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
im = Image.open(SRC).convert("RGBA")
W, H = im.size
px = im.load()

def dist(a, b): return sum((x - y) ** 2 for x, y in zip(a, b))
GIRL = [(33, 24, 25), (241, 51, 113), (247, 154, 111), (239, 127, 85), (53, 176, 87), (232, 90, 60), (40, 60, 110)]
BOY = [(254, 246, 228), (216, 111, 69), (60, 96, 132), (60, 60, 60), (40, 150, 150), (35, 25, 25)]
MOM = [(255, 205, 60), (60, 110, 190), (200, 40, 70), (240, 200, 70), (30, 90, 170)]

def is_other(c, keep, other):
    return min(dist(c, p) for p in other) < min(dist(c, p) for p in keep)

def ends(x0, x1, keep, left, right, lstart, rstart, y0):
    lo, hi = [x0] * H, [x1] * H
    for y in range(H):
        if y < y0: lo[y], hi[y] = x1, x1; continue
        if right:
            for x in range(rstart, x1):
                r, g, b, a = px[x, y]
                if a < 40 or is_other((r, g, b), keep, right): hi[y] = x; break
        for x in range(lstart, x0 - 1, -1):
            r, g, b, a = px[x, y]
            if a < 40 or is_other((r, g, b), keep, left): lo[y] = x + 1; break
    sm = lambda v: [round(median(v[max(0, y - 5): y + 6])) for y in range(H)]
    return sm(lo), sm(hi)

def cut(lo, hi):
    out = Image.new("RGBA", (W, H)); o = out.load()
    for y in range(H):
        for x in range(lo[y], hi[y]): o[x, y] = px[x, y]
    # keep the largest connected shape (no stray pixels from a neighbour)
    seen, best = set(), []
    for y in range(H):
        for x in range(lo[y], hi[y]):
            if (x, y) in seen or o[x, y][3] < 40: continue
            comp, q = [], deque([(x, y)]); seen.add((x, y))
            while q:
                cx, cy = q.popleft(); comp.append((cx, cy))
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen and o[nx, ny][3] >= 40:
                        seen.add((nx, ny)); q.append((nx, ny))
            if len(comp) > len(best): best = comp
    keep = set(best)
    for y in range(H):
        for x in range(lo[y], hi[y]):
            if (x, y) not in keep and o[x, y][3] >= 40: o[x, y] = (0, 0, 0, 0)
    return out

def save(img, name, pad=8):
    box = img.getbbox()
    c = img.crop((box[0] - pad, box[1] - pad, box[2] + pad, box[3] + pad))
    s = 640 / c.size[1]  # the same height as max.webp and matilda.webp
    c = c.resize((round(c.size[0] * s), 640), Image.LANCZOS)
    c.save(f"{OUT}/{name}.webp", "WEBP", quality=90, method=6)
    print(name, c.size)

save(cut(*ends(462, 672, GIRL, MOM, BOY, 484, 636, 120)), "valentina")
save(cut(*ends(625, W, BOY, GIRL, None, 668, W, 40)), "samuel")

# Samuel's left sleeve and arm are hidden behind Valentina in the family picture: mirror his right
# side (sleeve, arm, hand in pocket) from the collar down, about the middle of his teal collar.
s = Image.open(f"{OUT}/samuel.webp").convert("RGBA")
sp = s.load()
sw, sh = s.size
teal = [(x, y) for y in range(sh) for x in range(sw) if sp[x, y][3] > 200 and dist(sp[x, y][:3], (40, 150, 150)) < 2500]
cx = round(sum(x for x, _ in teal) / len(teal))
top = min(y for _, y in teal) + 6
out = Image.new("RGBA", (sw, sh))
out.paste(s.crop((0, 0, sw, top)), (0, 0))
right = s.crop((cx, top, sw, sh))
out.paste(right, (cx, top))
out.paste(right.transpose(Image.FLIP_LEFT_RIGHT), (cx - right.size[0], top))
box = out.getbbox()
out = out.crop((box[0] - 8, 0, box[2] + 8, sh))
out.save(f"{OUT}/samuel.webp", "WEBP", quality=90, method=6)
print("samuel mirrored", out.size, "centre", cx, "from y", top)

# Valentina: a few pixels of her mother's striped bag sit by her left hand. Clear anything in the
# outer quarter on that side that is nearer the bag's colours (or the yellow sleeve) than hers.
v = Image.open(f"{OUT}/valentina.webp").convert("RGBA")
vp = v.load()
vw, vh = v.size
BAG = MOM + [(250, 220, 90), (90, 160, 210), (230, 70, 50), (120, 60, 130)]
for y in range(vh):
    for x in range(vw // 4):
        r, g, b, a = vp[x, y]
        if a > 20 and (is_other((r, g, b), GIRL, BAG) or (y > vh // 2 and r + g + b < 360)): vp[x, y] = (0, 0, 0, 0)
v.save(f"{OUT}/valentina.webp", "WEBP", quality=90, method=6)
print("valentina cleaned")

# Pad both to the shape of max.webp (401×640): every layout sizes characters by width, so a narrow
# picture would come out much taller than Max and Matilda.
for name in ("valentina", "samuel"):
    im = Image.open(f"{OUT}/{name}.webp").convert("RGBA")
    canvas = Image.new("RGBA", (400, 640))
    canvas.paste(im, ((400 - im.size[0]) // 2, 0), im)
    canvas.save(f"{OUT}/{name}.webp", "WEBP", quality=90, method=6)
    print(name, "padded to", canvas.size)
