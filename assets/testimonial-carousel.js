(function () {
  var track = document.querySelector("[data-testimonial-track]");
  var prev = document.querySelector("[data-carousel-prev]");
  var next = document.querySelector("[data-carousel-next]");
  if (!track || !prev || !next) return;

  function step() {
    var card = track.querySelector(".testimonial");
    return card ? card.getBoundingClientRect().width + 18 : 320;
  }

  function update() {
    var max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  }

  prev.addEventListener("click", function () {
    track.scrollBy({ left: -step(), behavior: "smooth" });
  });

  next.addEventListener("click", function () {
    track.scrollBy({ left: step(), behavior: "smooth" });
  });

  track.addEventListener("scroll", function () {
    window.requestAnimationFrame(update);
  }, { passive: true });

  window.addEventListener("resize", update);
  update();
})();
