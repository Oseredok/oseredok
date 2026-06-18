#!/usr/bin/env python3
"""Generate a coverage badge SVG from pytest + vitest reports."""

import sys
import xml.etree.ElementTree as ET
from pathlib import Path

COLORS = {
    "brightgreen": "#97ca00",
    "green": "#4c1",
    "yellowgreen": "#a4a61d",
    "orange": "#fe7d37",
}


def backend_line_rate(coverage_xml: Path) -> tuple[int, int]:
    root = ET.parse(coverage_xml).getroot()
    return int(root.attrib["lines-covered"]), int(root.attrib["lines-valid"])


def frontend_line_rate(lcov_path: Path) -> tuple[int, int]:
    lf = lh = 0
    for line in lcov_path.read_text().splitlines():
        if line.startswith("LF:"):
            lf += int(line[3:])
        elif line.startswith("LH:"):
            lh += int(line[3:])
    return lh, lf


def badge_color(percent: int) -> str:
    if percent >= 80:
        return "brightgreen"
    if percent >= 65:
        return "green"
    if percent >= 50:
        return "yellowgreen"
    return "orange"


def render_svg(percent: int, color_name: str) -> str:
    bg = COLORS[color_name]
    width = 96 if percent < 10 else 103 if percent < 100 else 110
    value_x = 61 + (width - 61) / 2
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="20" role="img" aria-label="coverage: {percent}%">
<title>coverage: {percent}%</title>
<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
<clipPath id="r"><rect width="{width}" height="20" rx="3" fill="#fff"/></clipPath>
<g clip-path="url(#r)"><rect width="61" height="20" fill="#555"/><rect x="61" width="{width - 61}" height="20" fill="{bg}"/><rect width="{width}" height="20" fill="url(#s)"/></g>
<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
<text x="30.5" y="14">coverage</text>
<text x="{value_x}" y="14">{percent}%</text>
</g>
</svg>
"""


def main() -> int:
    backend_xml = Path(sys.argv[1])
    frontend_lcov = Path(sys.argv[2])
    output = Path(sys.argv[3])

    b_cov, b_total = backend_line_rate(backend_xml)
    f_cov, f_total = frontend_line_rate(frontend_lcov)
    total = b_total + f_total
    percent = round((b_cov + f_cov) / total * 100) if total else 0
    color = badge_color(percent)

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(render_svg(percent, color), encoding="utf-8")
    print(f"Badge: {percent}% ({color}) -> {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
