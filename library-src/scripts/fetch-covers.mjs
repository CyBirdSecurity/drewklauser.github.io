/**
 * Fetches missing book cover images from Open Library at build time.
 * Covers are saved to public/covers/{slug}.jpg and cached between builds.
 * Run automatically via `npm run prebuild`.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const COVERS_DIR = join(ROOT, 'public', 'covers');
const BOOKS_FILE = join(ROOT, 'src', 'data', 'books.yaml');
const DELAY_MS = 400;

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

async function searchOpenLibrary(title, author) {
  const q = encodeURIComponent(`${title} ${firstAuthor(author)}`);
  const url = `https://openlibrary.org/search.json?q=${q}&limit=3&fields=cover_i,title,author_name`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const data = await res.json();
  const doc = data.docs?.find(d => d.cover_i);
  return doc?.cover_i ?? null;
}

async function downloadCover(coverId) {
  const url = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  // Open Library returns a 1x1 gif for missing covers — skip those
  if (buf.byteLength < 2000) return null;
  return Buffer.from(buf);
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
      const coverId = await searchOpenLibrary(book.title, book.author);
      if (!coverId) {
        console.log('not found');
        failed++;
      } else {
        const img = await downloadCover(coverId);
        if (img) {
          writeFileSync(coverPath, img);
          console.log('✓');
          fetched++;
        } else {
          console.log('no image');
          failed++;
        }
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
