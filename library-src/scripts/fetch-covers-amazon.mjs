/**
 * Fetches missing book cover images from Amazon's image service.
 * Resolves title + author to ISBN-10 candidates via Google Books and
 * Open Library, then downloads the high-res Amazon cover for each ISBN
 * until one works. Falls back to the Open Library cover if Amazon has
 * no image for any ISBN.
 * Covers are saved to public/covers/{slug}.jpg and cached between runs.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const COVERS_DIR = join(ROOT, 'public', 'covers');
const BOOKS_FILE = join(ROOT, 'src', 'data', 'books.yaml');
const DELAY_MS = 600;
const MIN_BYTES = 5000; // Amazon returns a tiny GIF/JPG for missing covers

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60);
}

function firstAuthor(authorStr) {
  return authorStr.split(',')[0].trim();
}

// Convert ISBN-13 (978 prefix only) to ISBN-10
function isbn13to10(isbn13) {
  const s = isbn13.replace(/[^0-9X]/gi, '');
  if (s.length !== 13 || !s.startsWith('978')) return null;
  const core = s.substring(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (10 - i) * Number(core[i]);
  const check = (11 - (sum % 11)) % 11;
  return core + (check === 10 ? 'X' : String(check));
}

function normalizeIsbns(isbns) {
  const out = [];
  for (const raw of isbns) {
    const s = String(raw).replace(/[^0-9X]/gi, '');
    if (s.length === 10) out.push(s);
    else if (s.length === 13) {
      const ten = isbn13to10(s);
      if (ten) out.push(ten);
    }
  }
  return [...new Set(out)];
}

async function isbnsFromGoogleBooks(title, author) {
  const q = encodeURIComponent(`intitle:${title} inauthor:${firstAuthor(author)}`);
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=5&fields=items(volumeInfo(title,industryIdentifiers))`;
  let res;
  for (let attempt = 0; ; attempt++) {
    res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.status !== 429 || attempt >= 4) break;
    await sleep(2000 * 2 ** attempt);
  }
  if (!res.ok) throw new Error(`gbooks ${res.status}`);
  const data = await res.json();
  const isbns = [];
  for (const item of data.items ?? []) {
    for (const id of item.volumeInfo?.industryIdentifiers ?? []) {
      if (id.type === 'ISBN_10' || id.type === 'ISBN_13') isbns.push(id.identifier);
    }
  }
  return normalizeIsbns(isbns);
}

async function openLibrarySearch(title, author) {
  const q = encodeURIComponent(`${title} ${firstAuthor(author)}`);
  const url = `https://openlibrary.org/search.json?q=${q}&limit=3&fields=isbn,cover_i,title,author_name`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`openlibrary ${res.status}`);
  const data = await res.json();
  const isbns = [];
  let coverId = null;
  for (const doc of data.docs ?? []) {
    if (doc.isbn) isbns.push(...doc.isbn);
    if (!coverId && doc.cover_i) coverId = doc.cover_i;
  }
  return { isbns: normalizeIsbns(isbns), coverId };
}

async function downloadImage(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  if (buf.byteLength < MIN_BYTES) return null;
  return Buffer.from(buf);
}

async function downloadAmazon(isbn10) {
  return downloadImage(`https://images-na.ssl-images-amazon.com/images/P/${isbn10}.01.LZZZZZZZ.jpg`);
}

async function downloadOpenLibrary(coverId) {
  return downloadImage(`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`);
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  if (!existsSync(COVERS_DIR)) {
    mkdirSync(COVERS_DIR, { recursive: true });
  }

  const { books } = yaml.load(readFileSync(BOOKS_FILE, 'utf8'));

  let fetched = 0;
  let skipped = 0;
  let failed = 0;

  for (const book of books) {
    const slug = slugify(book.title);
    const coverPath = join(COVERS_DIR, `${slug}.jpg`);

    if (existsSync(coverPath)) {
      skipped++;
      continue;
    }

    process.stdout.write(`Fetching: ${book.title} … `);

    try {
      let isbns = [];
      let olCoverId = null;
      const diag = [];

      try {
        isbns = await isbnsFromGoogleBooks(book.title, book.author);
      } catch (e) { diag.push(e.message); }

      const ol = await openLibrarySearch(book.title, book.author).catch(e => {
        diag.push(e.message);
        return { isbns: [], coverId: null };
      });
      isbns = [...new Set([...isbns, ...ol.isbns])];
      olCoverId = ol.coverId;

      let img = null;
      let source = null;

      for (const isbn of isbns.slice(0, 6)) {
        img = await downloadAmazon(isbn);
        if (img) { source = `amazon:${isbn}`; break; }
        await sleep(200);
      }

      if (!img && olCoverId) {
        img = await downloadOpenLibrary(olCoverId);
        if (img) source = `openlibrary:${olCoverId}`;
      }

      if (img) {
        writeFileSync(coverPath, img);
        console.log(`✓ (${source})`);
        fetched++;
      } else {
        console.log(`not found${diag.length ? ` (${diag.join('; ')})` : ` (${isbns.length} isbns tried)`}`);
        failed++;
      }
    } catch (err) {
      console.log(`error: ${err.message}`);
      failed++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nCovers: ${fetched} fetched, ${skipped} already cached, ${failed} not found`);
}

main().catch(err => {
  console.error('Cover fetch failed:', err);
  // Non-fatal — the build continues without covers
});
