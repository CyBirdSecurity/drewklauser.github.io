# drewklauser.com

Source for [drewklauser.com](https://drewklauser.com), a static site served directly from
this repo via GitHub Pages (see `CNAME`). There is **no CI build step** — whatever is
committed under any of the directories below is what goes live.

## Layout

- `index.html`, `assets/` — the main personal site ("Drew Klauser | Security
  Engineering & Leadership").
- `me/` — a links page.
- `myfi/` — a personal finance / retirement dashboard page.
- `library/` — the **built** Library site (deployed artifact, committed to git).
- `library-src/` — the **source** for the Library, an [Astro](https://astro.build) app.
  Edit here, then rebuild into `library/`.
- `404.md` — custom 404 page.

## The Library

The Library is a small Astro app for tracking books read, backed by a single YAML data
file. See [CLAUDE.md](CLAUDE.md) for the full guide to adding books, cover art, and the
"in progress" vs. finished counting logic.

Quick reference, from `library-src/`:

```bash
npm install        # first time only
npm run dev        # local dev server
npm run build      # runs fetch-covers, then writes the static site to ../library/
```

Any change to the Library must be rebuilt and the regenerated `library/` output
committed alongside the `library-src/` source change.

## Conventions

- Develop on a feature branch; don't push directly to the default branch.
- Don't open a pull request unless explicitly asked.
