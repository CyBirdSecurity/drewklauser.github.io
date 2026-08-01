// Shared data loading + render helpers for the Recipes cookbook (no build
// step — fetches and parses recipes.yaml directly in the browser, same
// pattern as library/assets/lib.js).

const CATEGORY_COLORS = {
  Breakfast: '#c2703d',
  Lunch:     '#3f6212',
  Dinner:    '#7c2d12',
  Pasta:     '#b45309',
  Snacks:    '#7c3aed',
  Dessert:   '#be185d',
  Baking:    '#a16207',
  Drinks:    '#0e7490',
  'No-Bake': '#5b21b6',
  Sides:     '#166534',
  Sauces:    '#9f1239',
};

const DIFFICULTY_COLORS = {
  easy:   '#166534',
  medium: '#b45309',
  hard:   '#991b1b',
};

// Units that don't take a trailing "s" when the quantity isn't 1 — mostly
// abbreviations that read the same either way ("2 tbsp", not "2 tbsps").
const NO_PLURAL_UNITS = new Set(['tbsp', 'tsp', 'lb', 'oz', 'fl oz', 'g', 'kg', 'ml', 'l', 'burrata']);

// Fractions cooks actually use, snapped to the nearest eighth (or third) —
// scaling servings rarely lands on a clean decimal, so we round to whatever
// a measuring cup/spoon can actually produce.
const FRACTION_GLYPHS = [
  [1 / 8, '⅛'], [1 / 4, '¼'], [1 / 3, '⅓'], [3 / 8, '⅜'], [1 / 2, '½'],
  [5 / 8, '⅝'], [2 / 3, '⅔'], [3 / 4, '¾'], [7 / 8, '⅞'],
];

function formatQty(qty) {
  if (qty == null) return '';
  const whole = Math.floor(qty + 1e-9);
  const frac = qty - whole;
  if (frac < 0.04) return String(Math.round(qty));
  if (frac > 0.96) return String(whole + 1);

  let best = FRACTION_GLYPHS[0];
  let bestDiff = Infinity;
  for (const pair of FRACTION_GLYPHS) {
    const diff = Math.abs(frac - pair[0]);
    if (diff < bestDiff) { bestDiff = diff; best = pair; }
  }
  return whole > 0 ? `${whole}${best[1]}` : best[1];
}

function pluralizeUnit(unit, qty) {
  if (!unit) return '';
  if (qty <= 1.04) return unit; // "½ cup", "1 cup" — only plural above 1
  if (NO_PLURAL_UNITS.has(unit)) return unit;
  return unit.endsWith('s') ? unit : `${unit}s`;
}

// Renders one ingredient line at a given scale factor. Structured
// ingredients ({qty, unit, item}) scale with the servings stepper; plain
// strings ("salt and pepper, to taste") are shown as-is at any serving count.
function formatIngredientLine(ing, factor = 1) {
  if (typeof ing === 'string') return escapeHtml(ing);

  const scaledQty = ing.qty != null ? ing.qty * factor : null;
  const qtyStr = scaledQty != null ? formatQty(scaledQty) : '';
  const unitStr = pluralizeUnit(ing.unit, scaledQty ?? 1);
  const lead = [qtyStr, unitStr].filter(Boolean).join(' ');
  const line = [lead, ing.item ?? ''].filter(Boolean).join(' ')
    .replace(/\s+,/g, ',')
    .trim();
  return escapeHtml(line);
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60);
}

function categoryColor(categories) {
  return CATEGORY_COLORS[categories?.[0]] ?? '#334155';
}

// Base path to the recipes root, so pages nested under e.g. /cook/ can
// still resolve images/recipes.yaml correctly.
function recipesBase() {
  return document.querySelector('meta[name="recipes-base"]')?.content ?? '.';
}

async function loadRecipes() {
  const base = recipesBase();
  const res = await fetch(`${base}/recipes.yaml`);
  const text = await res.text();
  const raw = jsyaml.load(text);
  return raw.recipes.map(r => {
    const slug = slugify(r.title);
    const heroUrl = `${base}/images/${slug}/${r.image ?? 'hero.jpg'}`;
    return { ...r, slug, heroUrl, yield_label: r.yield_label || 'servings' };
  });
}

async function loadRecipeBySlug(slug) {
  const recipes = await loadRecipes();
  return recipes.find(r => r.slug === slug) ?? null;
}

function stepImageUrl(recipe, step) {
  if (!step.image) return null;
  return `${recipesBase()}/images/${recipe.slug}/${step.image}`;
}

// Builds a hero/card image element that tries the real photo first and
// falls back to a colored placeholder if it 404s (no build-time step to
// know in advance whether a photo exists).
function heroEl(recipe, { imgClass, placeholderClass, extraPlaceholder, src } = {}) {
  const wrap = document.createElement('div');
  // Percentage heights on the img/placeholder only resolve if this wrapper
  // itself has a definite height — it otherwise defaults to auto (shrink
  // to content), leaving the aspect-ratio box below it unfilled.
  wrap.style.width = '100%';
  wrap.style.height = '100%';
  const img = document.createElement('img');
  img.src = src ?? recipe.heroUrl;
  img.alt = recipe.title ? `Photo of ${recipe.title}` : '';
  img.loading = 'lazy';
  img.style.display = 'block';
  if (imgClass) img.className = imgClass;

  img.onerror = () => {
    const bg = categoryColor(recipe.categories);
    const placeholder = document.createElement('div');
    placeholder.className = placeholderClass ?? '';
    placeholder.style.backgroundColor = bg;
    placeholder.innerHTML = extraPlaceholder
      ? extraPlaceholder(recipe)
      : `<span>${escapeHtml(recipe.title ?? '')}</span>`;
    wrap.replaceChildren(placeholder);
  };

  wrap.replaceChildren(img);
  return wrap;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function recipeDataset(el, recipe) {
  el.dataset.recipe = JSON.stringify(recipe);
}

function wireOpenOnActivate(el) {
  const open = () => window.openRecipeModal?.(JSON.parse(el.dataset.recipe ?? '{}'));
  el.addEventListener('click', open);
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
}

// Wires the single shared <dialog id="recipe-modal"> instance present on
// every page. Call once per page after the DOM is ready.
function initRecipeModal() {
  const modal = document.getElementById('recipe-modal');
  if (!modal) return;

  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') modal.close();
  });

  window.openRecipeModal = function (recipe) {
    const heroWrap = document.getElementById('modal-hero-wrap');
    if (heroWrap) {
      heroWrap.replaceChildren(heroEl(recipe, {
        imgClass: 'modal-hero-img',
        placeholderClass: 'modal-hero-placeholder',
        extraPlaceholder: r => escapeHtml(r.title),
      }));
    }

    const catsEl = document.getElementById('modal-categories');
    if (catsEl) {
      catsEl.innerHTML = (recipe.categories ?? []).map(cat => {
        const color = CATEGORY_COLORS[cat] ?? '#334155';
        return `<span class="category-badge" style="background-color:${color};">${escapeHtml(cat)}</span>`;
      }).join('');
    }

    document.getElementById('modal-title').textContent = recipe.title;
    document.getElementById('modal-cuisine').textContent = recipe.cuisine ?? '';

    const diffEl = document.getElementById('modal-difficulty');
    diffEl.textContent = recipe.difficulty ?? '';
    diffEl.style.color = DIFFICULTY_COLORS[recipe.difficulty] ?? 'var(--c-text-2)';

    const totalMin = (recipe.prep_minutes ?? 0) + (recipe.cook_minutes ?? 0);
    document.getElementById('modal-time').textContent = totalMin ? `${totalMin} min` : '';

    const baseServings = recipe.servings ?? 1;
    let current = baseServings;
    const yieldLabel = recipe.yield_label || 'servings';
    const countEl = document.getElementById('modal-servings-count');
    const unitEl = document.getElementById('modal-servings-unit');
    const ingredientsEl = document.getElementById('modal-ingredients');

    function render() {
      countEl.textContent = current;
      unitEl.textContent = yieldLabel;
      const factor = current / baseServings;
      ingredientsEl.innerHTML = (recipe.ingredients ?? [])
        .map(ing => `<li>${formatIngredientLine(ing, factor)}</li>`)
        .join('');
    }
    render();

    document.getElementById('modal-servings-minus').onclick = () => {
      current = Math.max(1, current - 1);
      render();
    };
    document.getElementById('modal-servings-plus').onclick = () => {
      current = Math.min(99, current + 1);
      render();
    };

    const notesEl = document.getElementById('modal-notes');
    if (notesEl) {
      notesEl.textContent = recipe.notes ?? '';
      notesEl.style.display = recipe.notes ? 'block' : 'none';
    }

    const startBtn = document.getElementById('modal-start-cooking');
    if (startBtn) {
      startBtn.textContent = (recipe.categories ?? []).includes('Drinks') ? 'Start Mixing' : 'Start Cooking';
      const cookBase = recipesBase() === '.' ? 'cook' : `${recipesBase()}/cook`;
      startBtn.onclick = () => {
        window.location.href = `${cookBase}/?r=${recipe.slug}&servings=${current}`;
      };
    }

    modal.showModal();
  };
}
