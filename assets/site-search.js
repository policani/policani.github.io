(() => {
  const SEARCH_INDEX_VERSION = "aa1f88acb3ee";
  const PAGE_SIZE = 10;
  const form = document.querySelector("[data-site-search-form]");
  const input = document.querySelector("[data-site-search-input]");
  const filter = document.querySelector("[data-site-search-filter]");
  const status = document.querySelector("[data-site-search-status]");
  const results = document.querySelector("[data-site-search-results]");
  const pagination = document.querySelector("[data-site-search-pagination]");

  if (!form || !input || !filter || !status || !results || !pagination) return;

  let pagefind;
  let page = 1;
  let requestId = 0;
  let debounceTimer;

  const setUrl = () => {
    const url = new URL(window.location.href);
    const query = input.value.trim();
    const type = filter.value;
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    if (type) url.searchParams.set("type", type);
    else url.searchParams.delete("type");
    window.history.replaceState({}, "", url);
  };

  const safeExcerpt = (html) => {
    const template = document.createElement("template");
    template.innerHTML = html || "";
    template.content.querySelectorAll("*").forEach((element) => {
      if (element.tagName !== "MARK") element.replaceWith(document.createTextNode(element.textContent || ""));
      else [...element.attributes].forEach((attribute) => element.removeAttribute(attribute.name));
    });
    return template.content;
  };

  const addResult = (data) => {
    const item = document.createElement("li");
    item.className = "site-search-result";

    const type = document.createElement("span");
    type.className = "site-search-result-type";
    type.textContent = data.meta.type || "Page";

    const link = document.createElement("a");
    link.href = data.meta.resultUrl || data.url;
    link.textContent = data.meta.title || "Untitled result";

    const summary = document.createElement("p");
    const excerpt = data.excerpt || data.meta.summary || data.meta.description || "";
    summary.append(safeExcerpt(excerpt));

    item.append(type, link);
    if (summary.textContent.trim()) item.append(summary);
    results.append(item);
  };

  const addPagination = (total) => {
    pagination.replaceChildren();
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (totalPages <= 1) return;

    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "button secondary";
    previous.textContent = "Previous";
    previous.disabled = page === 1;
    previous.addEventListener("click", () => {
      page -= 1;
      render();
      status.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    const position = document.createElement("span");
    position.textContent = `Page ${page} of ${totalPages}`;

    const next = document.createElement("button");
    next.type = "button";
    next.className = "button secondary";
    next.textContent = "Next";
    next.disabled = page === totalPages;
    next.addEventListener("click", () => {
      page += 1;
      render();
      status.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    pagination.append(previous, position, next);
  };

  const render = async () => {
    if (!pagefind) return;
    const thisRequest = ++requestId;
    const query = input.value.trim();
    const type = filter.value;
    status.textContent = "Searching…";
    results.replaceChildren();
    pagination.replaceChildren();

    try {
      const response = await pagefind.search(query || null, type ? { filters: { type } } : undefined);
      if (thisRequest !== requestId) return;
      const total = response.results.length;
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      if (page > totalPages) page = totalPages;
      const start = (page - 1) * PAGE_SIZE;
      const visible = response.results.slice(start, start + PAGE_SIZE);
      const data = await Promise.all(visible.map((result) => result.data()));
      if (thisRequest !== requestId) return;

      data.forEach(addResult);
      const context = type ? ` in ${type}` : "";
      status.textContent = total
        ? `${total} ${total === 1 ? "result" : "results"}${query ? ` for “${query}”` : ""}${context}.`
        : `No results${query ? ` for “${query}”` : ""}${context}. Try a shorter term or clear the content filter.`;
      addPagination(total);
    } catch (error) {
      console.error("Portfolio search failed", error);
      status.textContent = "Search could not load. Browse the Library, Cases, Methods, or Labs from the navigation above.";
    }
  };

  const populateFilters = async () => {
    const available = await pagefind.filters();
    const types = available.type || {};
    Object.entries(types)
      .sort(([left], [right]) => left.localeCompare(right))
      .forEach(([name, count]) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = `${name} (${count})`;
        filter.append(option);
      });
    const requested = new URLSearchParams(window.location.search).get("type") || "";
    if ([...filter.options].some((option) => option.value === requested)) filter.value = requested;
  };

  const initialize = async () => {
    status.textContent = "Loading the search index…";
    try {
      pagefind = await import(`/pagefind/pagefind.js?v=${SEARCH_INDEX_VERSION}`);
      await pagefind.options({
        ranking: {
          termFrequency: 0.65,
          pageLength: 0.45,
          metaWeights: { title: 8, summary: 3, category: 2 }
        }
      });
      input.value = new URLSearchParams(window.location.search).get("q") || "";
      await populateFilters();
      await render();
    } catch (error) {
      console.error("Portfolio search initialization failed", error);
      status.textContent = "Search could not load. Browse the Library, Cases, Methods, or Labs from the navigation above.";
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearTimeout(debounceTimer);
    page = 1;
    setUrl();
    render();
  });

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      page = 1;
      setUrl();
      render();
    }, 180);
  });

  filter.addEventListener("change", () => {
    page = 1;
    setUrl();
    render();
  });

  initialize();
})();
