#!/usr/bin/env python3
"""Cut out and optimise the prototype art.

Run with the Python that has rembg installed (CPU is enough):
    CUDA_VISIBLE_DEVICES="" ~/Documents/video_generation/Wan2GP/.venv/bin/python prototype/tools/process_art.py [names...]

With names, only those assets are rebuilt (e.g. `max-wave noun-mapa`).

Reads the source PNGs (never modifies them) from
~/Documents/spanish/spanish_app/design/prototype_art/ and writes optimised
WebP files (each <= 150 KB) to prototype/assets/.

Characters: background removed with rembg, then only the connected component(s)
that overlap the character's core box are kept, so stray house fragments vanish.
"""
from pathlib import Path
import io
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

SRC = Path.home() / "Documents/spanish/spanish_app/design/prototype_art"
# Species-accurate Buhísimo (round head, no ear tufts), seed 3 = most consistent set.
OWL_SRC = Path.home() / "Documents/spanish/spanish_app/design/characters/owl_fix"
# Oct 18 flat remake (max_s1 style, NAG off): Matilda with the balaca wayuu, the expression
# poses for Matilda and Max, and the four Unit 1.1 nouns. Replaces the round-5 art that
# process_art_l2.py used to cut out.
# matilda_stand_s4.png is Juan's pick from matilda_girl/balaca_style/, copied into remake_flat/.
FLAT_SRC = Path.home() / "Documents/spanish/spanish_app/design/characters/remake_flat"
OUT = Path(__file__).resolve().parent.parent / "assets"
MAX_BYTES = 150 * 1024

# Each character: source file, rembg model, output max side, the "core" box
# (fractions of the image) that must belong to the character, plus options:
#   mode "flood": alpha = everything not reachable from the border through
#                 near-white pixels (keeps white eye patches and chests solid)
#   mode "rembg": rembg's own mask with enclosed holes filled (for art where
#                 white clothes touch the background, e.g. the family)
#   mode "noshadow": rembg's mask (holes filled) minus the neutral-grey ground
#                 shadow, see rembg_no_shadow ("noshadow-keepwhite" for the map)
#   whiteout: rectangles (fractions) painted white first, to erase the houses
O = dict(model="isnet-general-use", size=640, mode="flood", core=(0.35, 0.25, 0.65, 0.75), whiteout=())
CHARACTERS = {
    "owl-explaining":  dict(O, dir=OWL_SRC, src="pose_explaining_s3.png", mode="rembg"),
    "owl-celebrating": dict(O, dir=OWL_SRC, src="pose_celebrating_s3.png", mode="rembg"),
    "owl-encouraging": dict(O, dir=OWL_SRC, src="pose_encouraging_s3.png", mode="rembg"),
    "owl-thinking":    dict(O, dir=OWL_SRC, src="pose_thinking_s3.png", mode="rembg"),
    # Her pale belly touches the white background between her legs, so the flood fill would eat it.
    "matilda":         dict(O, dir=FLAT_SRC, src="matilda_stand_s4.png", mode="noshadow", core=(0.40, 0.25, 0.60, 0.75)),
    "max":             dict(O, src="max_s1.png", core=(0.40, 0.30, 0.60, 0.70)),
    "family":          dict(O, src="family_s1.png", size=900, mode="rembg", core=(0.30, 0.30, 0.70, 0.80)),
}
# Expression poses and nouns: same pipeline, smaller output (the sizes the round-5 art had).
F = dict(O, dir=FLAT_SRC, size=520)
N = dict(F, size=420)
FLAT_PICKS = {
    "matilda-wave": "matilda_wave_s4.png",
    "matilda-celebrate": "matilda_celebrate_s4.png",
    "matilda-surprised": "matilda_surprised_s4.png",
    "matilda-thinking": "matilda_thinking_s1.png",
    "max-wave": "max_wave_s1.png",
    "max-jump": "max_jump_s1.png",
    "max-celebrate": "max_celebrate_s3.png",
    "max-surprised": "max_surprised_s1.png",
    "max-thinking": "max_thinking_s2.png",
    "noun-mapa": "noun_mapa_s4.png",
    "noun-mundo": "noun_mundo_s2.png",
    "noun-capital": "noun_capital_s2.png",
    "noun-monumento": "noun_monumento_s4.png",
}
# Where pale parts touch the background (Matilda's belly, the map's white roads) the flood
# fill would eat them, so those use rembg's mask minus the grey ground shadow.
MODES = {"matilda-wave": "noshadow", "matilda-celebrate": "noshadow", "matilda-surprised": "noshadow",
         "matilda-thinking": "noshadow", "noun-mapa": "noshadow-keepwhite"}
for _name, _src in FLAT_PICKS.items():
    CHARACTERS[_name] = dict(N if _name.startswith("noun") else F, src=_src, mode=MODES.get(_name, "flood"))

# name -> (source, max width, quality)
SCENES = {
    "map-background": ("map_background_s2.png", 768, 80),
    "salento-street": ("salento_street_s1.png", 1100, 80),
}


def background_flood(rgb: np.ndarray) -> np.ndarray:
    """Pixels that are near-white/light-grey AND connected to the image border.

    The generated art sits on a plain white background with a soft grey ground
    shadow. Flooding from the border finds exactly that, while white areas that
    are enclosed by the character (owl eye patches, chest, shirts) stay solid.
    """
    rgb = rgb.astype(np.int16)
    lo, hi = rgb.min(axis=2), rgb.max(axis=2)
    light = (lo > 200) & (hi - lo < 28)
    labels, _ = ndimage.label(light)
    border = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    return np.isin(labels, list(border))


def merge_masks(rgb_im: Image.Image, cut: Image.Image) -> Image.Image:
    """Combine rembg's soft edge with the flood-fill mask (fixes holes and shadows)."""
    a = np.array(cut)
    bg = background_flood(np.array(rgb_im))
    solid = ~bg
    near = ndimage.binary_dilation(solid, iterations=2)
    alpha = np.where(solid, 255, np.where(near, a[:, :, 3], 0)).astype(np.uint8)
    # Light edge feathering so the cut never looks jagged.
    alpha_img = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.6))
    a[:, :, :3] = np.array(rgb_im)
    a[:, :, 3] = np.array(alpha_img)
    return Image.fromarray(a)


def fill_holes(rgb_im: Image.Image, cut: Image.Image) -> Image.Image:
    """rembg mask, with fully enclosed holes (e.g. white shirt patches) made solid."""
    a = np.array(cut)
    solid = ndimage.binary_fill_holes(a[:, :, 3] > 128)
    a[:, :, 3] = np.where(solid, 255, a[:, :, 3])
    a[:, :, :3] = np.array(rgb_im)
    return Image.fromarray(a)


def rembg_no_shadow(rgb_im: Image.Image, cut: Image.Image, fill: bool = True, drop_gaps: bool = True, band: float = 0.16) -> Image.Image:
    """rembg's mask, minus the grey ground shadow under the feet.

    For art where pale parts touch the background (Matilda's belly between her legs, the
    map's white roads), which the flood fill would eat. rembg keeps those, but it also keeps
    the soft grey ground shadow, so in the bottom `band` of the figure we drop pixels that
    are border-connected light background AND neutral grey (the shadow is ~(234,232,233);
    her belly ~(250,234,221) is warm, so it stays). fill=True first makes enclosed holes
    solid (rembg drops her pale inner ears otherwise); pure white (>=246) is never dropped,
    so the map's white roads survive.
    """
    a = np.array(cut)
    rgb = np.array(rgb_im).astype(np.int16)
    lo, hi = rgb.min(axis=2), rgb.max(axis=2)
    solid = a[:, :, 3] > 128
    if fill:
        filled = ndimage.binary_fill_holes(solid)
        # Holes rembg left are either pale parts (inner ears: keep) or enclosed background
        # gaps (between the legs, arm and head: pure white, drop).
        # drop_gaps=False keeps every enclosed white (the map's pin centre and roads).
        gap = (filled & ~solid) & (lo >= 238) & (hi - lo < 12) & drop_gaps
        solid = filled & ~ndimage.binary_dilation(gap, iterations=1, mask=filled & ~solid)
    ys = np.nonzero(solid.any(axis=1))[0]
    y_band = int(ys[-1] - band * (ys[-1] - ys[0])) if len(ys) else 0
    drop = background_flood(np.array(rgb_im)) & (hi - lo < 12) & (lo < 246)
    drop[:y_band] = False
    keep = solid & ~drop
    keep = ndimage.binary_opening(keep, iterations=1)  # no thin shadow rims left behind
    alpha = np.where(keep, 255, 0).astype(np.uint8)
    a[:, :, 3] = np.array(Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.6)))
    a[:, :, :3] = np.array(rgb_im)
    return Image.fromarray(a)


def keep_character(rgba: Image.Image, core) -> Image.Image:
    """Zero the alpha of every blob that does not touch the core box."""
    a = np.array(rgba)
    alpha = a[:, :, 3]
    mask = alpha > 24
    # Close tiny gaps so outlines and limbs stay in one component.
    mask = ndimage.binary_closing(mask, iterations=2)
    labels, n = ndimage.label(mask)
    h, w = mask.shape
    x0, y0, x1, y1 = (int(core[0] * w), int(core[1] * h), int(core[2] * w), int(core[3] * h))
    keep_ids = set(np.unique(labels[y0:y1, x0:x1])) - {0}
    keep = np.isin(labels, list(keep_ids))
    # Soft edge: dilate the kept mask by one pixel so antialiasing survives.
    keep = ndimage.binary_dilation(keep, iterations=1)
    a[:, :, 3] = np.where(keep, alpha, 0)
    return Image.fromarray(a)


def trim(im: Image.Image, pad: int = 8) -> Image.Image:
    bbox = im.getchannel("A").point(lambda v: 255 if v > 10 else 0).getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(im.width, x1 + pad), min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1))


def save_webp(im: Image.Image, path: Path, quality: int = 82) -> int:
    q = quality
    while True:
        buf = io.BytesIO()
        im.save(buf, "WEBP", quality=q, method=6, alpha_quality=90)
        if buf.tell() <= MAX_BYTES or q <= 40:
            path.write_bytes(buf.getvalue())
            return buf.tell()
        q -= 6


def main(only=None):
    from rembg import new_session, remove

    OUT.mkdir(parents=True, exist_ok=True)
    sessions = {}
    for name, c in CHARACTERS.items():
        if only and name not in only:
            continue
        src, model, max_side = c["src"], c["model"], c["size"]
        im = Image.open(c.get("dir", SRC) / src).convert("RGB")
        if c["whiteout"]:
            draw = ImageDraw.Draw(im)
            for (fx0, fy0, fx1, fy1) in c["whiteout"]:
                draw.rectangle((fx0 * im.width, fy0 * im.height, fx1 * im.width, fy1 * im.height), fill="white")
        sess = sessions.setdefault(model, new_session(model))
        cut = remove(im, session=sess, post_process_mask=True)
        if c["mode"] == "flood":
            cut = merge_masks(im, cut)
        elif c["mode"] == "rembg":
            cut = fill_holes(im, cut)
        else:  # "noshadow" / "noshadow-keepwhite"
            cut = rembg_no_shadow(im, cut, drop_gaps=c["mode"] == "noshadow")
        cut = keep_character(cut, c["core"])
        # The generated ground shadow is a soft grey ellipse; drop near-transparent haze.
        cut = trim(cut)
        cut.thumbnail((max_side, max_side), Image.LANCZOS)
        size = save_webp(cut, OUT / f"{name}.webp")
        print(f"{name:18s} {cut.size[0]}x{cut.size[1]}  {size/1024:6.1f} KB  ({src}, {model})")

    for name, (src, max_w, q) in SCENES.items():
        if only and name not in only:
            continue
        im = Image.open(SRC / src).convert("RGB")
        if im.width > max_w:
            im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
        size = save_webp(im, OUT / f"{name}.webp", q)
        print(f"{name:18s} {im.size[0]}x{im.size[1]}  {size/1024:6.1f} KB  ({src})")


if __name__ == "__main__":
    main(set(sys.argv[1:]) or None)
