(() => {
  const entries = Array.from(document.querySelectorAll(".library-entry"))
    .sort((left, right) => Number(right.dataset.sequence) - Number(left.dataset.sequence));
  const search = document.querySelector("[data-library-search]");
  const results = document.querySelector("[data-library-results]");
  const chapters = Array.from(document.querySelectorAll("[data-library-chapter]"));
  const scriptVersion = new URL(document.currentScript.src).searchParams.get("v") || "current";

  if (!search || !results) return;

  let pagefind;
  let requestId = 0;
  let debounceTimer;

  const normalizePath = (value) => new URL(value, window.location.href).pathname;
  const entryPaths = new Map(entries.map((entry) => {
    const note = normalizePath(entry.querySelector("h3 a").getAttribute("href"));
    const paper = normalizePath(entry.querySelector('a[href$=".pdf"]').getAttribute("href"));
    return [entry, new Set([note, paper])];
  }));

  const applyVisiblePaths = (visiblePaths, query) => {
    let visible = 0;
    entries.forEach((entry) => {
      const matches = !query || [...entryPaths.get(entry)].some((path) => visiblePaths.has(path));
      entry.hidden = !matches;
      if (matches) visible += 1;
    });
    chapters.forEach((chapter) => {
      chapter.hidden = !chapter.querySelector(".library-entry:not([hidden])");
    });
    results.textContent = query
      ? `${visible} field note${visible === 1 ? "" : "s"} match “${query}” across note and white-paper text.`
      : `Showing all ${entries.length} field notes.`;
  };

  const fallbackFilter = (query) => {
    const visiblePaths = new Set();
    entries.forEach((entry) => {
      const content = `${entry.textContent} ${entry.dataset.category} ${entry.dataset.summary}`.toLocaleLowerCase();
      if (!query || content.includes(query.toLocaleLowerCase())) {
        entryPaths.get(entry).forEach((path) => visiblePaths.add(path));
      }
    });
    applyVisiblePaths(visiblePaths, query);
  };

  const render = async () => {
    const thisRequest = ++requestId;
    const query = search.value.trim();
    if (!query) {
      applyVisiblePaths(new Set(), "");
      return;
    }
    if (!pagefind) {
      fallbackFilter(query);
      return;
    }

    results.textContent = "Searching field notes and white papers…";
    try {
      const response = await pagefind.search(query);
      const matches = await Promise.all(response.results.map((result) => result.data()));
      if (thisRequest !== requestId) return;
      const visiblePaths = new Set(matches.map((match) => normalizePath(match.meta.resultUrl || match.url)));
      applyVisiblePaths(visiblePaths, query);
    } catch (error) {
      console.error("Governance library search failed", error);
      fallbackFilter(query);
    }
  };

  const initialize = async () => {
    try {
      pagefind = await import(`/pagefind/pagefind.js?v=${encodeURIComponent(scriptVersion)}`);
      await pagefind.options({
        ranking: {
          termFrequency: 0.65,
          pageLength: 0.45,
          metaWeights: { title: 8, summary: 3, category: 2 }
        }
      });
      if (search.value.trim()) render();
    } catch (error) {
      console.error("Governance library full-text search initialization failed", error);
    }
  };

  search.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(render, 180);
  });

  initialize();
})();
