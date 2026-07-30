# CLAUDE.md

Guidance for working in this repo, with a focus on **keeping the Library updated**.

## Repo layout

This is a static GitHub Pages site served from the repo root (`drewklauser.com`).

- `index.html`, `me/`, `assets/` — the main personal site.
- `library/` — the Library: plain HTML/CSS/JS, no build step. Edit files here directly.
- `scripts/` — optional local helpers (cover-art auto-fetch); never required to deploy.

There is **no build step and no CI**. Whatever is committed is what goes live —
editing a file under `library/` and pushing is the entire deploy process.

## The Library

The Library is a hand-written static site. The browser fetches `books.yaml` and
renders everything client-side (via a vendored copy of `js-yaml`, `library/vendor/js-yaml.min.js`).

- **Data:** `library/books.yaml`
- **Covers:** `library/covers/{slug}.jpg`
- **Pages:** `library/index.html` (home), `library/all/index.html` (browse-all)
- **Shared render logic:** `library/assets/lib.js` (constants, YAML loading, cover
  fallback, modal), `library/assets/home.js`, `library/assets/all.js`
- **Styles:** `library/assets/style.css`

### Adding a book

1. Add an entry to the `books:` list in `library/books.yaml`:

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
   (To add a new category, also add it to `CATEGORY_COLORS` in
   `library/assets/lib.js`.)

2. **Cover art.** Each cover is `library/covers/{slug}.jpg`, where `slug` is the title
   lowercased, with non-alphanumerics removed and spaces turned into hyphens
   (e.g. `Ikigai` → `ikigai.jpg`). There's no build step to auto-fetch it, so either:
   - drop a JPG at `library/covers/{slug}.jpg` yourself, or
   - run the optional helper: `cd scripts && npm install && node fetch-covers.mjs`
     (searches Open Library for any book missing a cover).

   A book with no cover file simply 404s the `<img>` client-side and falls back to a
   colored placeholder with its title — nothing to configure.

3. **Push.** That's it — no build, no `library-src`, no regenerated output to commit.
   Just `library/books.yaml` (and any new `library/covers/*.jpg`).

### "In progress" vs. finished — counting logic

`in_progress: true` marks a book as currently being read.

- An in-progress book shows **only** in the "Currently Reading" section on the home page.
- It does **not** count toward its year's shelf or the header totals
  ("X books across Y years") until `in_progress` is set back to `false`.
- The year-counting logic lives in `library/assets/home.js` — it derives
  `finishedBooks = books.filter(b => !b.in_progress)` and builds the yearly shelves
  and totals from that.

So the normal flow for a book you're reading: add it with `in_progress: true`, then
flip it to `false` (and confirm `year_read`) once you finish it.

> Note: the "Browse all books" page (`library/all/index.html`) intentionally lists
> **every** book in the library, including in-progress ones, so its count can be one
> higher than the home page.

## Conventions

- Develop on a feature branch; don't push directly to the default branch.
- Don't open a pull request unless explicitly asked.
