#!/usr/bin/env python3
"""Generate a shields.io coverage badge SVG from pytest + vitest reports."""

import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path


def backend_line_rate(coverage_xml: Path) -> tuple[int, int]:
    root = ET.parse(coverage_xml).getroot()
    rate = float(root.attrib["line-rate"])
    lines = int(root.attrib["lines-valid"])
    covered = int(root.attrib["lines-covered"])
    return covered, lines if lines else (int(rate * 1000), 1000)


def frontend_line_rate(lcov_path: Path) -> tuple[int, int]:
    lf = lh = 0
    for line in lcov_path.read_text().splitlines():
        if line.startswith("LF:"):
            lf += int(line[3:])
        elif line.startswith("LH:"):
            lh += int(line[3:])
    return lh, lf


def badge_color(percent: int) -> str:
    if percent >= 55:
        return "brightgreen"
    if percent >= 45:
        return "green"
    if percent >= 35:
        return "yellowgreen"
    return "orange"


def main() -> int:
    backend_xml = Path(sys.argv[1])
    frontend_lcov = Path(sys.argv[2])
    output = Path(sys.argv[3])

    b_cov, b_total = backend_line_rate(backend_xml)
    f_cov, f_total = frontend_line_rate(frontend_lcov)
    total = b_total + f_total
    percent = round((b_cov + f_cov) / total * 100) if total else 0

    color = badge_color(percent)
    label = f"coverage-{percent}%25-{color}?logo=codecov"
    url = f"https://img.shields.io/badge/{label}"
    svg = urllib.request.urlopen(url, timeout=30).read()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(svg)
    print(f"Badge: {percent}% -> {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
