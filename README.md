# Gringotts

Tableau de bord de pilotage des professions pour WoW Forever, alimenté par l'addon **Gringotts**.

- **Dashboard** : `index.html` (GitHub Pages). Un mot de passe déchiffre les données dans ton navigateur.
- **Addon** : `addon/Gringotts.zip` (v1.12.1), à décompresser dans `Interface\AddOns\`.
- **Envoi depuis Windows** : `tools/Installer.bat` (configuration, une fois) puis `tools/Envoyer.bat` (à chaque envoi).
- **Prix de l'HV par l'API Blizzard** : `tools/Prix-API.bat` (à lancer quand tu veux) récupère les prix de ton HV (n° 110 par défaut, `ah` dans `config.json`) et les envoie chiffrés dans `data/api.json`. Les identifiants Blizzard sont demandés une fois, puis mémorisés (chiffrés par Windows). `tools/Comparer-HV.bat` sert à identifier quelle HV correspond à ton marché.

## Circuit des données

```
WoW (scan Auctionator) → /reload → SavedVariables\Gringotts.lua
   → tu lances Envoyer.bat : chiffre, puis envoie vers data/*.json
   → dashboard (PC ou mobile) : bouton « Synchroniser », déchiffrement dans le navigateur
```

L'addon ne peut ni écrire de fichier ni joindre Internet : les données n'arrivent sur disque qu'au `/reload` ou à la déconnexion. À l'Hôtel des ventes, le bouton **Sync Gringotts** (ou `/gt sync`) prépare l'export et préremplit `/reload` dans le chat : appuie sur Entrée. WoW interdit à un addon de recharger l'interface lui-même. À la fin d'un scan complet, l'addon peut aussi proposer cette préparation (fenêtre « Préparer »).

## Retour vers le jeu (décisions du dashboard)

Bouton **→ Envoyer à l'addon** (menu de gauche, ou Comptoir, étape 5) : le dashboard écrit `Dash.lua` dans `Interface\AddOns\Gringotts` (Chrome ou Edge sur PC, accès au dossier demandé une fois). Au `/reload` suivant, l'addon applique les décisions : composants réservés, infobulles, listes Auctionator, envois entre persos.

Si le navigateur refuse le dossier (WoW dans `Program Files`, par exemple) : bouton **Télécharger Dash.lua** puis double-clic sur `tools/Appliquer.bat`, qui copie le fichier au bon endroit. Le copier-coller via `/gt import` reste possible.

## Installation

1. **Addon** : remplace le dossier `Gringotts` d'`Interface\AddOns\` par celui de `addon/Gringotts.zip`.
2. **Jeton GitHub** (une fois) : GitHub → Settings → Developer settings → Personal access tokens → *Fine-grained tokens* → *Generate new token*.
   - Resource owner : l'organisation `Zazahkel-Gringotts`.
   - Repository access : *Only select repositories* → `Gringotts`.
   - Permissions → *Contents* : **Read and write**. Rien d'autre.
3. **Script** : télécharge `tools/Gringotts-Sync.ps1`, `tools/Installer.bat`, `tools/Envoyer.bat` et `tools/Appliquer.bat` dans le même dossier, puis double-clique `Installer.bat`. Il demande le dossier WoW (détecté si possible), le jeton, et le mot de passe du dashboard, puis fait un premier envoi. Rien ne tourne en arrière-plan.
   - À chaque envoi ensuite : joue, déconnecte-toi (addon 1.12.5 : l'export est écrit à la déconnexion) ; au début de la session suivante, double-clique `Routine.bat` (= `Envoyer.bat` puis `Prix-API.bat`) pour les prix de l'HV (au premier lancement il cherche aussi par nom les identifiants des objets inconnus de l'addon, résultat dans `%APPDATA%\GringottsSync\items-last.txt`). `/gt sync` + `/reload` reste le secours.
4. **Dashboard** : ouvre le site, saisis le même mot de passe. Il est retenu sur l'appareil si la case est cochée.

## Sécurité : ce que le repo public expose

| Public | Chiffré (illisible sans le mot de passe) |
|---|---|
| Code du dashboard et de l'addon, dates des exports, tailles de fichiers | Prix, stocks, recettes, niveaux, or, ventes, achats |

- Chiffrement : gzip, AES-256-CBC + HMAC-SHA256, clé dérivée du mot de passe par PBKDF2-SHA256 (200 000 itérations). Le mot de passe ne quitte jamais l'appareil.
- Un mot de passe faible peut être retrouvé par force brute hors ligne : prends une phrase longue (4 mots ou plus).
- Changer de mot de passe : relance `Installer.bat`. Les anciens fichiers restent dans l'historique Git, chiffrés avec l'ancien mot de passe.
- Le mot de passe retenu est stocké en clair dans le stockage local du navigateur de l'appareil. Ne coche pas la case sur un appareil partagé.
- Le jeton GitHub reste sur ton PC, chiffré par Windows pour ton compte (DPAPI). Il ne donne accès qu'à ce repo.

## Développement

`src/` contient les sources, `python3 -I build.py` assemble `index.html`.

## Relevé automatique des prix (19h30)

`Planifier-HV.bat` crée la tâche Windows « Gringotts - Prix HV » : chaque jour à 19h30 (rattrapage au réveil du PC), elle lance `Gringotts-Sync.ps1 -Prices -Auto` sans fenêtre. Le prix du jour est écrit dans l'historique (`data/p-AAAA-MM-JJ.json`) ; le dashboard le récupère à sa prochaine synchro. Prérequis : avoir lancé `Prix-API.bat` une fois (identifiants Blizzard). Résultat de chaque passage dans `%APPDATA%\GringottsSync\sync.log`. `Deplanifier-HV.bat` supprime la tâche.
