/* Sagar Lal - portfolio behaviour. No framework, no build step.
   English lives in the HTML; other languages come from i18n.js. */
(function () {
  "use strict";

  var root = document.documentElement;
  var LANGS = ["en", "it", "es", "fr", "de"];
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };
  function $(id) { return document.getElementById(id); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  /* ---------- theme ---------- */
  var themeBtn = $("theme-btn");
  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store.set("theme", next);
  });

  /* ---------- language ---------- */
  var textNodes = document.querySelectorAll("[data-i18n]");
  var attrNodes = document.querySelectorAll("[data-i18n-attr]");
  var english = {};
  var englishAttrs = [];
  each(textNodes, function (n) { english[n.getAttribute("data-i18n")] = n.innerHTML; });
  each(attrNodes, function (n) {
    n.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
      var parts = pair.split(":");
      if (parts.length === 2) {
        var attr = parts[0].trim();
        englishAttrs.push({ node: n, attr: attr, key: parts[1].trim(), value: n.getAttribute(attr) || "" });
      }
    });
  });
  var englishTitle = document.title;

  var langBtn = $("lang-btn"), langMenu = $("lang-menu"), langCode = $("lang-code");
  var langItems = langMenu.querySelectorAll("[data-lang]");

  function lookup(lang, key, fallback) {
    var dict = window.I18N && window.I18N[lang];
    return dict && Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : fallback;
  }

  function applyLang(lang, updateUrl) {
    if (LANGS.indexOf(lang) < 0) { lang = "en"; }
    each(textNodes, function (n) {
      var key = n.getAttribute("data-i18n");
      n.innerHTML = lang === "en" ? english[key] : lookup(lang, key, english[key]);
    });
    englishAttrs.forEach(function (a) {
      a.node.setAttribute(a.attr, lang === "en" ? a.value : lookup(lang, a.key, a.value));
    });
    root.setAttribute("lang", lang);
    document.title = lang === "en" ? englishTitle : lookup(lang, "meta.title", englishTitle);
    langCode.textContent = lang.toUpperCase();
    each(langItems, function (b) {
      b.setAttribute("aria-checked", b.getAttribute("data-lang") === lang ? "true" : "false");
    });
    store.set("lang", lang);
    if (updateUrl && window.history && window.URL) {
      var url = new URL(window.location.href);
      if (lang === "en") { url.searchParams.delete("lang"); } else { url.searchParams.set("lang", lang); }
      window.history.replaceState(null, "", url.toString());
    }
    root.classList.remove("i18n-pending");
  }

  function initialLang() {
    var q = new URLSearchParams(window.location.search).get("lang");
    if (q && LANGS.indexOf(q) >= 0) { return q; }
    var saved = store.get("lang");
    if (saved && LANGS.indexOf(saved) >= 0) { return saved; }
    var prefs = navigator.languages || [navigator.language || "en"];
    for (var i = 0; i < prefs.length; i++) {
      var code = String(prefs[i]).slice(0, 2).toLowerCase();
      if (LANGS.indexOf(code) >= 0) { return code; }
    }
    return "en";
  }

  function openLangMenu() {
    langMenu.hidden = false;
    langBtn.setAttribute("aria-expanded", "true");
    (langMenu.querySelector('[aria-checked="true"]') || langItems[0]).focus();
  }
  function closeLangMenu(returnFocus) {
    if (langMenu.hidden) { return; }
    langMenu.hidden = true;
    langBtn.setAttribute("aria-expanded", "false");
    if (returnFocus) { langBtn.focus(); }
  }
  langBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (langMenu.hidden) { openLangMenu(); } else { closeLangMenu(false); }
  });
  each(langItems, function (item, i) {
    item.addEventListener("click", function () {
      applyLang(item.getAttribute("data-lang"), true);
      closeLangMenu(true);
    });
    item.addEventListener("keydown", function (e) {
      var n = langItems.length;
      if (e.key === "ArrowDown") { e.preventDefault(); langItems[(i + 1) % n].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); langItems[(i - 1 + n) % n].focus(); }
      else if (e.key === "Home") { e.preventDefault(); langItems[0].focus(); }
      else if (e.key === "End") { e.preventDefault(); langItems[n - 1].focus(); }
      else if (e.key === "Escape") { closeLangMenu(true); }
      else if (e.key === "Tab") { closeLangMenu(false); }
    });
  });
  document.addEventListener("click", function (e) {
    if (!langMenu.contains(e.target)) { closeLangMenu(false); }
  });

  /* ---------- mobile navigation ---------- */
  var menuBtn = $("menu-btn"), nav = $("site-nav");
  function setMenu(open) {
    root.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  menuBtn.addEventListener("click", function () { setMenu(!root.classList.contains("menu-open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) { setMenu(false); } });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { setMenu(false); closeLangMenu(false); }
  });

  /* ---------- header shadow ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- active section + reveal ---------- */
  if ("IntersectionObserver" in window) (function () {
    var links = {};
    each(nav.querySelectorAll('a[href^="#"]'), function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          Object.keys(links).forEach(function (id) { links[id].classList.toggle("active", id === entry.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) { var s = $(id); if (s) { spy.observe(s); } });

    // Visitors who arrive on a section link (/#projects) see it at once: no fade-in
    // for content the browser has already scrolled them to.
    if (window.location.hash) { return; }
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); reveal.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    each(document.querySelectorAll(".reveal"), function (el) { reveal.observe(el); });
    root.classList.add("reveal-ready");
  })();

  /* ---------- copy email ---------- */
  var copyBtn = $("copy-email");
  if (copyBtn && navigator.clipboard) {
    copyBtn.addEventListener("click", function () {
      var label = copyBtn.querySelector("[data-i18n]");
      navigator.clipboard.writeText(copyBtn.getAttribute("data-email")).then(function () {
        var before = label.innerHTML;
        label.textContent = copyBtn.getAttribute("data-copied");
        setTimeout(function () { label.innerHTML = before; }, 1800);
      }, function () { /* clipboard blocked: the address is still visible */ });
    });
  } else if (copyBtn) {
    copyBtn.hidden = true;
  }

  /* ---------- form confirmation (FormSubmit redirects back with ?sent=1) ---------- */
  if (new URLSearchParams(window.location.search).get("sent") === "1") {
    var card = $("form-card");
    if (card) { card.classList.add("sent"); }
  }

  /* ---------- footer year ---------- */
  each(document.querySelectorAll("[data-year]"), function (n) { n.textContent = String(new Date().getFullYear()); });

  /* ---------- start ---------- */
  var first = initialLang();
  if (first !== "en") { applyLang(first, false); } else { root.classList.remove("i18n-pending"); store.set("lang", "en"); }
})();
