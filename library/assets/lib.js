// Shared data loading + render helpers for the Library (no build step —
// this fetches and parses books.yaml directly in the browser).

const CATEGORY_COLORS = {
  Biography:     '#8B4513',
  Business:      '#1e3f8c',
  Cybersecurity: '#065f46',
  Fiction:       '#4c1d95',
  Finance:       '#92400e',
  Leadership:    '#991b1b',
  Management:    '#1e3a8a',
  Productivity:  '#9a3412',
  Science:       '#075985',
  'Self-Help':   '#14532d',
  Sports:        '#15803d',
  Technology:    '#334155',
};

const MEDIUM_ICONS = {
  hardcover: '📖',
  paperback: '📄',
  audiobook: '🎧',
  ebook:     '📱',
};

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60);
}

function categoryColor(categories) {
  return CATEGORY_COLORS[categories[0]] ?? '#334155';
}

// Base path to the library root, so pages nested under e.g. /all/ can
// still resolve covers/books.yaml correctly.
function libraryBase() {
  return document.querySelector('meta[name="library-base"]')?.content ?? '.';
}

async function loadBooks() {
  const base = libraryBase();
  const res = await fetch(`${base}/books.yaml`);
  const text = await res.text();
  const raw = jsyaml.load(text);
  return raw.books.map(b => {
    const slug = slugify(b.title);
    return { ...b, slug, coverUrl: `${base}/covers/${slug}.jpg` };
  });
}

// Builds a cover element that tries the real cover image first and falls
// back to a colored placeholder div if the image 404s (there's no
// build-time step anymore to know in advance whether a cover exists).
function coverEl(book, { width, height, imgClass, placeholderClass, extraPlaceholder } = {}) {
  const wrap = document.createElement('div');
  const img = document.createElement('img');
  img.src = book.coverUrl;
  img.alt = `Cover of ${book.title}`;
  img.loading = 'lazy';
  // img is inline by default, which leaves a few px of baseline gap below
  // it — enough for the spine-edge color to bleed past the cover art.
  img.style.display = 'block';
  if (width) { img.width = width; img.style.width = `${width}px`; }
  if (height) { img.height = height; img.style.height = `${height}px`; }
  if (width && height) img.style.objectFit = 'cover';
  if (imgClass) img.className = imgClass;

  img.onerror = () => {
    const bg = categoryColor(book.categories);
    const placeholder = document.createElement('div');
    placeholder.className = placeholderClass ?? '';
    placeholder.style.backgroundColor = bg;
    if (width) placeholder.style.width = `${width}px`;
    if (height) placeholder.style.height = `${height}px`;
    placeholder.innerHTML = extraPlaceholder
      ? extraPlaceholder(book)
      : `<span>${escapeHtml(book.title)}</span>`;
    wrap.replaceChildren(placeholder);
  };

  wrap.replaceChildren(img);
  return wrap;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function bookDataset(el, book) {
  el.dataset.book = JSON.stringify({
    title: book.title, author: book.author, year_read: book.year_read,
    categories: book.categories, medium: book.medium,
    coverUrl: book.coverUrl, notes: book.notes,
  });
}

function wireOpenOnActivate(el) {
  const open = () => window.openBookModal?.(JSON.parse(el.dataset.book ?? '{}'));
  el.addEventListener('click', open);
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
}

// Wires the single shared <dialog id="book-modal"> instance present on
// every page. Call once per page after the DOM is ready.
function initBookModal() {
  const modal = document.getElementById('book-modal');
  if (!modal) return;

  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') modal.close();
  });

  window.openBookModal = function (book) {
    const coverWrap = document.getElementById('modal-cover-wrap');
    if (coverWrap) {
      coverWrap.replaceChildren(coverEl(book, {
        imgClass: 'modal-cover-img',
        placeholderClass: 'modal-cover-placeholder',
        extraPlaceholder: b => escapeHtml(b.title),
      }));
    }

    const catsEl = document.getElementById('modal-categories');
    if (catsEl) {
      catsEl.innerHTML = (book.categories ?? []).map(cat => {
        const color = CATEGORY_COLORS[cat] ?? '#5C4033';
        return `<span class="category-badge" style="background-color:${color};">${escapeHtml(cat)}</span>`;
      }).join('');
    }

    const titleEl = document.getElementById('modal-title');
    titleEl.textContent = book.title;
    titleEl.href = `https://www.amazon.com/s?k=${encodeURIComponent(book.title + ' ' + book.author)}`;
    document.getElementById('modal-author').textContent = book.author;
    document.getElementById('modal-medium').textContent = `${MEDIUM_ICONS[book.medium] ?? ''} ${book.medium}`;
    document.getElementById('modal-year').textContent = `Read in ${book.year_read}`;

    const notesEl = document.getElementById('modal-notes');
    if (notesEl) {
      notesEl.textContent = book.notes ?? '';
      notesEl.style.display = book.notes ? 'block' : 'none';
    }

    modal.showModal();
  };
}
