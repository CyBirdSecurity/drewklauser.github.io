# drewklauser.com

Source for [drewklauser.com](https://drewklauser.com), a static site served directly from
this repo via GitHub Pages (see `CNAME`). There is **no CI build step** — whatever is
committed under any of the directories below is what goes live.

## Layout

- `index.html`, `assets/` — the main personal site ("Drew Klauser | Security
  Engineering & Leadership").
- `me/` — a links page.
- `myfi/` — a personal finance / retirement dashboard page.
- `library/` — the Library: plain HTML/CSS/JS, no build step. Edit and push directly.
- `scripts/` — optional local helpers (cover-art auto-fetch); never required to deploy.
- `404.md` — custom 404 page.

## The Library

The Library is a hand-written static site for tracking books read — the browser fetches
`library/books.yaml` and renders everything client-side, so there's nothing to build.
See [CLAUDE.md](CLAUDE.md) for the full guide to adding books, cover art, and the
"in progress" vs. finished counting logic.

Editing `library/books.yaml` (and adding any new cover art to `library/covers/`) and
pushing is the entire workflow — no install, no build, no separate output to commit.

## Conventions

- Develop on a feature branch; don't push directly to the default branch.
- Don't open a pull request unless explicitly asked.
