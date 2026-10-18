#!/usr/bin/env python3
"""Cut out the round-5 expression and noun art for Unit 1.1 (stories, new-word cards)
and make the PWA icons. NO models: the generated art sits on a plain white
background, so a flood fill from the border (the same "flood" mask as
process_art.py, without rembg) is enough. CPU only, numpy + scipy + Pillow:

    CUDA_VISIBLE_DEVICES="" ~/Documents/video_generation/Wan2GP/.venv/bin/python prototype/tools/process_art_l2.py

Reads (never modifies) ~/Documents/spanish/spanish_app/design/characters/art_round5/
and writes optimised WebP files (each <= 120 KB) to prototype/assets/, plus
prototype/icons/*.png from the existing owl cut-out.
"""
from pathlib import Path
import io

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

SRC = Path.home() / "Documents/spanish/spanish_app/design/characters/art_round5"
PROTO = Path(__file__).resolve().parent.parent
OUT = PROTO / "assets"
ICONS = PROTO / "icons"
MAX_BYTES = 120 * 1024

# name -> (source, max side)
ART = {
    "matilda-wave": ("matilda_wave_s1.png", 520),
    "matilda-surprised": ("matilda_surprised_s1.png", 520),
    "matilda-celebrate": ("matilda_celebrate_s1.png", 520),
    "matilda-thinking": ("matilda_thinking_s1.png", 520),
    "max-wave": ("max_wave_s1.png", 520),
    "max-jump": ("max_jump_s1.png", 520),
    "max-surprised": ("max_surprised_s1.png", 520),
    "max-celebrate": ("max_celebrate_s1.png", 520),
    "max-thinking": ("max_thinking_s1.png", 520),
    "noun-mapa": ("noun_mapa_s1.png", 420),
    "noun-mundo": ("noun_mundo_s1.png", 420),
    "noun-capital": ("noun_capital_s1.png", 420),
    "noun-monumento": ("noun_monumento_s2.png", 420),
}


def background_flood(rgb: np.ndarray) -> np.ndarray:
    """Near-white / light-grey pixels connected to the image border (the background
    and the soft ground shadow). Enclosed whites (eyes, chests) stay solid."""
    rgb = rgb.astype(np.int16)
    lo, hi = rgb.min(axis=2), rgb.max(axis=2)
    light = (lo > 196) & (hi - lo < 30)
    labels, _ = ndimage.label(light)
    border = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    bg = np.isin(labels, list(border))
    # Enclosed gaps of pure background white (between a kangaroo's legs) are background
    # too; small white areas (eyes, highlights) are not.
    white = (lo > 238) & (hi - lo < 12) & ~bg
    wl, n = ndimage.label(white)
    if n:
        sizes = ndimage.sum(white, wl, range(1, n + 1))
        big = [i + 1 for i, s in enumerate(sizes) if s > white.size * 0.004]
        bg |= np.isin(wl, big)
    return bg


def cutout(im: Image.Image) -> Image.Image:
    rgb = np.array(im)
    solid = ~background_flood(rgb)
    solid = ndimage.binary_opening(solid, iterations=1)
    # keep the biggest blobs only (drops specks of shadow)
    labels, n = ndimage.label(solid)
    if n > 1:
        sizes = ndimage.sum(solid, labels, range(1, n + 1))
        keep = [i + 1 for i, s in enumerate(sizes) if s >= max(sizes) * 0.02]
        solid = np.isin(labels, keep)
    alpha = Image.fromarray((solid * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
    out = im.convert("RGBA")
    out.putalpha(alpha)
    return out


def trim(im: Image.Image, pad: int = 6) -> Image.Image:
    bbox = im.getchannel("A").point(lambda v: 255 if v > 10 else 0).getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    return im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))


def save_webp(im: Image.Image, path: Path, quality: int = 82) -> int:
    q = quality
    while True:
        buf = io.BytesIO()
        im.save(buf, "WEBP", quality=q, method=6, alpha_quality=90)
        if buf.tell() <= MAX_BYTES or q <= 40:
            path.write_bytes(buf.getvalue())
            return buf.tell()
        q -= 6


def icons():
    """PWA icons: the explaining owl on a turquoise-50 disc (any) and full-bleed (maskable)."""
    ICONS.mkdir(exist_ok=True)
    owl = Image.open(OUT / "owl-explaining.webp").convert("RGBA")
    for size, maskable in ((192, False), (512, False), (512, True), (180, False)):
        bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(bg)
        if maskable or size == 180:
            d.rectangle((0, 0, size, size), fill=(227, 246, 245, 255))  # turquoise-50, full bleed
            box = int(size * (0.62 if maskable else 0.78))
        else:
            d.ellipse((0, 0, size - 1, size - 1), fill=(227, 246, 245, 255))
            d.ellipse((int(size * .03), int(size * .03), int(size * .97), int(size * .97)), outline=(43, 191, 185, 255), width=max(2, size // 48))
            box = int(size * 0.74)
        o = owl.copy()
        o.thumbnail((box, box), Image.LANCZOS)
        x = (size - o.width) // 2
        y = (size - o.height) // 2 + (int(size * 0.04) if not maskable else 0)
        bg.alpha_composite(o, (x, y))
        name = "apple-touch-icon.png" if size == 180 else f"icon-{size}{'-maskable' if maskable else ''}.png"
        bg.save(ICONS / name, optimize=True)
        print(f"{name:26s} {(ICONS / name).stat().st_size / 1024:6.1f} KB")


def main():
    for name, (src, side) in ART.items():
        im = Image.open(SRC / src).convert("RGB")
        cut = trim(cutout(im))
        cut.thumbnail((side, side), Image.LANCZOS)
        size = save_webp(cut, OUT / f"{name}.webp")
        print(f"{name:18s} {cut.size[0]}x{cut.size[1]}  {size / 1024:6.1f} KB  ({src})")
    icons()


if __name__ == "__main__":
    main()
