# HexGL — Architecture (état actuel)

Document descriptif de l'état du dépôt `HexGL/` tel qu'observé. Il ne contient ni recommandation ni plan de correction.

## 1. Stack et points d'entrée

- **Type** : jeu de course futuriste, site statique 100 % côté navigateur (HTML5 / JavaScript / WebGL). Pas de `package.json`, pas d'étape de build, pas de backend.
- **Rendu 3D** : Three.js version « dev » ancienne (`libs/Three.dev.js`, API `lerpSelf`, `mat.n44`, `texture` sur les uniforms). `libs/Three.r53.js` est présent mais seulement référencé par `bkcore.coffee/tests.html`. Post-traitement via `libs/postprocessing/*` (EffectComposer, RenderPass, BloomPass, ShaderPass, MaskPass) et `libs/ShaderExtras.js`.
- **Autres libs** : `Detector.js`, `Stats.js`, `DAT.GUI.min.js`, `leap-0.4.1.min.js` (Leap Motion), `Editor.html` + `Editor_files/` (éditeur tiers embarqué, non utilisé par le jeu).
- **Langages** : JavaScript ES5 à la main (`bkcore/`), JavaScript généré depuis CoffeeScript 1.4/1.7 (`bkcore.coffee/*.js` et `launch.js`), sources `.coffee` conservées à côté.
- **Distribution annexes** : `manifest.webapp` + `package.webapp` (Firefox OS, `launch_path` = `/index-mobile.html`), `cache.appcache` (v1.0.1-ffos), `package.zip`, icônes.
- **Serveur de dev** : le README indique `python -m SimpleHTTPServer` ; dans cette session le projet est servi avec `npx http-server . -p 8080 -c-1`. Les `.claude/` et `.playwright-mcp/` sont non suivis par git.

**Points d'entrée**

| Fichier | Rôle |
|---|---|
| `index.html` | Page unique du jeu : structure des étapes (`#step-1` à `#step-5`, `#credits`, `#leapinfo`) et chargement séquentiel des scripts. |
| `launch.js` (source : `launch.coffee`) | Script de lancement : menu, options, création de `bkcore.hexgl.HexGL`, chargement et démarrage. |
| `branding.js` | Point unique de personnalisation de l'écran d'accueil : config `window.BRANDING` (textes, logo, couleurs) et `applyBranding(config, doc)`. Associés : `css/branding.css`, `branding/acme-logo.png`. |
| `formation/tests/index.html` | Page de tests QUnit (voir §6). |
| `bkcore.coffee/tests.html` | Page de test historique (charge `Timer.js`, `ImageData.js`, `Three.r53.js`, sans framework de test). |

## 2. Flux principal de lancement

1. `index.html` charge les libs, puis les modules `bkcore.*`, puis `branding.js`, puis `launch.js` en dernier. `branding.js` applique l'identité ACME à l'accueil : titre d'onglet, bloc `#brand` (logo, message, sous-texte), libellé de `#start` et variables CSS `--brand-*` sur `:root`. Il ne s'exécute seul que si `#step-1` existe (sinon, par exemple sur la page de tests, il ne touche à rien).
2. `launch.js` définit les options du menu `[controlType, quality, hud, godmode]` (valeurs par défaut : clavier ou tactile selon `isTouchDevice()`, qualité 3 « VERY HIGH », HUD 1). Chaque valeur peut être surchargée par un paramètre d'URL via `bkcore.Utils.getURLParameter`. Le menu `godmode` est masqué (`display:none`).
3. Détection WebGL (`hasWebGL`). Sans WebGL, le bouton Start devient « WebGL is not supported! » et redirige vers `get.webgl.org` ; ce texte remplace alors le libellé posé par `branding.js`.
4. Clic sur `#start` : `#step-1` masqué, `#step-2` affiché avec l'image d'aide `css/help-<controlType>.png`.
5. Clic sur `#step-2` : `#step-3` (barre de progression) affiché, appel de `init(...)`.
6. `init` crée `new bkcore.hexgl.HexGL({... track: 'Cityscape', difficulty: 0 ...})` (le constructeur appelle `initRenderer()` et enregistre Échap → `reset()`), l'expose sur `window.hexGL`, puis `hexGL.load(...)`.
7. `HexGL.load` délègue à `bkcore.hexgl.tracks.Cityscape.load` : chargement des textures, géométries (`geometries/**`) et sons (`audio/*.ogg`) via `bkcore.threejs.Loader`. `textures/` ou `textures.full/` selon la qualité.
8. `onLoad` : `HexGL.init()` (HUD, matériaux, scènes, composer), `#step-3` masqué, `#step-4` affiché, `HexGL.start()`.
9. `start()` lance la boucle `requestAnimationFrame` (`update` → `Gameplay.update` + `RenderManager.renderCurrent`) puis `initGameplay()` : crée `Gameplay`, `start()`, musique `bg` et `wind`.
10. `Gameplay.update` : compte à rebours « Get ready / 3 / 2 / 1 / Go », puis mode `timeattack` (3 tours, checkpoints lus dans une image de collision), fin → `onFinish` → `ShipControls.terminate()` et `HexGL.displayScore()`.
11. `displayScore` : comme `launch.js` fournit `gameover: $('step-5')`, la fonction affiche le temps dans `#step-5` et masque le conteneur de jeu, puis retourne. Clic sur `#step-5` → `window.location.reload()`.

Vérifié dans le navigateur : menu → START → écran des commandes → écran « GET READY » avec HUD (tour 1/3), sans erreur console (10 avertissements). Reverifié avec l'accueil ACME (bouton « DÉMARRER LA COURSE »), résultat identique ; l'accueil seul n'émet aucun avertissement.

## 3. Modules, fichiers et assets

### `bkcore/` (JS écrit à la main, namespace global `bkcore`)

| Fichier | Lignes | Rôle |
|---|---|---|
| `hexgl/HexGL.js` | 446 | Orchestrateur : options, renderer, HUD, composer, boucle, score, reset. |
| `hexgl/Gameplay.js` | 230 | Machine à états de course (compte à rebours, tours, checkpoints, fin). Modes `timeattack`, `survival` (déclaré, sans implémentation), `replay`. |
| `hexgl/ShipControls.js` | 806 | Physique du vaisseau, entrées (clavier, tactile, orientation, gamepad, Leap Motion), collisions via image, audio. Plus gros fichier du jeu. |
| `hexgl/ShipEffects.js` | 186 | Effets (particules, boost). |
| `hexgl/CameraChase.js` | 72 | Caméra de poursuite / orbite. |
| `hexgl/HUD.js` | 269 | HUD canvas (vitesse, bouclier, temps, tours, messages). |
| `hexgl/RaceData.js` | 98 | Enregistrement/lecture de trajectoires (replay). |
| `hexgl/Ladder.js` | 51 | Classement en ligne (non chargé par `index.html`). |
| `hexgl/tracks/Cityscape.js` | 521 | Seul circuit : listes d'assets par qualité, matériaux, scènes, spawn, checkpoints. |
| `threejs/RenderManager.js`, `Loader.js`, `Preloader.js`, `Particles.js`, `Shaders.js` | 131 / 259 / 150 / 190 / 949 | Aides Three.js : rendus nommés, chargeur d'assets, systèmes de particules, shaders GLSL. `Preloader.js` n'est pas chargé par `index.html`. |
| `Audio.js` | 141 | Audio Web Audio API (sons positionnels, `bg`, `wind`, `boost`, `crash`, `destroyed`). |

### `bkcore.coffee/` (CoffeeScript + JS généré)

`Timer`, `ImageData` (pixels de la carte de collision/checkpoints), `Utils` (matériau normal, projection écran, paramètres d'URL, `request` XHR, `isTouchDevice`…), `threejs/Particles`, `controllers/{Gamepad,Orientation,Touch}Controller`.

### Assets

- `textures/` (4,2 Mo, basse définition) et `textures.full/` (5,3 Mo, haute définition) ; sélection par chemin dans `Cityscape.js`. Le README demande d'échanger les deux dossiers pour la pleine taille.
- `geometries/` (1,3 Mo) : `ships/feisar`, `tracks/cityscape` (+ `edge/track.js` non référencé par le menu), `booster`, `bonus`. Format JSON Three.js.
- `audio/` (2,1 Mo) : 4 fichiers `.ogg` + `LICENSE`.
- `css/` : polices Bebas Neue, images d'aide `help-0..3.png`, images mobiles, `multi.css`, `fonts.css`, `touchcontroller.css`, et `branding.css` (chargé après `multi.css`, il le surcharge sans le modifier ; toutes ses couleurs viennent de `--brand-*`). `title.png` et `bg.jpg` ne s'affichent plus à l'accueil mais restent dans le dépôt.
- `branding/` : logo de l'événement (`acme-logo.png`, copie non modifiée de `formation/identite/logo.png`). Le jeu ne dépend pas de `formation/`.
- `replays/cityscape-casual/bkcore.replay.json` : donnée de replay, non référencée par le code (le replay lit `localStorage`).
- `formation/` : matériel de TP (charte ACME en PDF, logo, ticket `company-event.md`, tests).

## 4. Dépendances et zones legacy à risque

- **Three.js ancien** (r5x) sans mise à jour possible sans casser `Utils.projectOnScreen`, `RaceData` (`lerpSelf`, `slerpSelf`), `createNormalMaterial` (`uniforms.*.texture`), `Shaders.js`.
- **CoffeeScript généré** : deux versions de compilateur (1.4.0 et 1.7.1). Les `.js` sont committés avec leurs `.coffee` ; rien dans le dépôt ne les recompile. Modifier `launch.js` sans `launch.coffee` crée une divergence : le branding est donc fait à côté (`branding.js`), sans toucher à `launch.js`.
- **Surcharge CSS du branding** : `multi.css` définit `#menu div:hover` (spécificité plus forte que `#menu div`) et `#start:hover` avec `!important`. `branding.css` doit reprendre ces règles de survol (`transform`, couleur) ; sinon le `scaleY` et l'orange BKcore reviennent au survol.
- **Branding dépendant du JS** : sans `branding.js`, le bloc `#brand` est vide (seul le `alt` « ACME » du logo reste) et les variables `--brand-*` ne sont pas définies.
- **Ordre de chargement global** : tout passe par des variables globales (`bkcore`, `THREE`, `Leap`) et l'ordre des balises `<script>` de `index.html`. Aucun module ES, aucun bundler.
- **Dépendances réseau externes codées en dur** : Google Analytics (`UA-26274524-4`, `ga.js` ancien protocole), `hexgl.bkcore.com` (favicon, `og:image`, URLs de partage Twitter/Facebook), `get.webgl.org`, `fb:admins`. Le jeu fonctionne hors ligne pour le reste.
- **Navigateur** : dépend de WebGL (`webgl` / `experimental-webgl`), Web Audio, `localStorage`, gamepad/orientation selon le mode ; `Leap` (Leap Motion) requiert un serveur local externe.
- **Licences** : en-têtes des fichiers `bkcore/hexgl/*` indiquent CC BY-NC 3.0, le README indique MIT « sauf mention contraire ».
- **Fichiers résiduels** : `package.zip`, `libs/Editor.html` + `libs/Editor_files/` (jQuery 1.8, ace, kinetic…), textures « `cloud - Copie.png` » et « `spark - Copie.png` » (doublons), `cache.appcache` et `manifest.webapp` référant des fichiers FFOS (`index-mobile.html` est absent du dépôt).

## 5. Bugs, dettes et anomalies observés

Constatés à la lecture du code (non tous reproduits en exécution).

**Bugs de code**

1. `bkcore/hexgl/HexGL.js:228` — `JSON.Stringify` (majuscule) : `TypeError` si cette branche est exécutée.
2. `bkcore/hexgl/HexGL.js:221-228` — `t = this.track` est un objet ; les clés `localStorage` deviennent `score-[object Object]-casual`.
3. `bkcore/hexgl/HexGL.js:236, 273` — utilisent `bkcore.hexgl.Ladder`, dont le script n'est pas inclus dans `index.html` ; `Ladder.js` lui-même référence `bkcore.Ladder` (sans `.hexgl`) aux lignes 20, 36, 42. Aujourd'hui ce code n'est pas atteint : `launch.js` passe `gameover`, donc `displayScore` retourne avant.
4. `bkcore/hexgl/Gameplay.js:140` (mode replay) — `self.result.REPLAY` au lieu de `self.results.REPLAY` : `undefined`. Le mode `survival` est déclaré dans `modes` sans fonction associée (`this.modes[this.mode].call` échouerait).
5. `bkcore.coffee/Utils.js` — `request` : la boucle `createXMLHTTPObject` itère jusqu'à `i <= length` (accès hors tableau) et `url += "?" + qdata` est répété dans la boucle sur `data`. `Ladder.load` appelle `request("nothing", false, …)`.
6. `launch.js` — valeurs venant de l'URL (`?quality=2`, `?hud=0`) sont des chaînes ; `a[3] = (a[3] + 1) % length` concatène alors au lieu d'additionner au premier clic, et `hud === 1` (HUD) est faux pour la chaîne `"1"`.
7. `bkcore.coffee/Utils.js` — `getURLParameter` met en cache `URLParameters` sur la classe ; ne se rafraîchit pas si l'URL change.
8. `bkcore/hexgl/tracks/Cityscape.js:120` — `console.log('HIGH')` oublié ; autres `console.log` de debug dans `RaceData`, `ShipControls` (`GAMEOVER`), `Orientation`.
9. `bkcore/hexgl/HexGL.js:20, 105` — variable `this.a = window.location.href` et test commenté `if(this.a[15] == "o")` : reste d'un contrôle de domaine désactivé.
10. `manifest.webapp` — `launch_path` vers `/index-mobile.html`, fichier absent.

**Dette**

- Fichiers très longs et monolithiques (`ShipControls.js` 806 lignes, `Shaders.js` 949 lignes, `Cityscape.js` 521 lignes).
- Aucun framework de test pour le jeu ; seuls les tests de `Utils` existent (§6).
- Code mort/duplication : `Preloader.js`, `Ladder.js`, `edge/track.js`, `Three.r53.js`, `Particles` en double (`bkcore/threejs/Particles.js` et `bkcore.coffee/threejs/Particles.js`), `Timer` en double dans `Editor_files/`.
- Paramètres/ressources figés : un seul circuit, `difficulty: 0` forcé dans `launch.js` (le mode `hard` n'est pas exposé).
- Écran d'accueil : l'identité ACME (ticket `formation/tickets/company-event.md`) est centralisée dans `branding.js` + `css/branding.css`, en surcharge de `css/multi.css` ; `title.png` et `bg.jpg` ne sont plus affichés mais restent dans le dépôt, et `multi.css` contient toujours les couleurs BKcore.

## 6. Fonctions et modules testables automatiquement

### Tests QUnit existants (`formation/tests/`)

- `index.html` redirige vers `?hexgl_poc=ok`, charge QUnit 2.26.0 (`vendor/`), `../../bkcore.coffee/Utils.js`, puis `browser-tests.js`.
- `browser-tests.js` : un module `bkcore.Utils` à 4 tests — `updateClass` (ajout), `updateClass` (suppression), `getOffsetTop` (parent/enfant simulés), `getURLParameter` (lecture de `hexgl_poc`). Résultat exposé via `data-test-status/count/failures` sur `<html>` ; le statut « pass » exige au moins 4 tests (`count >= 4`).
- `index.html` charge aussi `../../branding.js` ; un module « branding.js » teste `applyBranding` sur un document isolé : remplissage complet (titre, logo `src`/`alt`, message, bouton, variables CSS), DOM incomplet sans erreur, et config ACME (message exact, palette).
- `ci-chrome.bat` (Windows) et `ci-chrome.sh` (Linux) lancent les tests en Chrome/Chromium/Edge headless, sans Node. Codes de sortie 0 / 1 / 2, rapport `rapport_erreur.html` en cas d'échec.
- Je n'ai pas exécuté ces tests dans le cadre de ce document.

### Candidats testables sans WebGL ni rendu

| Module | Fonctions | Remarque |
|---|---|---|
| `bkcore.Utils` | `updateClass`, `getOffsetTop`, `getURLParameter`, `isTouchDevice`, `scrollTo` | Dépendent seulement du DOM/`window`. Déjà partiellement couvert. `request` testable avec XHR simulé. |
| `bkcore.Timer` | `start`, `pause`, `update`, `getElapsedTime`, `msToTimeString` | Dépend de `Date`. |
| `bkcore.ImageData` | `getPixel`, `getPixelBilinear`, `getPixelF`, `getPixelFBilinear` | Nécessite une image chargée (canvas). |
| `bkcore.hexgl.RaceData` | `tick`, `applyInterpolated`, `export`, `import`, `reset` | Nécessite `THREE.Vector3/Quaternion` (Three.js chargé) et un faux `shipControls`. |
| `bkcore.hexgl.Gameplay` | transitions d'étapes, comptage des tours, `checkPoint` | Avec `hud`, `shipControls`, `analyser` simulés. |
| `bkcore.hexgl.Ladder` | `displayLadder` | Si le script est chargé ; dépend du DOM. |

### Difficiles à tester automatiquement

`HexGL`, `ShipControls`, `ShipEffects`, `CameraChase`, `HUD`, `RenderManager`, `Shaders`, `Cityscape` (WebGL, audio, assets lourds, boucle de rendu). Le contrôle de bout en bout se fait en navigateur (voir le skill `run-hexgl`).
