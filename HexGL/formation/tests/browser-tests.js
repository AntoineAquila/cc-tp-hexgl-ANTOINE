/* Tests du code existant HexGL, sans Node.js. QUnit est chargé localement. */
(function () {
  "use strict";
  if (typeof QUnit === "undefined") {
    document.documentElement.dataset.testStatus = "fail";
    document.documentElement.dataset.testCount = "0";
    document.documentElement.dataset.testFailures = "1";
    document.body.insertAdjacentHTML("afterbegin", "<p style='color:red'>QUnit introuvable : vérifiez le fichier vendor/qunit-2.26.0.js</p>");
    return;
  }

  // Compatible avec le script Chrome headless existant : état mesurable dans le DOM.
  QUnit.done(function (result) {
    const count = result.total;
    const failed = result.failed;
    const root = document.documentElement;
    root.setAttribute("data-test-count", String(count));
    root.setAttribute("data-test-failures", String(failed));
    root.setAttribute("data-test-status", failed === 0 && count >= 4 ? "pass" : "fail");
    let summary = document.getElementById("summary");
    if (!summary) {
      summary = document.createElement("p");
      summary.id = "summary";
      document.body.appendChild(summary);
    }
    summary.textContent = count + " test(s) : " + (count - failed) + " réussi(s), " + failed + " échec(s).";
  });

  const U = window.bkcore && window.bkcore.Utils;
  QUnit.module("HexGL — bkcore.Utils", function () {
    QUnit.test("updateClass ajoute une classe", function (assert) {
      assert.ok(U, "Utils.js chargé");
      const e = document.createElement("div");
      e.id = "test-hexgl-add";
      document.getElementById("qunit-fixture").appendChild(e);
      U.updateClass(e.id, "active", true);
      assert.true(e.classList.contains("active"));
    });
    QUnit.test("updateClass supprime une classe", function (assert) {
      assert.ok(U, "Utils.js chargé");
      const e = document.createElement("div");
      e.id = "test-hexgl-remove";
      e.className = "active";
      document.getElementById("qunit-fixture").appendChild(e);
      U.updateClass(e.id, "active", false);
      assert.false(e.classList.contains("active"));
    });
    QUnit.test("getOffsetTop additionne les décalages parent/enfant", function (assert) {
      const parent = {
        offsetTop: 37,
        offsetParent: null
      };
      const enfant = {
        offsetTop: 13,
        offsetParent: parent
      };
      assert.strictEqual(U.getOffsetTop(enfant), 50);
    });
    QUnit.test("getURLParameter lit les paramètres d'URL", function (assert) {
      assert.ok(U, "Utils.js chargé");
      U.URLParameters = null;
      const url = new URL(window.location.href);
      url.searchParams.set("hexgl_poc", "ok");
      // Le lanceur fournit hexgl_poc=ok ; en ouverture directe, on teste l'absence ou la présence.
      const expected = window.location.search.includes("hexgl_poc=ok") ? "ok" : null;
      assert.strictEqual(U.getURLParameter("hexgl_poc"), expected);
    });
  });

  QUnit.module("HexGL — bkcore.Utils (non-régression)", function () {
    QUnit.test("updateClass ignore un id inconnu sans lever d'erreur", function (assert) {
      assert.strictEqual(U.updateClass("id-inexistant-hexgl", "active", true), undefined);
    });
    QUnit.test("getOffsetTop sans parent renvoie son propre décalage", function (assert) {
      assert.strictEqual(U.getOffsetTop({ offsetTop: 21, offsetParent: null }), 21);
    });
    QUnit.test("getURLParameter : paramètres multiples et absent", function (assert) {
      const initial = window.location.href;
      try {
        history.replaceState(null, "", "?hexgl_poc=ok&quality=2&hud=0");
        U.URLParameters = null;
        assert.strictEqual(String(U.getURLParameter("quality")), "2");
        assert.strictEqual(String(U.getURLParameter("hud")), "0");
        assert.strictEqual(U.getURLParameter("absent"), undefined);
      } finally {
        history.replaceState(null, "", initial);
        U.URLParameters = null;
      }
    });
    QUnit.test("isTouchDevice renvoie un booléen", function (assert) {
      assert.strictEqual(typeof U.isTouchDevice(), "boolean");
    });
  });

  const T = window.bkcore && window.bkcore.Timer;
  QUnit.module("HexGL — bkcore.Timer", function () {
    QUnit.test("msToTime découpe h/m/s/ms", function (assert) {
      assert.ok(T, "Timer.js chargé");
      assert.deepEqual(T.msToTime(3723456), { h: 1, m: 2, s: 3, ms: 456 });
      assert.deepEqual(T.msToTime(0), { h: 0, m: 0, s: 0, ms: 0 });
    });
    QUnit.test("msToTimeString complète avec des zéros (ms sur 4 chiffres)", function (assert) {
      // 92300 ms = temps de tour utilisé par Gameplay.simu
      assert.deepEqual(T.msToTimeString(92300), { h: "00", m: "01", s: "32", ms: "0300" });
    });
    QUnit.test("zfill remplit sans tronquer", function (assert) {
      assert.strictEqual(T.zfill(7, 3), "007");
      assert.strictEqual(T.zfill(1234, 2), "1234");
    });
    QUnit.test("start/update mesure le temps écoulé, pause le fige", function (assert) {
      const t = new T();
      assert.false(t.active);
      t.update();
      assert.strictEqual(t.time.elapsed, 0, "inactif : update ne fait rien");
      t.start();
      assert.true(t.active);
      t.time.start -= 1500; // simule 1,5 s écoulée sans attendre
      t.update();
      assert.ok(t.time.elapsed >= 1500, "elapsed >= 1500 ms");
      t.pause(true);
      const fige = t.time.elapsed;
      t.time.start -= 1000;
      t.update();
      assert.strictEqual(t.time.elapsed, fige, "en pause : elapsed inchangé");
    });
    QUnit.test("getElapsedTime formate time.elapsed", function (assert) {
      const t = new T();
      t.time.elapsed = 61005;
      assert.deepEqual(t.getElapsedTime(), { h: 0, m: 1, s: 1, ms: 5 });
    });
  });

  QUnit.module("HexGL — branding.js", function () {
    const cfg = {
      pageTitle: "Titre test",
      logo: { src: "x/logo.png", alt: "Alt test" },
      welcome: "Bienvenue test",
      subtitle: "Sous-texte test",
      startLabel: "GO",
      colors: { bg: "#010203", violet: "#7628FF" }
    };
    // Document isolé : ne touche ni au titre ni aux styles de la page de tests.
    function fakeDoc() {
      return document.implementation.createHTMLDocument("avant");
    }
    QUnit.test("applyBranding renseigne titre, logo, textes, bouton et variables CSS", function (assert) {
      assert.strictEqual(typeof window.applyBranding, "function", "branding.js chargé");
      const d = fakeDoc();
      d.body.innerHTML = '<img id="brand-logo"><h1 id="brand-welcome"></h1><p id="brand-subtitle"></p><div id="start">Start</div>';
      window.applyBranding(cfg, d);
      assert.strictEqual(d.title, "Titre test");
      assert.strictEqual(d.getElementById("brand-logo").getAttribute("src"), "x/logo.png");
      assert.strictEqual(d.getElementById("brand-logo").alt, "Alt test");
      assert.strictEqual(d.getElementById("brand-welcome").textContent, "Bienvenue test");
      assert.strictEqual(d.getElementById("brand-subtitle").textContent, "Sous-texte test");
      assert.strictEqual(d.getElementById("start").textContent, "GO");
      assert.strictEqual(d.documentElement.style.getPropertyValue("--brand-bg"), "#010203");
      assert.strictEqual(d.documentElement.style.getPropertyValue("--brand-violet"), "#7628FF");
    });
    QUnit.test("applyBranding ignore un DOM incomplet sans erreur", function (assert) {
      const d = fakeDoc();
      window.applyBranding(cfg, d);
      assert.strictEqual(d.title, "Titre test");
    });
    QUnit.test("la config ACME fournie respecte la charte (message exact, palette)", function (assert) {
      const b = window.BRANDING;
      assert.strictEqual(b.welcome, "Bienvenue au ACME Racing Challenge");
      assert.strictEqual(b.colors.bg, "#08090D");
      assert.strictEqual(b.colors.violet, "#7628FF");
      assert.strictEqual(b.colors.blue, "#315BFF");
      assert.strictEqual(b.colors.cyan, "#00C4E8");
    });
  });
})();
