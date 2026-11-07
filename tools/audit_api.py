#!/usr/bin/env python3
"""Audit des données de jeu : interroge l'API Blizzard (namespace static-forever-eu) et écrit data/audit/*.json.
 - items.json   : pour chaque id connu : nom, qualité, catégorie, max_count (taille de pile), prix de vente/d'achat PNJ, niveau requis
 - recipes.json : métiers -> recettes -> composants (quantités) et objet produit
 - erreurs.json : réponses d'erreur (pour adapter le script si la structure diffère)
Lancé par GitHub Actions (.github/workflows/audit-api.yml) ; stdlib uniquement."""
import json, os, sys, time, urllib.parse
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import prix_hv as ph

NS = "static-forever-eu"
errors = []


def get(tok, path, extra=""):
    url = f"{ph.API}{path}?namespace={NS}&locale=fr_FR{extra}"
    for i in range(3):
        try:
            return json.loads(ph.http(url, {"Authorization": "Bearer " + tok}))
        except Exception as e:
            code = getattr(e, "code", None)
            if code in (404, 400, 403):
                errors.append({"path": path, "code": code}); return None
            time.sleep(1 + i)
    errors.append({"path": path, "code": "retry"}); return None


def name_of(x):
    n = x.get("name") if isinstance(x, dict) else None
    return n.get("fr_FR") if isinstance(n, dict) else n


def item_info(tok, iid):
    d = get(tok, f"/data/wow/item/{iid}")
    if not d: return iid, None
    return iid, {"name": name_of(d), "quality": (d.get("quality") or {}).get("type"), "level": d.get("level"),
                 "required_level": d.get("required_level"), "class": name_of(d.get("item_class") or {}),
                 "subclass": name_of(d.get("item_subclass") or {}), "inventory": (d.get("inventory_type") or {}).get("type"),
                 "max_count": d.get("max_count"), "stackable": d.get("is_stackable"),
                 "sell_price": d.get("sell_price"), "purchase_price": d.get("purchase_price")}


def main():
    cid, sec = os.environ["BLIZZARD_CLIENT_ID"].strip(), os.environ["BLIZZARD_CLIENT_SECRET"].strip()
    tok = ph.token(cid, sec)
    out = os.path.join(ph.DATA, "audit"); os.makedirs(out, exist_ok=True)
    ids = {}
    for f in ("ids.json", "ids-pc.json", "ids-manuel.json"):
        for n, i in ph.load_json(os.path.join(ph.DATA, f), {}).items():
            if isinstance(i, int) and i > 0: ids[n] = i
    uniq = sorted(set(ids.values()))
    print("items :", len(uniq))
    with ThreadPoolExecutor(12) as ex:
        items = dict(ex.map(lambda i: item_info(tok, i), uniq))
    ph.save_json(os.path.join(out, "items.json"), {"names": ids, "items": {str(k): v for k, v in items.items() if v}})
    # --- métiers et recettes ---
    recipes = {}
    idx = get(tok, "/data/wow/profession/index") or {}
    for p in idx.get("professions", []):
        pid = p["id"]; pd = get(tok, f"/data/wow/profession/{pid}") or {}
        entry = {"name": name_of(p), "tiers": []}
        for t in pd.get("skill_tiers", []):
            td = get(tok, f"/data/wow/profession/{pid}/skill-tier/{t['id']}") or {}
            rids = [r["id"] for c in td.get("categories", []) for r in c.get("recipes", [])]
            entry["tiers"].append({"name": name_of(t), "recipes": rids})
        recipes[str(pid)] = entry
    allr = sorted({r for e in recipes.values() for t in e["tiers"] for r in t["recipes"]})
    print("recettes :", len(allr))

    def rec(rid):
        d = get(tok, f"/data/wow/recipe/{rid}")
        if not d: return rid, None
        def qty(q): return q if not isinstance(q, dict) else q
        return rid, {"name": name_of(d), "reagents": [{"id": (r.get("reagent") or {}).get("id"), "name": name_of(r.get("reagent") or {}), "q": r.get("quantity")} for r in d.get("reagents", [])],
                     "crafted": {"id": (d.get("crafted_item") or {}).get("id"), "name": name_of(d.get("crafted_item") or {})},
                     "crafted_quantity": d.get("crafted_quantity")}
    with ThreadPoolExecutor(12) as ex:
        rd = dict(ex.map(rec, allr))
    ph.save_json(os.path.join(out, "recipes.json"), {"professions": recipes, "recipes": {str(k): v for k, v in rd.items() if v}})
    ph.save_json(os.path.join(out, "erreurs.json"), errors[:200])
    print("erreurs :", len(errors))
    return 0


if __name__ == "__main__":
    sys.exit(main())
