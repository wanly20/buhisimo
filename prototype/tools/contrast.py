#!/usr/bin/env python3
"""Print WCAG contrast ratios for the colour pairs the prototype actually uses.

    python3 prototype/tools/contrast.py

Reads the hex values straight from css/tokens.css so the table never drifts.
"""
import re
from pathlib import Path

TOKENS = Path(__file__).resolve().parent.parent / "css" / "tokens.css"


def load():
    css = TOKENS.read_text()
    root = css.split("}")[0]  # first :root block = light theme
    return dict(re.findall(r"--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})", root))


def lum(h):
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


# (foreground token, background token, what it is, minimum)
PAIRS = [
    ("ink", "cream", "body text on page", 4.5),
    ("ink", "white", "body text on cards", 4.5),
    ("ink-soft", "cream", "secondary text on page", 4.5),
    ("ink-soft", "white", "secondary text on cards", 4.5),
    ("white", "turquoise-600", "primary button label", 4.5),
    ("white", "magenta-600", "magenta button label", 4.5),
    ("white", "emerald-600", "correct button label", 4.5),
    ("white", "terracotta-600", "incorrect button label", 4.5),
    ("mustard-ink", "mustard-400", "label on mustard", 4.5),
    ("emerald-700", "emerald-50", "correct sheet text", 4.5),
    ("terracotta-700", "terracotta-50", "incorrect sheet text", 4.5),
    ("turquoise-700", "turquoise-50", "selected option text", 4.5),
    ("turquoise-700", "white", "link / accent text", 4.5),
    ("magenta-700", "white", "magenta accent text", 4.5),
    ("ink-faint", "white", "disabled label (exempt, shown for info)", 0),
]

if __name__ == "__main__":
    c = load()
    bad = 0
    print(f"{'foreground':16s} {'background':16s} {'ratio':>6s}  use")
    for fg, bg, use, need in PAIRS:
        r = ratio(c[fg], c[bg])
        ok = "ok" if r >= need else "FAIL"
        bad += r < need
        print(f"{fg:16s} {bg:16s} {r:6.2f}  {use} [{ok}]")
    raise SystemExit(1 if bad else 0)
