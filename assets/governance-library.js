(() => {
  const entries = Array.from(document.querySelectorAll('.library-entry'))
    .sort((left, right) => Number(right.dataset.sequence) - Number(left.dataset.sequence));

  const carousel = document.querySelector('[data-latest-carousel]');
  const previous = document.querySelector('[data-carousel-previous]');
  const next = document.querySelector('[data-carousel-next]');

  if (carousel && previous && next && entries.length) {
    const category = carousel.querySelector('.carousel-category');
    const title = carousel.querySelector('.carousel-feature h3 a');
    const summary = carousel.querySelector('.carousel-summary');
    const read = carousel.querySelector('.carousel-read');
    const pdf = carousel.querySelector('.carousel-pdf');
    const ordinal = carousel.querySelector('.carousel-ordinal');
    const progress = document.querySelector('.carousel-progress');
    const sequence = carousel.querySelector('.carousel-sequence span');
    let current = 0;

    const render = () => {
      const entry = entries[current];
      const sourceLink = entry.querySelector('h3 a');
      const pdfLink = entry.querySelector('.entry-links a:last-child');
      const position = String(current + 1).padStart(2, '0');

      category.textContent = `${entry.dataset.category} · Field note`;
      title.textContent = sourceLink.textContent;
      title.href = sourceLink.href;
      summary.textContent = entry.dataset.summary;
      read.href = sourceLink.href;
      pdf.href = pdfLink.href;
      ordinal.textContent = position;
      progress.textContent = `${position} / ${String(entries.length).padStart(2, '0')}`;
      sequence.style.transform = `scaleX(${(current + 1) / entries.length})`;
    };

    const move = (increment) => {
      current = (current + increment + entries.length) % entries.length;
      render();
    };

    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        move(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        move(1);
      }
    });

    render();
  }

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
