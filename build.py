#!/usr/bin/env python3 -I
"""Assemble index.html depuis src/ (concaténation ordonnée, sans transformation).
Usage : python3 -I build.py [sortie]   (défaut : index.html)"""
import sys, pathlib
SRC = pathlib.Path(__file__).resolve().parent / "src"
ORDER = ["head.html", "style.css", "mid.html", "seed.json", "mid2.html", "app.js", "tail.html"]
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else SRC.parent / "index.html"
import json
def part(n):
    if n == "seed.json":   # les guides de récolte sont embarqués juste après la graine, dans un second bloc JSON
        g = {k: json.loads((SRC / f"guide-{k}.json").read_text(encoding="utf-8")) for k in ("peche", "depecage", "herbo")}
        return (SRC / n).read_text(encoding="utf-8") + '</script>\n<script id="guides" type="application/json">' + json.dumps(g, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return (SRC / n).read_text(encoding="utf-8")
out.write_text("".join(part(n) for n in ORDER), encoding="utf-8", newline="")
print(f"{out} : {out.stat().st_size} octets")
