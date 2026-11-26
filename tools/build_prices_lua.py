#!/usr/bin/env python3
"""Génère data/Prices.lua : prix publics de l'HV + historique court + profil hebdomadaire précalculé, pour l'addon Gringotts.

Lancé par le workflow prix-hv.yml après tools/prix_hv.py. Sources : data/pp-AAAA-MM-JJ.json
(relevés du bot, texte clair), data/api-public.json (derniers prix), data/ids.json (nom -> identifiant).
Calculs identiques à src/app.js : weekProfile (semaines complètes mercredi -> mardi, chaque semaine normalisée par sa moyenne),
médiane 30 j (age < 30 jours depuis la dernière date), prix du jour. Prix en cuivre (entiers).

Format : GringottsPrices = {v=1, t=<timestamp>, ah=<HV>, d0="AAAA-MM-JJ" (date de s[1]), items={[clé normalisée]={n=nom, id=, p=prix, m=médiane 30 j,
h=jours d'historique, w=semaines complètes, f={7 écarts relatifs, index 1 = dimanche}, s={série quotidienne, 0 = inconnu}}}}
"""
import json, os, re, statistics, sys, unicodedata
from datetime import date, datetime, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
SERIES_DAYS = 56


def norm(s):
    d = unicodedata.normalize("NFD", s)
    d = "".join(c for c in d if unicodedata.category(c) != "Mn")
    return d.replace("’", "'").replace("œ", "oe").replace("Œ", "oe").lower().strip()


def parse_lines(path):
    """-> (en-tête, {nom: cuivre})"""
    with open(path, encoding="utf-8") as f:
        lines = [l.strip() for l in f if l.strip()]
    head = lines[0].split(";")
    prices = {}
    for l in lines[1:]:
        p = l.split(";")
        if p[0] == "P" and len(p) > 2 and p[2].isdigit() and int(p[2]) > 0:
            prices[p[1]] = int(p[2])
    return head, prices


def median(a):
    b = sorted(x for x in a if x is not None)
    return statistics.median(b) if b else None


def week_profile(h, dows):
    """Port de weekProfile (src/app.js) sur une série calendaire contiguë. dows[i] = jour de semaine JS (0 = dimanche)."""
    acc = [[] for _ in range(7)]
    weeks = 0
    for i in range(len(h) - 6):
        if dows[i] != 3:
            continue
        seg = h[i:i + 7]
        if any(v is None or not v > 0 for v in seg):
            continue
        mean = sum(seg) / 7
        for j, v in enumerate(seg):
            acc[(3 + j) % 7].append(v / mean)
        weeks += 1
    if not weeks:
        return 0, None
    return weeks, [sum(a) / len(a) for a in acc]


def build(root_data=DATA, seed_path=None, with_seed=False):
    """with_seed : ajoute l'historique du classeur (sept.-oct.). Désactivé par défaut : ses niveaux de prix ne sont pas comparables
    aux relevés du bot (rapport médian 0,5 ; écart de 30x sur certains objets) et il manque 8 jours entre les deux."""
    seed = json.load(open(seed_path or os.path.join(ROOT, "src", "seed.json"), encoding="utf-8")) if with_seed else {}
    ids = json.load(open(os.path.join(root_data, "ids.json"), encoding="utf-8"))
    for extra in ("ids-pc.json", "ids-manuel.json"):
        p = os.path.join(root_data, extra)
        if os.path.exists(p):
            ids.update({k: int(v) for k, v in json.load(open(p, encoding="utf-8")).items()})
    # Séries par date : classeur d'abord (en or -> cuivre), relevés du bot ensuite (le plus récent l'emporte)
    by_date = {}
    names = {}
    for i, d in enumerate(seed.get("dates", [])):
        for n, arr in seed.get("hist", {}).items():
            v = arr[i] if i < len(arr) else None
            if v:
                by_date.setdefault(d, {})[norm(n)] = round(v * 10000)
                names[norm(n)] = n
    head_last = 0
    for fn in sorted(os.listdir(root_data)):
        m = re.fullmatch(r"pp-(\d{4}-\d{2}-\d{2})\.json", fn)
        if not m:
            continue
        head, pr = parse_lines(os.path.join(root_data, fn))
        by_date.setdefault(m.group(1), {}).update({norm(n): c for n, c in pr.items()})
        names.update({norm(n): n for n in pr})
        head_last = max(head_last, int(head[1]) if len(head) > 1 and head[1].isdigit() else 0)
    head, cur = parse_lines(os.path.join(root_data, "api-public.json"))
    t = int(head[1]); ah = head[2]
    cur_n = {norm(n): c for n, c in cur.items()}
    names.update({norm(n): n for n in cur})
    ids_n = {norm(n): i for n, i in ids.items()}
    # Axe calendaire : du premier jour connu au dernier
    first = min(datetime.strptime(d, "%Y-%m-%d").date() for d in by_date)
    last = max(datetime.strptime(d, "%Y-%m-%d").date() for d in by_date)
    cal = [first + timedelta(days=k) for k in range((last - first).days + 1)]
    dows = [(c.weekday() + 1) % 7 for c in cal]       # JS : dimanche = 0
    iso = [c.isoformat() for c in cal]
    items = {}
    for k in sorted(set(cur_n) | set(ids_n)):
        if k not in cur_n and not any(k in by_date.get(d, {}) for d in iso):
            continue
        h = [by_date.get(d, {}).get(k) for d in iso]
        h[-1] = cur_n.get(k, h[-1]) if iso[-1] == last.isoformat() and k in cur_n else h[-1]
        recent = [v for i, v in enumerate(h) if (len(h) - 1 - i) < 30]
        med = median(recent)
        w, prof = week_profile(h, dows)
        s = [v or 0 for v in h[-SERIES_DAYS:]]
        items[k] = {"n": names.get(k, k), "id": ids_n.get(k, 0), "p": cur_n.get(k, 0), "m": int(round(med)) if med else 0,
                    "h": sum(1 for v in h if v), "w": w, "f": prof, "s": s}
    d0 = iso[-1 if len(iso) < SERIES_DAYS else -SERIES_DAYS]
    if len(iso) >= SERIES_DAYS:
        d0 = iso[-SERIES_DAYS]
    else:
        d0 = iso[0]
    return {"t": t, "ah": ah, "d0": d0, "last": iso[-1], "items": items}


def q(s): return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def to_lua(o):
    out = [f'-- Fichier généré par tools/build_prices_lua.py : ne pas modifier.', 'GringottsPrices = {',
           f' v=1, t={o["t"]}, ah={q(str(o["ah"]))}, d0={q(o["d0"])}, last={q(o["last"])},', ' items={']
    for k, it in o["items"].items():
        f = "nil" if not it["f"] else "{" + ",".join(f"{x:.4f}" for x in it["f"]) + "}"
        out.append(f'  [{q(k)}]={{n={q(it["n"])},id={it["id"]},p={it["p"]},m={it["m"]},h={it["h"]},w={it["w"]},f={f},s={{{",".join(map(str, it["s"]))}}}}},')
    out += [" },", "}", ""]
    return "\n".join(out)


def main():
    o = build(with_seed="--with-seed" in sys.argv)
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    path = args[0] if args else os.path.join(DATA, "Prices.lua")
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(to_lua(o))
    print(f"Prices.lua : {len(o['items'])} objets, séries sur {o['d0']} -> {o['last']}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
