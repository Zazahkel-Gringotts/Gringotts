#!/usr/bin/env python3
"""Aligne src/seed.json sur les recettes réelles de WoW Forever (data/audit/recipes.json, produit par audit_api.py).
Usage : python3 tools/sync_seed_api.py <recipes.json> <seed.json> <ids-manuel.json> [rapport.json] [items.json]
- remplace les composants (noms + quantités) des recettes dont le nom existe dans l'API ;
- renomme les recettes dont le nom était faux (RENAME) ;
- écrit dans ids-manuel.json les identifiants des composants / produits vus dans les recettes (prix API)."""
import json, re, sys, unicodedata

RENAME = {"Breuvage de sens de prédateur": "Potion de sens de prédateur", "Éclat de troll magnifique": "Encaustique troll magnifique",
          "Sceau des eaux fluides": "Cachet des eaux courantes", "Parchemin de réparation spatiale": "Parchemin de guérison spatiale",
          "Sceau de l'innovation": "Cachet d'innovation", "Enduit de bouclier conducteur": "Revêtement de bouclier conducteur"}
# recettes absentes de l'API (n'existent pas dans Forever : les versions « 2M » n'existent que pour l'arme à une main)
REMOVE = ["Ench. d'arme 2M (Pouvoir de guérison majeur)", "Ench. d'arme 2M (Puissance des sorts majeure)", "Ench. d'arme 2M (Force)",
          "Ench. d'arme 2M (Force inférieure)", "Ench. d'arme 2M (Agilité inférieure)"]


def norm(s):
    d = unicodedata.normalize("NFD", s or "")
    d = "".join(c for c in d if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", d.replace("’", "'").replace("œ", "oe").replace("\xa0", " ").lower()).strip()


def variants(n):
    k = norm(n); out = [k]
    out.append(k.replace("ench. de", "enchantement de")); out.append(k.replace("enchantement de", "ench. de"))
    out.append(k.replace("bracelets", "brassards")); out.append(k.replace("brassards", "bracelets"))
    out += [x.replace("ench. d'", "enchantement d'") for x in list(out)] + [x.replace("enchantement d'", "ench. d'") for x in list(out)]
    out += [x.replace(" 2m (", " a deux mains (") for x in list(out)] + [x.replace(" a deux mains (", " 2m (") for x in list(out)]
    return list(dict.fromkeys(out))


def main(rec_p, seed_p, ids_p, rep_p=None, items_p=None):
    rc = json.load(open(rec_p, encoding="utf-8"))["recipes"]
    seed = json.load(open(seed_p, encoding="utf-8"))
    by = {}
    byc = {}                                             # repli : par nom du produit (ex. « Barre de bronze » = recette « Fonte du bronze »)
    for r in rc.values():
        by.setdefault(norm(r["name"]), []).append(r)
        if r.get("crafted") and r["crafted"].get("name"): byc.setdefault(norm(r["crafted"]["name"]), []).append(r)
    known = {}                                           # norm(nom) -> graphie déjà utilisée dans le seed
    for sec in ("hvStock", "pnj"):
        for x in seed[sec]: known[norm(x["n"])] = x["n"]
    for sec in ("crafts", "ench"):
        for c in seed[sec]:
            known[norm(c["n"])] = c["n"]
            for n, _ in c["r"]: known[norm(n)] = n
    rep = {"renamed": [], "changed": [], "same": 0, "absent": [], "removed": REMOVE}
    ids = {}
    try: ids = json.load(open(ids_p, encoding="utf-8"))
    except Exception: pass
    seed.setdefault("renames", {})
    rm = {norm(x) for x in REMOVE}
    for sec in ("crafts", "ench"):
        seed[sec] = [c for c in seed[sec] if norm(c["n"]) not in rm]
    seed["recipes"] = [r for r in seed["recipes"] if norm(r["n"]) not in rm]
    for r in seed["recipes"]:
        if r["n"] in RENAME: r["n"] = RENAME[r["n"]]
    for sec in ("crafts", "ench"):
        for c in seed[sec]:
            old = c["n"]
            if old in RENAME:
                c["n"] = RENAME[old]; rep["renamed"].append([old, c["n"]]); seed["renames"][sec[:-1] + ":" + norm(old)] = sec[:-1] + ":" + norm(c["n"])
            cand = None
            for v in variants(c["n"]):
                if v in by: cand = by[v]; break
            if not cand: cand = byc.get(norm(c["n"]))
            if not cand: rep["absent"].append(c["n"]); continue
            mine = {norm(n) for n, _ in c["r"]}
            r = max(cand, key=lambda r: len(mine & {norm(x["name"]) for x in r["reagents"]}))
            new = []
            for x in r["reagents"]:
                nm = x["name"] or ""; k = norm(nm)
                new.append([known.get(k, nm.replace("\xa0", " ")), x["q"]])
                if x.get("id"): ids.setdefault(known.get(k, nm.replace("\xa0", " ")), x["id"])
            cr = r.get("crafted") or {}
            if cr.get("id") and cr.get("name"): ids.setdefault(known.get(norm(cr["name"]), cr["name"].replace("\xa0", " ")), cr["id"])
            if sorted((norm(a), q) for a, q in new) == sorted((norm(a), q) for a, q in c["r"]): rep["same"] += 1
            else:
                rep["changed"].append({"n": c["n"], "old": c["r"], "new": new}); c["r"] = new
    if items_p:                                          # prix de revente PNJ (cuivre -> or) : seed["sell"][nom] ; sert à comparer HV net de taxe / PNJ
        it = json.load(open(items_p, encoding="utf-8"))
        sell = {}
        for n, i in it["names"].items():
            v = (it["items"].get(str(i)) or {}).get("sell_price")
            if v: sell[n] = round(v / 10000, 6)
        seed["sell"] = dict(sorted(sell.items()))
        rep["sell"] = len(sell)
    json.dump(seed, open(seed_p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(ids, open(ids_p, "w", encoding="utf-8", newline="\n"), ensure_ascii=False, indent=1, sort_keys=True)
    if rep_p: json.dump(rep, open(rep_p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("renommées", len(rep["renamed"]), "| modifiées", len(rep["changed"]), "| identiques", rep["same"], "| absentes de l'API", len(rep["absent"]))
    return rep


if __name__ == "__main__":
    main(*sys.argv[1:])
