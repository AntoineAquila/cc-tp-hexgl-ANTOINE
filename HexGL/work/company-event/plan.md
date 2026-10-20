# Plan — Branding ACME de l'écran d'accueil HexGL

## Objectif
Appliquer l'identité ACME (logo, palette, nom, message d'accueil, bouton) à l'écran d'accueil (`#step-1`) uniquement, via **un seul point de configuration**, sans toucher au gameplay, à `launch.js`/`launch.coffee`, ni ajouter Node, build ou dépendance. Référence : `work/company-event/spec.md`.

## État actuel et architecture concernée
- `index.html` : `#step-1` = `#global` (fond `bg.jpg`, animé), `#title` (`title.png`, animé), `#menu` (`#start`, `#s-controlType`, `#s-quality`, `#s-hud`, `#s-godmode` masqué, `#s-credits`). `<title>` = « HexGL by BKcore ».
- `css/multi.css` : couleurs BKcore en dur (`#4190bb`, `#f66439`, `#f8854b`), police Bebas Neue, bandeau blanc dégradé + `text-shadow` + `scaleY(0.8)` sur `#menu div`.
- `launch.js` (CoffeeScript généré, source `.coffee` non recompilée) : écrit `innerHTML` des options `#s-*` et du `#start` uniquement en cas d'absence de WebGL ; masque/affiche `#step-1` en `display`. **Il n'est pas modifié** : éditer le JS généré sans le `.coffee` créerait une divergence.
- Tests : QUnit dans `formation/tests/` (`index.html` charge `Utils.js`, `Timer.js` ; `browser-tests.js`), lancés par `ci-chrome.bat` (voir `CLAUDE.md`).

## Approche technique
Surcharge additive, réversible : on ne réécrit pas `multi.css`, on ajoute une couche.
1. **`branding.js`** (nouveau, script classique ES5 comme le reste) : contient la config `window.BRANDING` **et** une petite fonction `applyBranding(config, doc)` appelée au chargement. Elle pose les couleurs en variables CSS sur `:root`, renseigne `document.title`, le logo (`src`/`alt`), le titre, le sous-texte et le libellé du bouton Start.
2. **`css/branding.css`** (nouveau, chargé après `multi.css`) : masque `#title` et le fond image de `#global`, supprime les animations, fond `var(--brand-bg)`, carte blanche pour le logo, titre en sans-serif gras, bouton `#start` en pilule violette, options restylées (retire bandeau blanc, `text-shadow`, `scaleY`), responsive. Toutes les couleurs via `var(--brand-*)` : aucune valeur hex dans ce fichier.
3. **`index.html`** : ajouter dans `#step-1` un bloc de marque (conteneur + `<img>` logo, `<h1>`, `<p>` sous-texte) vide, rempli par `branding.js` ; ajouter `<link>` branding.css et `<script src="branding.js">` avant `launch.js`.
4. **Logo** : copier `formation/identite/logo.png` vers `branding/acme-logo.png` (le dossier `formation/` reste du matériel de TP ; le jeu ne doit pas en dépendre). Fichier non modifié.

## Structure des données de branding
```js
window.BRANDING = {
  name: 'ACME',
  pageTitle: 'ACME Racing Challenge',
  logo: { src: 'branding/acme-logo.png', alt: 'ACME' },
  welcome: 'Bienvenue au ACME Racing Challenge',
  subtitle: 'Une expérience événementielle aux couleurs de la marque.',
  startLabel: 'DÉMARRER LA COURSE',
  colors: { bg: '#08090D', violet: '#7628FF', blue: '#315BFF', cyan: '#00C4E8',
            text: '#FFFFFF', surface: '#E6E8EE' }
};
```
Changer d'événement = éditer ce seul fichier (+ remplacer le logo). Pas de backend ni d'upload.

## Fichiers et modules impactés
| Fichier | Action |
|---|---|
| `branding.js` | nouveau (config + applier) |
| `css/branding.css` | nouveau |
| `branding/acme-logo.png` | nouveau (copie du logo) |
| `index.html` | `<title>` initial, bloc marque dans `#step-1`, 1 `<link>`, 1 `<script>` |
| `formation/tests/index.html` | +1 `<script src="../../branding.js">` |
| `formation/tests/browser-tests.js` | +module de tests de `applyBranding` (**attention : ces 2 fichiers ont déjà des modifications non commitées**, ajouter sans toucher à l'existant) |
| `formation/tests/captures/03-accueil-acme.png` | nouvelle capture de référence |
| `launch.js`, `launch.coffee`, `bkcore/**`, `multi.css` | **inchangés** |

## Décisions techniques principales
- **JS + CSS variables** plutôt que 100 % CSS : seul moyen d'avoir un point de config unique incluant textes et titre d'onglet, sans build.
- **`branding.css` additif** plutôt qu'éditer `multi.css` : retour arrière = retirer 2 balises.
- **Police existante conservée** (Bebas Neue, tolérée par la charte « legacy ») pour les options ; titre/message en pile sans-serif système gras ; aucune webfont ajoutée.
- **Applier testable** : fonction pure prenant `(config, doc)`, donc testable avec QUnit sans WebGL.
- Les libellés `#s-*` restent gérés par `launch.js` (aucun conflit : l'applier ne les touche pas). Le message « WebGL is not supported! » de `#start` écrase le libellé ACME comme avant.
- Métadonnées `og:*`, favicon, analytics, crédits BKcore : inchangés (hors périmètre).

## Risques et compatibilité
- **Ordre de chargement** : `branding.js` doit s'exécuter après le DOM de `#step-1` ; le placer avec les autres scripts en fin de `<body>`. Si le JS échoue, l'accueil n'aurait pas de textes/couleurs → l'applier doit être défensif (éléments absents ignorés) et `branding.css` ne doit rien masquer d'essentiel sans JS.
- **Spécificité CSS** : `#menu div` a beaucoup de déclarations (dont des préfixes anciens, `scaleY`) ; la surcharge doit être vérifiée visuellement (survol inclus). Le bug connu de `launch.js` sur les paramètres d'URL (chaînes) n'est pas corrigé, pas aggravé.
- **Logo à fond blanc** sur fond sombre → carte blanche obligatoire ; ne jamais recolorer/étirer (hauteur auto, `max-width`).
- **Fichiers de tests déjà modifiés localement** : risque de mélanger avec des changements existants ; vérifier `git diff` avant d'ajouter.
- Pas de commit pendant l'implémentation (commit après validation finale).
- Chargement local : `file://` fonctionne pour l'accueil, mais utiliser le serveur HTTP pour le jeu (XHR/textures).

## Stratégie de tests et de vérification
- **Lancement** (sans Node) : PHP est disponible (`C:\xampp8\php\php.exe`) → `php -S localhost:8080 -t .` depuis `HexGL/`. Alternative : `python -m http.server 8080` (à vérifier : `python.exe` détecté est peut-être le raccourci Microsoft Store). Pas de `npx` (le `CLAUDE.md` cite `http-server` mais la contrainte actuelle l'exclut).
- **Tests QUnit** : commande documentée du `CLAUDE.md` — `cmd /c ".\ci-chrome.bat < nul"` depuis `formation/tests/` ; attendu code 0. Nouveaux tests : `applyBranding` pose le titre, le logo (`src`/`alt`), le message exact, le libellé du bouton, les variables CSS ; ignore sans erreur un DOM incomplet. Le seuil `count >= 4` reste respecté.
- **Vérif navigateur** (Playwright MCP ou manuel) : accueil à ~1920 px et ~375 px ; parcours Start → commandes → « GET READY » + HUD (comparaison avec `02-jeu-en-cours.png`) ; options et `?quality=`/`?hud=` ; Credits aller-retour ; console (≤ 10 avertissements existants) ; onglet réseau sans nouvelle requête externe ; logo masqué → `alt` « ACME » lisible.
- Aucune comparaison de captures automatique (non existante).

## Plan d'implémentation (4 étapes, sans commit)
1. **Serveur + base de référence** : lancer `php -S`, lancer les tests QUnit (attendu 0), capturer l'accueil actuel. *Vérif : serveur répond, tests verts, console de base notée.*
2. **Config + applier** : créer `branding/acme-logo.png`, `branding.js`, bloc de marque et balises dans `index.html`, tests QUnit correspondants (+ balise dans `formation/tests/index.html`). *Vérif : QUnit code 0 ; l'accueil affiche titre d'onglet, textes, logo (non stylé).*
3. **Style** : créer `css/branding.css` (fond sombre, carte logo, titre, bouton, options, responsive, masquage BKcore). *Vérif : captures desktop + mobile ; plus aucune couleur/image BKcore ; survol correct.*
4. **Non-régression et validation finale** : parcours complet jusqu'à la course, cas limites (logo absent, sans WebGL si simulable, URL params, crédits), QUnit, réseau/console, ajouter `03-accueil-acme.png` et mettre à jour `CLAUDE.md`/`docs/architecture.md` si pertinent. *Vérif : critères CA1–CA13 de la spec. Puis demande de validation avant tout commit.*
