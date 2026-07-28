/* Count-up animation for metric numbers (Abacus-style "verified" section).
   Targets: .tile-num, .proof-stat strong, .kpi .num, [data-countup].
   Animates each numeric token when the element scrolls into view; preserves
   prefixes/suffixes ($, ~, %, B, M, K, +, ranges). Respects reduced motion. */
(function () {
  'use strict';

  var SELECTOR = '.tile-num, .proof-stat strong, .kpi .num, [data-countup]';
  var DURATION = 1400;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function formatNumber(value, decimals, useCommas) {
    if (useCommas) {
      return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }
    return value.toFixed(decimals);
  }

  function animate(el) {
    if (el.dataset.countupDone) { return; }
    el.dataset.countupDone = '1';

    var original = el.textContent;
    var re = /\d[\d,]*(?:\.\d+)?/g;
    var parts = [];
    var last = 0;
    var m;
    while ((m = re.exec(original)) !== null) {
      parts.push({ prefix: original.slice(last, m.index), raw: m[0] });
      last = m.index + m[0].length;
    }
    if (!parts.length) { return; }
    var tail = original.slice(last);

    var targets = parts.map(function (p) {
      var clean = p.raw.replace(/,/g, '');
      return {
        value: parseFloat(clean),
        decimals: (clean.split('.')[1] || '').length,
        commas: p.raw.indexOf(',') !== -1
      };
    });

    var prevVariant = el.style.fontVariantNumeric;
    el.style.fontVariantNumeric = 'tabular-nums';

    var start = null;
    function frame(ts) {
      if (start === null) { start = ts; }
      var t = Math.min((ts - start) / DURATION, 1);
      var k = easeOutCubic(t);
      var out = '';
      for (var i = 0; i < parts.length; i++) {
        out += parts[i].prefix +
          formatNumber(targets[i].value * k, targets[i].decimals, targets[i].commas);
      }
      el.textContent = out + tail;
      if (t < 1) {
        window.requestAnimationFrame(frame);
      } else {
        el.textContent = original;
        el.style.fontVariantNumeric = prevVariant;
      }
    }
    window.requestAnimationFrame(frame);
  }

  function init() {
    var els = document.querySelectorAll(SELECTOR);
    if (!els.length) { return; }
    var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) { return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    els.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
