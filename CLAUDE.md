# CLAUDE.md

Guidance for working in this repo, with a focus on **keeping the Library updated**.

## Repo layout

This is a static GitHub Pages site served from the repo root (`drewklauser.com`).

- `index.html`, `me/`, `assets/` — the main personal site.
- `library/` — the **built** Library site (deployed artifact, committed to git).
- `library-src/` — the **source** for the Library (an Astro app). Edit here.

There is **no CI build step**. Whatever is committed under `library/` is what goes
live, so any Library change must be **rebuilt and the `library/` output committed
alongside the source**.

## The Library

The Library is an Astro app. All book data lives in one file:

- **Data:** `library-src/src/data/books.yaml`
- **Covers:** `library-src/public/covers/{slug}.jpg` (copied to `library/covers/` on build)
- **Page logic:** `library-src/src/pages/index.astro` (home) and `all.astro` (browse-all)
- **Types/helpers:** `library-src/src/utils/books.ts`

### Adding a book

1. Add an entry to the `books:` list in `library-src/src/data/books.yaml`:

   ```yaml
   - title: "Book Title"
     author: "Author Name"          # multiple authors: "First Author, Second Author"
     year_read: 2026                 # the year it was finished
     categories: [Self-Help]         # one or more; see allowed values below
     medium: audiobook               # hardcover | paperback | audiobook | ebook
     in_progress: false              # true while still reading (see logic below)
     ranking: null                   # 1–10 puts it in the Top 10 section; otherwise null
     notes: ""                       # optional, shown in the book's modal
   ```

   **Allowed `categories`:** Biography, Business, Cybersecurity, Fiction, Finance,
   Leadership, Management, Productivity, Science, Self-Help, Sports, Technology.
   (To add a new category, also add it to `Category` and `CATEGORY_COLORS` in
   `library-src/src/utils/books.ts`.)

2. **Cover art.** Each cover is `public/covers/{slug}.jpg`, where `slug` is the title
   lowercased, with non-alphanumerics removed and spaces turned into hyphens
   (e.g. `Ikigai` → `ikigai.jpg`). On build, `scripts/fetch-covers.mjs` auto-downloads
   any **missing** cover from Open Library — so usually you can just run the build and
   it appears. If a cover can't be fetched automatically (no match, or no network
   access to Open Library), drop a JPG at `library-src/public/covers/{slug}.jpg`
   yourself. A book with no cover falls back to a colored placeholder with its title.

3. **Build and commit.** From `library-src/`:

   ```bash
   npm install        # first time only
   npm run build      # runs fetch-covers, then writes the static site to ../library/
   ```

   Then commit **both** the source changes and the regenerated output, e.g.:
   `library-src/src/data/books.yaml`, the new `library-src/public/covers/*.jpg`,
   and the rebuilt `library/` files (`library/index.html`, `library/all/index.html`,
   `library/covers/*.jpg`).

### "In progress" vs. finished — counting logic

`in_progress: true` marks a book as currently being read.

- An in-progress book shows **only** in the "Currently Reading" section on the home page.
- It does **not** count toward its year's shelf or the header totals
  ("X books across Y years") until `in_progress` is set back to `false`.
- The year-counting logic lives in `library-src/src/pages/index.astro` — the home page
  derives `finishedBooks = books.filter(b => !b.in_progress)` and builds the yearly
  shelves and totals from that.

So the normal flow for a book you're reading: add it with `in_progress: true`, then
flip it to `false` (and confirm `year_read`) once you finish it.

> Note: the "Browse all books" page (`all.astro`) intentionally lists **every** book in
> the library, including in-progress ones, so its count can be one higher than the home page.

## Conventions

- Develop on a feature branch; don't push directly to the default branch.
- Don't open a pull request unless explicitly asked.
