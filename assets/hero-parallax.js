(() => {
  const simplifyNavigation = () => {
    const labels = new Map([
      ["pmo-portfolio-governance-leader.html", "Profile"],
      ["operating-history.html", "Work"],
      ["artifacts.html", "Guides"],
      ["governance/", "Governance"],
      ["modules.html", "Systems"],
      ["proof.html", "Proof"],
      ["resources.html", "Resources"],
      ["contact.html", "Contact"],
      ["search.html", "Search"]
    ]);

    document.querySelectorAll(".nav-links a").forEach((link) => {
      const href = (link.getAttribute("href") || "").replace(/^\.?(?:\/)/, "");
      const label = labels.get(href);
      if (label) link.textContent = label;
    });
  };

  const addSearchLink = () => {
    const navLinks = document.querySelector(".nav-links");
    if (!navLinks || navLinks.querySelector('a[href="/search.html"], a[href="search.html"]')) return;

    const link = document.createElement("a");
    link.href = "/search.html";
    link.className = "nav-search-link";
    link.textContent = "Search";
    navLinks.append(link);
  };

  simplifyNavigation();
  addSearchLink();

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const heroes = Array.from(document.querySelectorAll(".hero, .deck-hero"));
  const nav = document.querySelector(".local-nav");

  const syncNavOverlay = () => {
    if (!nav) return;
    document.documentElement.style.setProperty("--nav-overlay-height", `${nav.offsetHeight}px`);
  };

  if (nav && "ResizeObserver" in window) {
    new ResizeObserver(syncNavOverlay).observe(nav);
  }

  syncNavOverlay();
  window.requestAnimationFrame(syncNavOverlay);
  window.addEventListener("load", syncNavOverlay);

  if (!heroes.length || reducedMotion.matches) {
    window.addEventListener("resize", syncNavOverlay);
    return;
  }

  let ticking = false;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const update = () => {
    syncNavOverlay();

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
