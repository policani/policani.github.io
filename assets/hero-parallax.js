(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const heroes = Array.from(document.querySelectorAll(".hero"));

  if (!heroes.length || reducedMotion.matches) return;

  let ticking = false;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const update = () => {
    for (const hero of heroes) {
      const rect = hero.getBoundingClientRect();
      const travel = Number.parseFloat(hero.dataset.parallaxTravel || "220");
      const progress = clamp(-rect.top / Math.max(1, rect.height), 0, 1);
      const shift = Math.round(progress * travel);

      hero.style.setProperty("--hero-shift", `${shift}px`);
    }

    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    window.requestAnimationFrame(update);
    ticking = true;
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
})();
