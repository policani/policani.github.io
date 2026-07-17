(() => {
  const entries = Array.from(document.querySelectorAll('.library-entry'))
    .sort((left, right) => Number(right.dataset.sequence) - Number(left.dataset.sequence));

  const search = document.querySelector('[data-library-search]');
  const results = document.querySelector('[data-library-results]');
  const chapters = Array.from(document.querySelectorAll('[data-library-chapter]'));

  if (search && results) {
    search.addEventListener('input', () => {
      const query = search.value.trim().toLocaleLowerCase();
      let visible = 0;

      entries.forEach((entry) => {
        const content = `${entry.textContent} ${entry.dataset.category} ${entry.dataset.summary}`.toLocaleLowerCase();
        const matches = !query || content.includes(query);
        entry.hidden = !matches;
        if (matches) visible += 1;
      });

      chapters.forEach((chapter) => {
        chapter.hidden = !chapter.querySelector('.library-entry:not([hidden])');
      });

      results.textContent = query
        ? `${visible} field note${visible === 1 ? '' : 's'} match “${search.value.trim()}”.`
        : `Showing all ${entries.length} field notes.`;
    });
  }
})();
