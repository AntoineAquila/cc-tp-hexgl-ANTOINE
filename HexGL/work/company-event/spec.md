# Spec — Personnalisation événementielle ACME de l'écran d'accueil HexGL

Sources : `formation/tickets/company-event.md` (besoin), `formation/identite/charte_graphique_acme.pdf` (charte v1.0, 09/2026), `formation/identite/logo.png` (logo), `docs/architecture.md` (état actuel).

## 1. Contexte et objectif

ACME utilise HexGL lors d'un événement d'entreprise. L'écran d'accueil (étape 1 : titre BKcore, fond image, menu Start / Controls / Quality / HUD / Credits) porte aujourd'hui l'identité BKcore (image de titre, fond, couleurs orange/bleu, police Bebas Neue).

**Objectif** : que l'écran d'accueil affiche l'identité ACME (logo, couleurs de la charte, nom de l'entreprise, message d'accueil), de façon sobre et maintenable. **Le gameplay, les contrôles et le HUD restent strictement inchangés.**

## 2. Exigences fonctionnelles

- **EF1 — Logo** : le logo ACME fourni (`logo.png`) est visible sur l'écran d'accueil, sans déformation (ratio conservé), non recoloré, sans ombre ni contour, avec une zone de respiration autour.
- **EF2 — Nom de l'entreprise** : « ACME » apparaît sur l'écran d'accueil (via le logo et le message d'accueil) et dans le titre de l'onglet du navigateur.
- **EF3 — Message d'accueil** : l'écran affiche exactement « Bienvenue au ACME Racing Challenge » (formulation de référence de la charte, y compris « au »).
- **EF4 — Sous-texte** : la ligne « Une expérience événementielle aux couleurs de la marque. » figure sous le message, comme dans l'intention visuelle de la charte (§3).
- **EF5 — Bouton de démarrage** : le bouton principal est libellé « DÉMARRER LA COURSE » (intention visuelle de la charte) et conserve son rôle actuel : passage à l'écran des commandes.
- **EF6 — Couleurs** : fond principal sombre `#08090D` ; accents violet `#7628FF`, bleu électrique `#315BFF`, cyan `#00C4E8` ; texte blanc `#FFFFFF` ; surfaces secondaires `#E6E8EE`. Dégradé événementiel autorisé : `#7628FF → #315BFF`. Aucun gris moyen dominant ; aucune couleur BKcore (orange `#f66439`, bleu `#4190bb`) ne subsiste sur l'écran d'accueil.
- **EF7 — Menu d'options** : Controls, Quality, HUD et Credits restent présents, cliquables et fonctionnels, restylés dans la palette ACME et lisibles sur fond sombre.
- **EF8 — Disparition de l'identité BKcore** : l'image de titre et le fond image BKcore ne sont plus visibles sur l'écran d'accueil.

## 3. Comportements attendus

- Au chargement de `index.html`, l'écran d'accueil s'affiche directement aux couleurs ACME : logo en évidence, message d'accueil, sous-texte, bouton de démarrage, options.
- Le logo (fond blanc d'origine) est présenté sur une surface claire (carte blanche, comme dans la charte) afin d'rester lisible sur le fond sombre, sans altération du fichier.
- Survol / focus des éléments cliquables : retour visuel dans la palette (accent violet/bleu/cyan).
- Clic sur « DÉMARRER LA COURSE » → écran des commandes → chargement → course : enchaînement identique à l'existant.
- Clic sur une option (Controls / Quality / HUD) : même cycle de valeurs qu'avant ; les paramètres d'URL (`?quality=`, `?hud=`, `?controlType=`) continuent d'être pris en compte.
- Clic sur Credits : affiche les crédits, puis retour à l'accueil ACME au clic.
- Les éléments animés de l'accueil actuel (flottement du titre et du fond) ne sont pas conservés comme effets : l'accueil est statique ou n'utilise que des effets simples.

## 4. Contraintes

- **Identité** : respecter la charte (logo non déformé / non recoloré / sans ombre ni contour / sur fond lisible ; fond sombre ; accents violet-bleu-cyan ; effets complexes à éviter).
- **Typographie** : titres sans-serif à graisse forte ; interface sans-serif lisible ; **aucune nouvelle dépendance webfont** introduite pour le rebranding ; en intégration legacy, la typographie existante peut être conservée si elle reste lisible et cohérente.
- **Périmètre visuel** : uniquement l'écran d'accueil (étape 1). Gameplay, physique, contrôles, HUD en course, rendu 3D, audio : inchangés.
- **Sobriété** : intégration simple, maintenable, sans nouvelle bibliothèque ni étape de build (le projet reste un site statique).
- **Responsive** : lisible et utilisable du bureau (événement/borne) au mobile ; le logo se réduit proportionnellement.
- **Hors ligne** : le nouveau visuel ne dépend d'aucune ressource réseau.
- **Non-régression** : la suite de tests QUnit existante (`formation/tests`) reste verte (code de sortie 0).

## 5. Décisions de conception déjà imposées

Par la charte ou le ticket :

- Message d'accueil de référence : « Bienvenue au ACME Racing Challenge ».
- Logo : le fichier fourni, utilisé tel quel ; fond principal de l'écran sombre ; couleurs de la palette ci-dessus.
- Intention visuelle de la charte (§3) : logo en haut, message d'accueil en titre fort, sous-texte, bouton principal violet à coins arrondis.
- Le branding ne modifie ni gameplay, ni contrôles, ni HUD.

Hypothèses retenues par défaut (à corriger si elles ne conviennent pas) :

- Langue : textes de marque en français (selon la charte) ; les libellés d'options existants (Controls, Quality, HUD, Credits) restent en anglais.
- Les écrans suivants (commandes, chargement, score de fin, crédits) ne sont pas rebrandés.
- Le titre d'onglet devient un titre ACME (ex. « ACME Racing Challenge »).

## 6. Cas limites et gestion des erreurs

- **Logo non chargé** : texte de remplacement « ACME » lisible, mise en page non cassée.
- **WebGL indisponible** : le bouton de démarrage affiche le message d'erreur existant (« WebGL is not supported! ») avec la même redirection, lisible dans le nouveau style.
- **Petits écrans / portrait** : aucun débordement horizontal, bouton et options atteignables ; texte non tronqué.
- **Très grands écrans (borne)** : logo et titre restent proportionnés, fond uniformément sombre.
- **Écran tactile** : zones cliquables suffisantes, pas de dépendance au survol.
- **Paramètres d'URL** (valeurs valides ou absentes) : comportement identique à l'existant.
- **Retour des crédits** : l'accueil réaffiché garde le style ACME (pas de retour du visuel BKcore).
- **Contraste** : texte blanc / clair sur fond sombre ; texte sombre uniquement sur surface claire.
- **Caractères accentués** (« DÉMARRER », « événementielle ») rendus correctement (encodage UTF-8).

## 7. Hors périmètre

- Modification du gameplay, de la physique, des contrôles, du HUD, du circuit, de l'audio, du rendu 3D.
- Rebranding des écrans commandes, chargement, fin de course/score, crédits.
- Traduction complète de l'interface, nouvelles options de menu, multi-circuits, classement.
- Nouvelle police web, nouvelle bibliothèque, build, backend.
- Retrait/remplacement de l'analytics, des métadonnées de partage (og:*), de l'icône ou des mentions de licence/crédits BKcore.
- Création d'une version claire ou alternative du logo.
- Correction des bugs et dettes listés dans `docs/architecture.md` §5.

## 8. Critères d'acceptation

| # | Critère | Vérification |
|---|---|---|
| CA1 | Le logo ACME est visible sur l'accueil, ratio d'origine conservé, non recoloré, sans ombre/contour | Visuel + comparaison au fichier |
| CA2 | Le texte « Bienvenue au ACME Racing Challenge » est affiché à l'identique | Visuel / lecture du DOM |
| CA3 | Le fond est sombre `#08090D` ; seuls violet, bleu, cyan, blanc, gris clair sont utilisés comme couleurs ; aucune couleur/image BKcore visible à l'accueil | Visuel + inspection des styles |
| CA4 | Le bouton « DÉMARRER LA COURSE » mène à l'écran des commandes puis à la course | Parcours manuel menu → course |
| CA5 | Controls / Quality / HUD changent de valeur au clic, les paramètres d'URL fonctionnent, Credits s'ouvre et revient à l'accueil ACME | Parcours manuel |
| CA6 | Course, contrôles et HUD (tour 1/3, « GET READY ») identiques à la capture `02-jeu-en-cours.png` | Comparaison visuelle manuelle |
| CA7 | Aucune nouvelle webfont, bibliothèque ni requête réseau ajoutée | Inspection du chargement réseau |
| CA8 | Aucun débordement ni élément illisible en largeur mobile (~375 px) et bureau (~1920 px) | Captures aux deux tailles |
| CA9 | Logo indisponible : « ACME » lisible, accueil utilisable | Test manuel (fichier masqué) |
| CA10 | Sans WebGL : message d'erreur lisible dans le nouveau style | Test manuel |
| CA11 | Tests QUnit : code de sortie 0 | `ci-chrome.bat` |
| CA12 | Aucune erreur console nouvelle par rapport à l'état actuel (10 avertissements existants) | Console navigateur |
| CA13 | Capture de référence de l'accueil ACME ajoutée à `formation/tests/captures/` | Présence du fichier |
