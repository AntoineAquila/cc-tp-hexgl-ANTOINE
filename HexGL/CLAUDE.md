# HexGL — notes pour Claude

Jeu WebGL statique (pas de package.json, pas de build). Architecture : `docs/architecture.md`.

## Lancer le jeu
`npx --yes http-server . -p 8080 -c-1` depuis `HexGL/`, puis http://localhost:8080/ (skill `/run-hexgl`).

## Branding de l'écran d'accueil (ACME)
Tout est dans `branding.js` (textes, logo, couleurs ; `window.BRANDING` + `applyBranding`), style dans `css/branding.css` (variables `--brand-*`), logo dans `branding/`. `launch.js` et `multi.css` ne sont pas modifiés.
## Tests (QUnit, sans Node)
- Commande Windows : `cmd /c ".\ci-chrome.bat < nul"` depuis `formation/tests/` (PowerShell). Linux : `bash HexGL/formation/tests/ci-chrome.sh` depuis la racine du dépôt.
- Codes de sortie : 0 = réussi, 1 = échec (voir `rapport_erreur.html`), 2 = impossible (Chrome/Edge introuvable).
- Manuel : ouvrir `formation/tests/index.html` (ou via le serveur ci-dessus).
- Tests dans `formation/tests/browser-tests.js` ; scripts testés chargés dans `formation/tests/index.html` (`Utils.js`, `Timer.js`). Un nouveau module testé = une balise `<script>` à ajouter.
- Ne pas lancer `ci-chrome.bat` depuis Git Bash via `cmd.exe /c` sans `< nul` : le processus reste en attente.

## Captures de référence
`formation/tests/captures/` : `01-accueil.png` (menu), `02-jeu-en-cours.png` (course, HUD, « GET READY », tour 1/3). Faites avec les outils Playwright MCP (voir `/run-hexgl`). Servent de comparaison visuelle manuelle ; il n'y a pas de comparaison automatique.
