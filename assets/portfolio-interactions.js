(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const targets = Array.from(document.querySelectorAll(
    ".hiring-lane, .signal-card, .journey-card, .lane-card, .navigator-card, .theme-card, .proof-box, .ai-showcase"
  ));

  document.documentElement.classList.add("js");

  if (!targets.length || reducedMotion.matches || !("IntersectionObserver" in window)) {
    for (const target of targets) target.classList.add("is-visible");
    return;
  }

  for (const target of targets) target.classList.add("reveal-on-scroll");

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, {
    rootMargin: "0px 0px 8% 0px",
    threshold: 0.01
  });

  for (const target of targets) observer.observe(target);
})();
