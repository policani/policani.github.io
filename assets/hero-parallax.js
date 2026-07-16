(() => {
  const simplifyNavigation = () => {
    const labels = new Map([
      ["pmo-portfolio-governance-leader.html", "Profile"],
      ["operating-history.html", "Cases"],
      ["artifacts.html", "Methods"],
      ["governance/", "Insights"],
      ["governance/index.html", "Insights"],
      ["resources/", "Labs"],
      ["contact.html", "Contact"],
      ["search.html", "Search"]
    ]);

    document.querySelectorAll(".nav-links a").forEach((link) => {
      if (link.classList.contains("nav-search-link")) {
        link.setAttribute("aria-label", "Search");
        link.setAttribute("title", "Search");
        link.innerHTML = '<span aria-hidden="true">⌕</span>';
        return;
      }
      const href = (link.getAttribute("href") || "").replace(/^\.?(?:\/)/, "");
      const label = labels.get(href);
      if (label) link.textContent = label;
    });
  };

  const addSearchLink = () => {
    const navLinks = document.querySelector(".nav-links");
    if (!navLinks || navLinks.querySelector(".nav-search-link")) return;

    const link = document.createElement("a");
    link.href = "/search.html";
    link.className = "nav-search-link";
    link.setAttribute("aria-label", "Search");
    link.setAttribute("title", "Search");
    link.innerHTML = '<span aria-hidden="true">⌕</span>';
    navLinks.append(link);
  };

  const addSearchOverlay = () => {
    if (document.querySelector("[data-site-search-overlay]")) return;

    const overlay = document.createElement("section");
    overlay.className = "site-search-overlay";
    overlay.hidden = true;
    overlay.setAttribute("data-site-search-overlay", "");
    overlay.setAttribute("aria-label", "Portfolio search");
    overlay.innerHTML = `
      <div class="site-search-dialog" role="dialog" aria-modal="true" aria-labelledby="site-search-overlay-heading">
        <div class="site-search-dialog-header">
          <div>
            <p class="section-kicker">Search</p>
            <h2 id="site-search-overlay-heading">Find a case, method, insight, or lab.</h2>
          </div>
          <button class="site-search-dialog-close" type="button">Close</button>
        </div>
        <form class="site-search-form" data-site-search-overlay-form role="search">
          <div class="site-search-field">
            <label for="site-search-overlay-input">Search the portfolio</label>
            <input id="site-search-overlay-input" type="search" name="q" placeholder="Example: delivery readiness or Avalara" autocomplete="off">
          </div>
          <button class="button primary" type="submit">Search</button>
        </form>
      </div>`;
    document.body.append(overlay);

    const close = () => {
      overlay.hidden = true;
      document.querySelector(".nav-search-link")?.focus();
    };
    const open = () => {
      overlay.hidden = false;
      overlay.querySelector("input")?.focus();
    };

    document.querySelectorAll(".nav-search-link").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        open();
      });
    });
    overlay.querySelector(".site-search-dialog-close")?.addEventListener("click", close);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
    overlay.querySelector("[data-site-search-overlay-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = overlay.querySelector("input")?.value.trim() || "";
      window.location.href = query ? `/search.html?q=${encodeURIComponent(query)}` : "/search.html";
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !overlay.hidden) close();
    });
  };

  simplifyNavigation();
  addSearchLink();
  addSearchOverlay();

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
