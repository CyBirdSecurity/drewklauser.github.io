initBookModal();

loadBooks().then(books => {
  const currentlyReading = books.filter(b => b.in_progress);

  // A book that's still in progress lives only in "Currently Reading" — it
  // doesn't count toward a year's shelf (or the totals) until it's finished
  // and `in_progress` is flipped back to false.
  const finishedBooks = books.filter(b => !b.in_progress);

  const topTen = finishedBooks
    .filter(b => b.ranking !== null && b.ranking >= 1 && b.ranking <= 10)
    .sort((a, b) => (a.ranking ?? 99) - (b.ranking ?? 99));

  const booksByYear = finishedBooks.reduce((acc, book) => {
    (acc[book.year_read] ??= []).push(book);
    return acc;
  }, {});
  const years = Object.keys(booksByYear).map(Number).sort((a, b) => b - a);

  document.getElementById('hero-subtitle').textContent =
    `${finishedBooks.length} books across ${years.length} years`;

  renderCurrentlyReading(currentlyReading);
  renderTopTen(topTen);
  renderYearlyShelves(booksByYear, years);
});

function renderCurrentlyReading(books) {
  const container = document.getElementById('reading-content');
  if (books.length === 0) {
    container.innerHTML = `
      <div style="padding:3rem 0;color:var(--c-text-2);">
        <p style="font-size:1.1rem;font-weight:500;color:var(--c-text);margin-bottom:0.5rem;">Between books at the moment</p>
        <p style="font-size:0.875rem;">Set <code style="background:var(--c-bg-card);border:1px solid var(--c-border);padding:1px 8px;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:0.8rem;">in_progress: true</code> in books.yaml to show a book here.</p>
      </div>`;
    return;
  }

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:2.5rem;align-items:flex-end;';

  books.forEach(book => {
    const bg = categoryColor(book.categories);
    const card = document.createElement('div');
    card.className = 'reading-card';
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.setAttribute('aria-label', `${book.title} by ${book.author}`);
    card.style.cursor = 'pointer';
    bookDataset(card, book);

    const cover = document.createElement('div');
    cover.className = 'reading-cover';

    const spineEdge = document.createElement('div');
    spineEdge.className = 'reading-spine-edge';
    spineEdge.style.background = `linear-gradient(180deg,${bg}dd 0%,${bg} 100%)`;
    cover.appendChild(spineEdge);

    cover.appendChild(coverEl(book, {
      width: 120, height: 180,
      placeholderClass: 'reading-cover-placeholder',
      extraPlaceholder: b => `
        <span style="font-family:var(--font);font-size:0.75rem;font-weight:600;line-height:1.3;color:rgba(248,250,252,0.85);text-align:center;">${escapeHtml(b.title)}</span>
        <span style="font-size:0.65rem;color:rgba(248,250,252,0.45);margin-top:4px;">${escapeHtml(b.author.split(',')[0])}</span>`,
    }));

    const info = document.createElement('div');
    info.style.cssText = 'text-align:center;max-width:130px;';
    info.innerHTML = `
      <p style="font-family:var(--font);font-size:0.85rem;font-weight:600;color:var(--c-text);line-height:1.3;margin-bottom:3px;">${escapeHtml(book.title)}</p>
      <p style="font-size:0.75rem;color:var(--c-text-2);">${escapeHtml(book.author.split(',')[0])}</p>
      <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-top:6px;">
        ${book.categories.map(cat => `<span class="category-badge" style="background-color:${CATEGORY_COLORS[cat] ?? '#1e2433'};">${escapeHtml(cat)}</span>`).join('')}
      </div>`;

    card.append(cover, info);
    wireOpenOnActivate(card);
    wrap.appendChild(card);
  });

  container.replaceChildren(wrap);
}

function renderTopTen(books) {
  const container = document.getElementById('top10-content');
  if (books.length === 0) {
    container.innerHTML = `
      <div style="padding:3rem 0;color:var(--c-text-2);">
        <p style="font-size:1.1rem;font-weight:500;color:var(--c-text);margin-bottom:0.5rem;">Rankings coming soon</p>
        <p style="font-size:0.875rem;">Set <code style="background:var(--c-bg-card);border:1px solid var(--c-border);padding:1px 8px;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:0.8rem;">ranking: 1</code> through <code style="background:var(--c-bg-card);border:1px solid var(--c-border);padding:1px 8px;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:0.8rem;">5</code> in books.yaml.</p>
      </div>`;
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'top5-grid';

  books.forEach(book => {
    const bg = categoryColor(book.categories);
    const item = document.createElement('div');
    item.className = 'top5-item';
    item.setAttribute('role', 'button');
    item.tabIndex = 0;
    item.setAttribute('aria-label', `#${book.ranking} — ${book.title} by ${book.author}`);
    bookDataset(item, book);

    const coverWrap = document.createElement('div');
    coverWrap.style.position = 'relative';

    const rankBadge = document.createElement('div');
    rankBadge.className = 'top5-rank-badge';
    rankBadge.textContent = `#${book.ranking}`;
    coverWrap.appendChild(rankBadge);

    const cover = document.createElement('div');
    cover.className = 'reading-cover';
    const spineEdge = document.createElement('div');
    spineEdge.className = 'reading-spine-edge';
    spineEdge.style.background = `linear-gradient(180deg,${bg}dd 0%,${bg} 100%)`;
    cover.appendChild(spineEdge);
    cover.appendChild(coverEl(book, {
      width: 140, height: 210,
      placeholderClass: 'reading-cover-placeholder',
      extraPlaceholder: b => `
        <span style="font-family:var(--font);font-size:0.8rem;font-weight:600;line-height:1.3;color:rgba(248,250,252,0.85);text-align:center;">${escapeHtml(b.title)}</span>
        <span style="font-size:0.65rem;color:rgba(248,250,252,0.45);margin-top:4px;">${escapeHtml(b.author.split(',')[0])}</span>`,
    }));
    coverWrap.appendChild(cover);

    const info = document.createElement('div');
    info.style.cssText = 'text-align:center;max-width:150px;margin-top:0.75rem;';
    info.innerHTML = `
      <p style="font-family:var(--font);font-size:0.88rem;font-weight:600;color:var(--c-text);line-height:1.3;margin-bottom:3px;">${escapeHtml(book.title)}</p>
      <p style="font-size:0.75rem;color:var(--c-text-2);">${escapeHtml(book.author.split(',')[0])}</p>`;

    item.append(coverWrap, info);
    wireOpenOnActivate(item);
    grid.appendChild(item);
  });

  container.replaceChildren(grid);
}

const CATEGORY_LEGEND = [
  ['Biography', '#8B4513'], ['Business', '#1e3f8c'], ['Cybersecurity', '#065f46'],
  ['Fiction', '#4c1d95'], ['Finance', '#92400e'], ['Leadership', '#991b1b'],
  ['Management', '#1e3a8a'], ['Productivity', '#9a3412'], ['Science', '#075985'],
  ['Self-Help', '#14532d'], ['Sports', '#15803d'], ['Technology', '#334155'],
];

function renderYearlyShelves(booksByYear, years) {
  const container = document.getElementById('years-content');
  const shelves = document.createElement('div');
  shelves.className = 'yearly-shelves';

  years.forEach(year => {
    const books = booksByYear[year];
    const row = document.createElement('div');
    row.className = 'shelf-row';
    row.dataset.year = String(year);

    const header = document.createElement('div');
    header.className = 'shelf-header';
    header.innerHTML = `
      <span class="shelf-year">${year}</span>
      <span class="shelf-count">${books.length} ${books.length === 1 ? 'book' : 'books'}</span>`;

    const shelfBooks = document.createElement('div');
    shelfBooks.className = 'shelf-books';

    books.forEach(book => {
      const bg = categoryColor(book.categories);
      const el = document.createElement('div');
      el.className = 'shelf-book';
      el.setAttribute('role', 'button');
      el.tabIndex = 0;
      el.setAttribute('aria-label', `${book.title} by ${book.author}`);
      el.dataset.shelfCats = book.categories.join(',');
      bookDataset(el, book);

      el.appendChild(coverEl(book, {
        width: 72, height: 108,
        placeholderClass: 'shelf-book-placeholder',
        extraPlaceholder: b => `<span>${escapeHtml(b.title)}</span>`,
      }));

      const spineEdge = document.createElement('div');
      spineEdge.className = 'shelf-book-spine-edge';
      spineEdge.style.background = `linear-gradient(180deg,${bg}cc 0%,${bg} 100%)`;
      el.appendChild(spineEdge);

      wireOpenOnActivate(el);
      shelfBooks.appendChild(el);
    });

    const shelfLine = document.createElement('div');
    shelfLine.className = 'wood-shelf';

    row.append(header, shelfBooks, shelfLine);
    shelves.appendChild(row);
  });

  const filterBar = document.createElement('div');
  filterBar.style.cssText = 'margin-top:3rem;display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;';
  filterBar.innerHTML = `<span style="font-family:'JetBrains Mono',monospace;font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--c-text-2);margin-right:0.5rem;">Filter</span>`;
  CATEGORY_LEGEND.forEach(([name, color]) => {
    const btn = document.createElement('button');
    btn.className = 'category-badge category-filter-btn';
    btn.dataset.filterCat = name;
    btn.style.cssText = `background-color:${color};cursor:pointer;border:none;`;
    btn.textContent = name;
    filterBar.appendChild(btn);
  });

  container.replaceChildren(shelves, filterBar);

  let activeCategory = null;
  const filterBtns = filterBar.querySelectorAll('.category-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filterCat ?? null;
      activeCategory = activeCategory === cat ? null : cat;
      applyFilter();
    });
  });

  function applyFilter() {
    filterBtns.forEach(btn => {
      const isActive = btn.dataset.filterCat === activeCategory;
      btn.style.opacity = activeCategory === null || isActive ? '1' : '0.3';
      btn.style.outline = isActive ? '2px solid rgba(255,255,255,0.7)' : 'none';
      btn.style.outlineOffset = '2px';
    });

    shelves.querySelectorAll('.shelf-row').forEach(row => {
      let visible = 0;
      row.querySelectorAll('.shelf-book').forEach(book => {
        const cats = (book.dataset.shelfCats ?? '').split(',');
        const show = activeCategory === null || cats.includes(activeCategory);
        book.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      row.style.display = visible === 0 ? 'none' : '';
    });
  }
}
