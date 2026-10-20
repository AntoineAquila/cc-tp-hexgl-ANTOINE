/* Branding événementiel : seul fichier à éditer pour changer l'identité de l'écran d'accueil. */
(function () {
  "use strict";

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

  // Les éléments absents sont ignorés : un DOM incomplet ne doit jamais casser le jeu.
  function applyBranding(config, doc) {
    var el = function (id) { return doc.getElementById(id); };
    var text = function (id, value) { var e = el(id); if (e) e.textContent = value; };
    var name;

    doc.title = config.pageTitle;
    for (name in config.colors) {
      doc.documentElement.style.setProperty('--brand-' + name, config.colors[name]);
    }
    var logo = el('brand-logo');
    if (logo) {
      logo.src = config.logo.src;
      logo.alt = config.logo.alt;
    }
    text('brand-welcome', config.welcome);
    text('brand-subtitle', config.subtitle);
    text('start', config.startLabel);
  }

  window.applyBranding = applyBranding;

  // Sur la page de tests il n'y a pas d'écran d'accueil : on n'y touche pas au titre.
  if (document.getElementById('step-1')) applyBranding(window.BRANDING, document);
})();
