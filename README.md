# Gringotts

Tableau de bord de pilotage des professions pour WoW Forever, alimenté par l'addon **Gringotts**.

- **Dashboard** : `index.html` (GitHub Pages). Un mot de passe déchiffre les données dans ton navigateur.
- **Addon** : `addon/Gringotts.zip` (v1.10.0), à décompresser dans `Interface\AddOns\`.
- **Envoi depuis Windows** : `tools/Installer.bat` (configuration, une fois) puis `tools/Envoyer.bat` (à chaque envoi).

## Circuit des données

```
WoW (scan Auctionator) → /reload → SavedVariables\Gringotts.lua
   → tu lances Envoyer.bat : chiffre, puis envoie vers data/*.json
   → dashboard (PC ou mobile) : bouton « Synchroniser », déchiffrement dans le navigateur
```

L'addon ne peut ni écrire de fichier ni joindre Internet : les données n'arrivent sur disque qu'au `/reload` ou à la déconnexion. À la fin d'un scan complet, l'addon propose de recharger l'interface (fenêtre « Recharger »). Sinon : `/gt sync` puis `/reload`.

## Installation

1. **Addon** : remplace le dossier `Gringotts` d'`Interface\AddOns\` par celui de `addon/Gringotts.zip`.
2. **Jeton GitHub** (une fois) : GitHub → Settings → Developer settings → Personal access tokens → *Fine-grained tokens* → *Generate new token*.
   - Resource owner : l'organisation `Zazahkel-Gringotts`.
   - Repository access : *Only select repositories* → `Gringotts`.
   - Permissions → *Contents* : **Read and write**. Rien d'autre.
3. **Script** : télécharge `tools/Gringotts-Sync.ps1`, `tools/Installer.bat` et `tools/Envoyer.bat` dans le même dossier, puis double-clique `Installer.bat`. Il demande le dossier WoW (détecté si possible), le jeton, et le mot de passe du dashboard, puis fait un premier envoi. Rien ne tourne en arrière-plan.
   - À chaque envoi ensuite : scan en jeu, `/reload`, puis double-clique `Envoyer.bat`.
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
