initRecipeModal();

loadRecipes().then(recipes => {
  const sorted = [...recipes].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

  const allCategories = [...new Set(recipes.flatMap(r => r.categories ?? []))].sort();
  const allDifficulties = ['easy', 'medium', 'hard'].filter(d => recipes.some(r => r.difficulty === d));

  document.getElementById('hero-subtitle').textContent =
    `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} in the cookbook`;

  renderFilters(allCategories, allDifficulties);
  renderGrid(sorted);
});

function renderFilters(allCategories, allDifficulties) {
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

  const diffPills = document.getElementById('diff-pills');
  allDifficulties.forEach(diff => {
    const btn = document.createElement('button');
    btn.className = 'filter-pill';
    btn.dataset.filterType = 'diff';
    btn.dataset.filterVal = diff;
    btn.textContent = diff;
    diffPills.appendChild(btn);
  });
}

function renderGrid(recipes) {
  const grid = document.getElementById('recipes-grid');
  const emptyEl = document.getElementById('recipes-empty');

  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.setAttribute('aria-label', recipe.title);
    recipeDataset(card, recipe);
    card.dataset.title = recipe.title.toLowerCase();
    card.dataset.tags = (recipe.tags ?? []).join(',').toLowerCase();
    card.dataset.cats = (recipe.categories ?? []).join(',');
    card.dataset.diff = recipe.difficulty ?? '';

    const coverWrap = document.createElement('div');
    coverWrap.className = 'recipe-cover-wrap';
    coverWrap.appendChild(heroEl(recipe, {
      imgClass: 'recipe-cover-img',
      placeholderClass: 'recipe-cover-placeholder',
      extraPlaceholder: r => `<span>${escapeHtml(r.title)}</span>`,
    }));

    const totalMin = (recipe.prep_minutes ?? 0) + (recipe.cook_minutes ?? 0);
    const info = document.createElement('div');
    info.className = 'recipe-info';
    info.innerHTML = `
      <p class="recipe-title">${escapeHtml(recipe.title)}</p>
      <div class="recipe-meta">
        ${totalMin ? `<span>${totalMin} min</span> <span>·</span>` : ''}
        <span style="text-transform:capitalize;">${escapeHtml(recipe.difficulty ?? '')}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:5px;">
        ${(recipe.categories ?? []).map(cat => `<span class="category-badge" style="background-color:${CATEGORY_COLORS[cat] ?? '#334155'};font-size:0.55rem;">${escapeHtml(cat)}</span>`).join('')}
      </div>`;

    card.append(coverWrap, info);
    wireOpenOnActivate(card);
    grid.appendChild(card);
  });

  const cards = Array.from(grid.querySelectorAll('.recipe-card'));
  let query = '', cat = '', diff = '';

  document.getElementById('recipes-search').addEventListener('input', e => {
    query = e.target.value.toLowerCase().trim();
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
      if (type === 'diff') diff = val;
      applyFilters();
    });
  });

  function applyFilters() {
    let visible = 0;
    cards.forEach(card => {
      const matchQ = !query || card.dataset.title.includes(query) || card.dataset.tags.includes(query);
      const matchCat = !cat || card.dataset.cats.split(',').includes(cat);
      const matchDiff = !diff || card.dataset.diff === diff;
      const show = matchQ && matchCat && matchDiff;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    emptyEl.style.display = visible === 0 ? '' : 'none';
    grid.style.display = visible === 0 ? 'none' : '';
  }
}
