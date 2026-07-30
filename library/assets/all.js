initBookModal();

loadBooks().then(books => {
  const sortedBooks = [...books].sort((a, b) =>
    a.author.localeCompare(b.author, undefined, { sensitivity: 'base' })
  );

  const allCategories = [...new Set(books.flatMap(b => b.categories))].sort();
  const allYears = [...new Set(books.map(b => b.year_read))].sort((a, b) => b - a);

  renderFilters(allCategories, allYears);
  renderGrid(sortedBooks);
});

function renderFilters(allCategories, allYears) {
  const catPills = document.getElementById('cat-pills');
  allCategories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-pill';
    btn.dataset.filterType = 'cat';
    btn.dataset.filterVal = cat;
    btn.style.setProperty('--pill-color', CATEGORY_COLORS[cat] ?? '#334155');
    btn.textContent = cat;
    catPills.appendChild(btn);
  });

  const yearPills = document.getElementById('year-pills');
  allYears.forEach(year => {
    const btn = document.createElement('button');
    btn.className = 'filter-pill';
    btn.dataset.filterType = 'year';
    btn.dataset.filterVal = String(year);
    btn.textContent = String(year);
    yearPills.appendChild(btn);
  });
}

function renderGrid(sortedBooks) {
  const grid = document.getElementById('books-grid');
  const emptyEl = document.getElementById('books-empty');
  const countEl = document.getElementById('books-count');

  sortedBooks.forEach(book => {
    const bg = categoryColor(book.categories);
    const card = document.createElement('div');
    card.className = 'all-book-card';
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.setAttribute('aria-label', `${book.title} by ${book.author}`);
    bookDataset(card, book);
    card.dataset.title = book.title.toLowerCase();
    card.dataset.author = book.author.toLowerCase();
    card.dataset.cats = book.categories.join(',');
    card.dataset.year = String(book.year_read);

    const coverWrap = document.createElement('div');
    coverWrap.className = 'all-book-cover-wrap';
    coverWrap.appendChild(coverEl(book, {
      imgClass: 'all-book-img',
      placeholderClass: 'all-book-placeholder',
      extraPlaceholder: b => `<span>${escapeHtml(b.title)}</span>`,
    }));

    const info = document.createElement('div');
    info.className = 'all-book-info';
    info.innerHTML = `
      <p class="all-book-title">${escapeHtml(book.title)}</p>
      <p class="all-book-author">${escapeHtml(book.author.split(',')[0])}</p>
      <div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:5px;">
        ${book.categories.map(cat => `<span class="category-badge" style="background-color:${CATEGORY_COLORS[cat] ?? '#334155'};font-size:0.55rem;">${escapeHtml(cat)}</span>`).join('')}
      </div>`;

    card.append(coverWrap, info);
    wireOpenOnActivate(card);
    grid.appendChild(card);
  });

  const cards = Array.from(grid.querySelectorAll('.all-book-card'));
  let query = '', cat = '', year = '';

  const searchEl = document.getElementById('books-search');
  searchEl.addEventListener('input', () => {
    query = searchEl.value.toLowerCase().trim();
    applyFilters();
  });

  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.filterType;
      const val = btn.dataset.filterVal;
      document.querySelectorAll(`.filter-pill[data-filter-type="${type}"]`)
        .forEach(b => b.classList.remove('filter-pill--active'));
      btn.classList.add('filter-pill--active');
      if (type === 'cat') cat = val;
      if (type === 'year') year = val;
      applyFilters();
    });
  });

  function applyFilters() {
    let visible = 0;
    cards.forEach(card => {
      const matchQ = !query || card.dataset.title.includes(query) || card.dataset.author.includes(query);
      const matchCat = !cat || card.dataset.cats.split(',').includes(cat);
      const matchYear = !year || card.dataset.year === year;
      const show = matchQ && matchCat && matchYear;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    emptyEl.style.display = visible === 0 ? '' : 'none';
    grid.style.display = visible === 0 ? 'none' : '';
    countEl.textContent = `${visible} book${visible !== 1 ? 's' : ''} · A–Z by author`;
  }

  countEl.textContent = `${sortedBooks.length} books · A–Z by author`;
}
