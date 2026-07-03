(function () {
  var track = document.querySelector("[data-testimonial-track]");
  var prev = document.querySelector("[data-carousel-prev]");
  var next = document.querySelector("[data-carousel-next]");
  if (!track || !prev || !next) return;

  var AUTOPLAY_MS = 10000;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var wrapper = track.closest(".testimonial-carousel") || track;
  var timer = null;
  var paused = false;

  function step() {
    var card = track.querySelector(".testimonial");
    return card ? card.getBoundingClientRect().width + 18 : 320;
  }

  function maxScroll() {
    return track.scrollWidth - track.clientWidth - 2;
  }

  function update() {
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= maxScroll();
  }

  function advance() {
    if (track.scrollLeft >= maxScroll()) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: step(), behavior: "smooth" });
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
    track.scrollBy({ left: -step(), behavior: "smooth" });
    resetAuto();
  });

  next.addEventListener("click", function () {
    track.scrollBy({ left: step(), behavior: "smooth" });
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
})();
