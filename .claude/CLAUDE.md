# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tooling and commands

**mise** for tool versions/tasks, **aube** as package manager (lockfile `aube-lock.yaml`). No npm/npx. `node_modules/.bin` on PATH via mise.

```sh
mise run dev       # dev server at http://localhost:4321
mise run build     # static build into dist/ + Pagefind search index
mise run build:demo # the same under CANTARE_BASE=/demo, as Pages publishes it
mise run preview   # serve the production build
mise run lint      # oxlint (strict, type-aware) + oxfmt check
mise run format    # oxfmt write
mise run check     # astro check (type-checks .astro templates)
mise run site:serve # MkDocs docs at http://localhost:8000
mise run site:check # mkdocs build --strict (fails on a broken link or anchor); SITE_DIR overrides the output dir
mise run song:check # asserts mills/song.ts word-grouping rules (which read the formatter's own HTML back), songbook matching, site config validation and the GLIMPSE layer lint rules
mise run fullcheck # the gate: frozen install, sync, lint, check, song:check, build:demo, site:check
```

No test suite. Quality gate: `mise run fullcheck`; `lint.yml` runs it on every PR, `.vekna.toml` uses it. Husky + lint-staged run `oxlint --fix` and oxfmt on commit. `oxlint.config.ts` holds the lint rules; oxlint reads an import as text, and its regex engine skips a lookahead pattern without an error, so `layers.check.ts` is what proves a layer rule bans anything.

`.vekna.toml` wires cabinet's PR rituals (`vekna cast refresh|review|labels`); vekna (with cabinet preinstalled) and its Python are pinned in `mise.toml`, so `mise install` provides them. Cabinet pushes over the `https-origin` remote with `gh` as credential helper, since a cast has no terminal for an ssh passphrase. One-time setup per clone: `git remote add https-origin https://github.com/fancysnake/cantare.git && gh auth setup-git`.

The docs are the only Python in the repo: MkDocs Material via mise's pipx backend (`--include-deps`, since the `mkdocs` binary belongs to a dependency), pinned like every other tool. Content is `docs/*.md` + `mkdocs.yml`; output `site/` is ignored by git, oxlint, oxfmt and tsconfig. Prose shared with the README (tagline, "Built with", licensing) is included from it via `pymdownx.snippets` — edit `README.md`, not the copy.

`.github/workflows/pages.yml` publishes to GitHub Pages on push to main: docs at `cantare.fancysnake.dev` (`mise run site:check` with `SITE_DIR=_site`), the repo's own songbook built with `CANTARE_BASE=/demo` and moved to `_site/demo`. `docs/CNAME` holds the custom domain. Actions are pinned to commit SHAs; Renovate bumps them.

Dev server serves Pagefind index from **last build** — run `mise run build` after adding songs to make them searchable in dev.

## Two usage paths

cantare runs from one codebase two ways (see `docs/getting-started.md`):

- **As a package** (git-installed): a consumer repo is just `package.json` + `cantare.config.json` + `songs/`, built with `npx cantare build ./songs`.
- **From source** (clone/dev): `mise run …` against the repo, which doubles as the demo (its `site.config.json` + `songs/` are the defaults).

`bin/cantare.js` is the CLI (`build`/`dev`/`preview`). It resolves the songs dir (positional, default `./songs`), `--config` (default `./cantare.config.json`, falling back to the bundled `site.config.json`), and `--out` (default `./dist`) from the consumer's cwd, sets the env contract below, and invokes Astro's **programmatic API** with `root` = the package dir (from `import.meta.url`) so the bundled `astro.config.mjs`/`src/` load. Every env var defaults to today's behavior, so the clone/dev build is unchanged when they're unset. `package.json` ships a `bin` + `files` whitelist; `prepare` is guarded (`husky || true`) so consumer/git installs don't fail.

| Env var             | Default (clone/dev)      | Meaning                          |
| ------------------- | ------------------------ | -------------------------------- |
| `CANTARE_SONGS_DIR` | `songs`                  | directory of `.cho` files        |
| `CANTARE_CONFIG`    | `<pkg>/site.config.json` | path to the site/theme config    |
| `CANTARE_OUT_DIR`   | `./dist`                 | static output directory          |
| `CANTARE_BASE`      | `/`                      | sub-path the site is served from |

## Architecture

Static Astro songbook. Songs: ChordPro `.cho` files in `songs/`; filename = URL slug. Branding (name, description, URL, locale) and optional theming live in the config file — `site.config.json` (clone/dev default) or the consumer's `cantare.config.json`.

- `src/lib/pacts/`: the GLIMPSE pacts layer — the data shapes that cross layers (`SongMeta`, `SongbookConfig`, `SiteConfig`, `ChordPosition`, `SongLink`), their zod schemas, and `slugify`. It imports no other project code, the framework or Node (`astro/zod` excepted); the lint config enforces it.
- `src/lib/mills/`: the GLIMPSE mills layer — the logic: song parsing and rendering, songbook matching, facet grouping, chord naming, chord diagram drawing, the internal links (`routes.ts`), the UI strings (`i18n.ts`) and the theme CSS (`theme.ts`). It imports pacts and pure libraries only; the locale, the base path and the UI labels arrive as arguments.
- `src/lib/links/`: the GLIMPSE links layer — outside-world access, one folder per port and one module per adapter: `songs/fs.ts` (reads the `.cho` files, rejects a duplicate slug), `config/virtual.ts` (the site config from `virtual:cantare-config`), `chords/chords-db.ts` (the chord database: `fingeringsForSuffixes` returns the fingerings, all twelve roots, for the suffixes it is given). It imports pacts only and returns pacts shapes. Only inits imports it.
- `src/lib/inits/`: the GLIMPSE inits layer — the one place that reads the environment and the config, calls links, and binds mills to them. Gates import their services from it. `site.ts`: the site config, `locale` and `t`; it runs in the build and in the browser. `sheet.ts`: song rendering and `chordDiagram`, for the song page and its browser scripts. `pages.ts`: build only — `allSongs()`, `facets(key)`, `loadSongbookOptions()`, `headCss()` (async), `diagramDataFor(chordNames)` and `routes`, the object of every href. `content.ts`: the song collection loader and its schema; it reads `CANTARE_SONGS_DIR`. `songbooks.ts`: build only — the checked config's songbook matchers, which `content.ts` and `pages.ts` import.
- Gates: `src/pages/`, `src/layouts/`, `src/components/`, `src/content.config.ts` and `bin/`, declared in place by the lint config. A gate imports pacts and inits only, and may not import `getCollection`. Importing inits is a named exemption: a static build hands neither `getStaticPaths` nor a browser script its services, so they import them. A browser script imports `inits/site.ts` and `inits/sheet.ts` only; `inits/pages.ts` would pull the chord database into the bundle, and no lint rule catches that.
- `astro.config.mjs`: reads the config via `fs` at `CANTARE_CONFIG` (Node-only, runs at build start), sets `site`/`outDir`, and exposes the parsed config as a baked-in literal through a tiny inline Vite plugin (`virtual:cantare-config`) — safe in **both** Node and browser bundles.
- Site config: `links/config/virtual.ts` imports `virtual:cantare-config` (typed via `src/virtual.d.ts`), and `inits/site.ts` re-exports it as `site`. `SiteConfig` is inferred from `siteConfigSchema` (in pacts), a strict object with optional `theme`/`themeDark` maps. `inits/songbooks.ts` checks the whole config against it, through `mills/config.ts`, when first imported; an unknown key or a wrong type fails the build. Build code reads songbooks from that module, not from `site.songbooks`. The literal that reaches the browser is the raw config, and no browser script imports the schema. `mills/theme.ts` turns the two maps into `--color-*` overrides (keys minus the prefix) with bumped specificity (`:root:root`) so they win regardless of where Astro hoists the inline `<style>`. `inits/site.ts` builds `t` from the config literal, so client scripts importing `t` get no fs/virtual leakage into the browser.
- `src/content.config.ts`: defines the song collection from `inits/content.ts`, whose loader gets the `*.cho` files of `CANTARE_SONGS_DIR` (default `songs`) from `links/songs/fs.ts`, parses with ChordSheetJS, and extracts metadata into the schema.
- `src/lib/mills/song.ts`: **single parse/render path shared by build and browser** — build renders initial HTML; the song page's client script reaches the same module through `inits/sheet.ts` to re-render on transposition. Route rendering changes through it or server/client output diverges.
- Chord diagrams: `src/lib/links/chords/chords-db.ts` (build-time only) imports `@tombatossals/chords-db` (~900 kB) and is the only code that reads it; `fingeringsForSuffixes` returns all 12 roots per suffix, so client-side transposition lookups work offline. `pacts/chord.ts` owns the `root|suffix` key (`diagramKey`). `mills/chord-lookup.ts`: chord-name parsing, suffix normalization, enharmonics, and `diagramSuffixes`, which turns a song's chord names into the suffixes to look up. `mills/chord-diagram.ts`: SVG renderer; `chordDiagramFor` is the one name → diagram path for build and browser; `inits/sheet.ts` binds the label to it as `chordDiagram`.
- `src/pages/songs/[slug].astro`: embeds ChordPro source + diagram subset as inline JSON `<script>` blocks; client scripts do transposition (dispatches `song:rerendered`), autoscroll, diagram updates.
- `src/lib/mills/routes.ts`: **every internal link, as a finished href** (`songHref`, `artistHref`, …), built for a base path; `inits/pages.ts` binds it to `CANTARE_BASE` and exports them as one `routes` object, whose `url()` serves the one asset path that has no route (the Pagefind bundle). Templates never write a path — a hand-written `href="/songs/…"` type-checks and lints, then breaks under a sub-path. `[slug].astro` pages own the slug in `getStaticPaths` via `src/lib/pacts/slug.ts`; `routes.ts` owns the link, and the two must agree.
- Search: Pagefind via `astro-pagefind` — song pages mark `data-pagefind-body`/`data-pagefind-meta`/`data-pagefind-filter`; artist, album, tag double as facets.
- Songbooks: `src/lib/mills/songbook.ts` (pure, so `song:check` runs it under plain Node) turns the validated config `songbooks` into matchers; the content loader stores each song's membership as `song.data.songbooks`, which templates bake into `data-songbooks*` attributes; generated CSS keyed on `<html data-songbook>` (set from `localStorage` before first paint) does the hiding, so lists need no JS. Search narrows via a hidden `songbook` Pagefind filter; switching dispatches `songbook:changed`.

## Conventions

- UI strings live in `src/lib/mills/i18n.ts`; gates read them as `t.…` from `inits/site.ts`, in the locale from `site.config.json`. New user-facing text needs both `en` and `pl` entries.
- Theme + chords-visibility persist in `localStorage`, applied by inline script in `src/layouts/Base.astro` **before first paint**; toggles stay `hidden` until JS enables them (no-JS gets working defaults).
- Inline JSON via `set:html` escapes `<` as `\u003c` — preserve when adding embedded data.
- Songs in `songs/` are public-domain fixtures with `{copyright}` directives; real collections live outside the repo.
