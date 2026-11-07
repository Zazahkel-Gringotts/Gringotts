#!/usr/bin/env python3
"""Relevé des prix de l'HV (API Blizzard, WoW Forever) pour le dashboard Gringotts.

Lancé par GitHub Actions (.github/workflows/prix-hv.yml) à 8h, 12h et 19h (heure de Paris) ou à la demande.
Écrit dans data/ : api-public.json (derniers prix), pp-AAAA-MM-JJ.json (point du jour), ids.json (nom -> identifiant),
ids-introuvables.json, et ajoute le jour à index.json. Les prix de l'HV sont publics : fichiers non chiffrés.

Variables : BLIZZARD_CLIENT_ID, BLIZZARD_CLIENT_SECRET (secrets du repo) ; GT_AH (HV, défaut 110) ;
GITHUB_EVENT_NAME (schedule -> ne tourne que si le dernier créneau 8h/12h/19h n'a pas encore de relevé).
"""
import base64, json, os, sys, time, unicodedata, urllib.parse, urllib.request
from datetime import datetime
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
API = "https://eu.api.blizzard.com"
HOURS = (8, 12, 19)            # heure de Paris
RETRY_MISS_S = 3 * 86400


def norm(s):
    d = unicodedata.normalize("NFD", s)
    d = "".join(c for c in d if unicodedata.category(c) != "Mn")
    return d.replace("’", "'").replace("œ", "oe").replace("Œ", "oe").lower().strip()


def http(url, headers=None, data=None, timeout=120):
    req = urllib.request.Request(url, headers=headers or {}, data=data)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def load_json(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def save_json(path, obj):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1, sort_keys=True)
        f.write("\n")


def token(cid, sec):
    auth = base64.b64encode(f"{cid}:{sec}".encode()).decode()
    raw = http("https://oauth.battle.net/token", {"Authorization": "Basic " + auth}, b"grant_type=client_credentials")
    return json.loads(raw)["access_token"]


def seed_names():
    """Tous les noms d'objets suivis par le dashboard (données du repo)."""
    path = os.path.join(ROOT, "src", "seed.json")
    seed = load_json(path, {})
    names = set()
    for sec in ("hvStock", "pnj"):
        names.update(x["n"] for x in seed.get(sec, []))
    for c in seed.get("crafts", []):
        names.add(c["n"]); names.update(r[0] for r in c.get("r", []))
    for c in seed.get("ench", []):
        names.update(r[0] for r in c.get("r", []))
    return sorted(n for n in names if n)


def search_ids(tok, name):
    uri = (f"{API}/data/wow/search/item?namespace=static-forever-eu&locale=fr_FR&orderby=id&_pageSize=1000&name.fr_FR="
           + urllib.parse.quote(name))
    js = json.loads(http(uri, {"Authorization": "Bearer " + tok}))
    want = norm(name)
    return [int(r["data"]["id"]) for r in js.get("results", []) if norm(str((r["data"].get("name") or {}).get("fr_FR", ""))) == want]


def main():
    event = os.environ.get("GITHUB_EVENT_NAME", "")
    paris = datetime.now(ZoneInfo("Europe/Paris"))
    if event == "schedule":
        # GitHub retarde souvent les crons : on ne vise pas une heure exacte, on rattrape le dernier créneau du jour non encore servi.
        slots = [h for h in HOURS if h <= paris.hour]
        if not slots:
            print(f"Heure de Paris {paris:%H:%M} : avant le premier créneau {HOURS[0]} h, rien à faire.")
            return 0
        slot = paris.replace(hour=max(slots), minute=0, second=0, microsecond=0).timestamp()
        last = 0
        try:
            last = int(open(os.path.join(DATA, "api-public.json"), encoding="utf-8").readline().split(";")[1])
        except Exception:
            pass
        if last >= slot:
            print(f"Créneau {max(slots)} h déjà servi (dernier relevé {datetime.fromtimestamp(last, ZoneInfo('Europe/Paris')):%H:%M}), rien à faire.")
            return 0
    cid, sec = os.environ.get("BLIZZARD_CLIENT_ID", "").strip(), os.environ.get("BLIZZARD_CLIENT_SECRET", "").strip()
    if not cid or not sec:
        print("Secrets BLIZZARD_CLIENT_ID / BLIZZARD_CLIENT_SECRET absents.", file=sys.stderr)
        return 1
    ah = os.environ.get("GT_AH", "").strip() or "110"
    tok = token(cid, sec)

    # Annonces de l'HV : prix unitaire minimal par identifiant d'objet
    body = http(f"{API}/data/wow/ruleset/1/auctions/{ah}/commodities?namespace=dynamic-forever-eu&locale=fr_FR",
                {"Authorization": "Bearer " + tok}, timeout=300)
    mn = {}
    for a in json.loads(body).get("auctions", []):
        i, p = int(a["item"]["id"]), int(a["unit_price"])
        if i not in mn or p < mn[i]:
            mn[i] = p
    print(f"HV {ah} : {len(mn)} objets en vente.")

    # Identifiants : fichiers du repo + recherche par nom des objets inconnus (insensible aux accents)
    ids_path, miss_path = os.path.join(DATA, "ids.json"), os.path.join(DATA, "ids-introuvables.json")
    ids = load_json(ids_path, {})
    miss = load_json(miss_path, {})
    for extra in ("ids-pc.json", "ids-manuel.json"):         # ids publiés par le PC (objets vus en jeu), puis corrections manuelles
        ids.update({k: int(v) for k, v in load_json(os.path.join(DATA, extra), {}).items()})
    now = int(time.time())
    todo = [n for n in seed_names() if n not in ids and now - int(miss.get(n, 0)) > RETRY_MISS_S]
    found = errs = 0
    for n in todo:
        try:
            c = search_ids(tok, n)
        except Exception as e:                      # une erreur réseau n'arrête pas le relevé
            errs += 1
            if errs >= 5 and not found:
                print("Recherche d'identifiants abandonnée :", e, file=sys.stderr)
                break
            continue
        if c:
            in_ah = [i for i in c if i in mn]
            ids[n] = min(in_ah) if in_ah else min(c)
            found += 1
        else:
            miss[n] = now
    print(f"Identifiants : {len(todo)} recherchés, {found} trouvés, {errs} erreurs ; {len(ids)} connus.")
    save_json(ids_path, ids)
    save_json(miss_path, {k: v for k, v in miss.items() if k not in ids})

    # Prix : un par objet connu présent à l'HV
    lines = [f"P;{n};{mn[i]};;{i}" for n, i in sorted(ids.items()) if i in mn]
    if not lines:
        print("Aucun objet connu n'a d'annonce à l'HV.", file=sys.stderr)
        return 1
    day = paris.strftime("%Y-%m-%d")
    with open(os.path.join(DATA, "api-public.json"), "w", encoding="utf-8", newline="\n") as f:
        f.write(f"WFA1;{now};{ah};{len(lines)}\n" + "\n".join(lines) + "\n")
    with open(os.path.join(DATA, f"pp-{day}.json"), "w", encoding="utf-8", newline="\n") as f:
        f.write(f"WFC1;{now};API;{ah}\n" + "\n".join(lines) + "\n")
    idx_path = os.path.join(DATA, "index.json")
    idx = load_json(idx_path, {"days": []})
    days = sorted(set(idx.get("days", [])) | {day})
    with open(idx_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump({"t": now, "days": days}, f, separators=(",", ":"))
    print(f"Prix du {day} : {len(lines)} objets (HV {ah}).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
