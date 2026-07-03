(function () {
  var tracks = Array.prototype.slice.call(document.querySelectorAll("[data-testimonial-track]"));
  if (!tracks.length) return;

  var AUTOPLAY_MS = 10000;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function step(track) {
    var card = track.querySelector(".testimonial");
    return card ? card.getBoundingClientRect().width + 18 : 320;
  }

  function maxScroll(track) {
    return track.scrollWidth - track.clientWidth - 2;
  }

  function setup(track) {
    var root = track.closest("section") || document;
    var prev = root.querySelector("[data-carousel-prev]");
    var next = root.querySelector("[data-carousel-next]");
    if (!prev || !next) return;

    var wrapper = track.closest(".testimonial-carousel") || track;
    var timer = null;
    var paused = false;

    function update() {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll(track);
    }

    function advance() {
      if (track.scrollLeft >= maxScroll(track)) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: step(track), behavior: "smooth" });
      }
    }

    function startAuto() {
      if (reducedMotion.matches || timer) return;
      timer = setInterval(function () {
        if (!paused && !document.hidden) advance();
      }, AUTOPLAY_MS);
    }

    function stopAuto() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function resetAuto() {
      stopAuto();
      startAuto();
    }

    prev.addEventListener("click", function () {
      track.scrollBy({ left: -step(track), behavior: "smooth" });
      resetAuto();
    });

    next.addEventListener("click", function () {
      track.scrollBy({ left: step(track), behavior: "smooth" });
      resetAuto();
    });

    // Pause while the reader is engaged with the carousel.
    wrapper.addEventListener("mouseenter", function () { paused = true; });
    wrapper.addEventListener("mouseleave", function () { paused = false; });
    wrapper.addEventListener("focusin", function () { paused = true; });
    wrapper.addEventListener("focusout", function () { paused = false; });

    // Direct touch/drag on the track means the reader has taken over.
    track.addEventListener("pointerdown", stopAuto, { passive: true });

    track.addEventListener("scroll", function () {
      window.requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener("resize", update);

    reducedMotion.addEventListener ? reducedMotion.addEventListener("change", function (e) {
      if (e.matches) stopAuto(); else startAuto();
    }) : null;

    update();
    startAuto();
  }

  tracks.forEach(setup);
})();
