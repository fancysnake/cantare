# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tooling and commands

**mise** for tool versions/tasks, **aube** as package manager (lockfile `aube-lock.yaml`). No npm/npx. `node_modules/.bin` on PATH via mise.

```sh
mise run dev       # dev server at http://localhost:4321
mise run build     # static build into dist/ + Pagefind search index
mise run preview   # serve the production build
mise run lint      # ESLint (strict, type-checked) + Prettier check
mise run format    # Prettier write
mise run check     # astro check (type-checks .astro templates)
```

No test suite. Quality gates: `mise run lint` + `mise run check` (also CI). Husky + lint-staged run `eslint --fix` and Prettier on commit.

Dev server serves Pagefind index from **last build** — run `mise run build` after adding songs to make them searchable in dev.

## Two usage paths

cantare runs from one codebase two ways (see README "Running your own instance"):

- **As a package** (git-installed): a consumer repo is just `package.json` + `cantare.config.json` + `songs/`, built with `npx cantare build ./songs`.
- **From source** (clone/dev): `mise run …` against the repo, which doubles as the demo (its `site.config.json` + `songs/` are the defaults).

`bin/cantare.js` is the CLI (`build`/`dev`/`preview`). It resolves the songs dir (positional, default `./songs`), `--config` (default `./cantare.config.json`, falling back to the bundled `site.config.json`), and `--out` (default `./dist`) from the consumer's cwd, sets the env contract below, and invokes Astro's **programmatic API** with `root` = the package dir (from `import.meta.url`) so the bundled `astro.config.mjs`/`src/` load. Every env var defaults to today's behavior, so the clone/dev build is unchanged when they're unset. `package.json` ships a `bin` + `files` whitelist; `prepare` is guarded (`husky || true`) so consumer/git installs don't fail.

| Env var             | Default (clone/dev)      | Meaning                       |
| ------------------- | ------------------------ | ----------------------------- |
| `CANTARE_SONGS_DIR` | `songs`                  | directory of `.cho` files     |
| `CANTARE_CONFIG`    | `<pkg>/site.config.json` | path to the site/theme config |
| `CANTARE_OUT_DIR`   | `./dist`                 | static output directory       |

## Architecture

Static Astro songbook. Songs: ChordPro `.cho` files in `songs/`; filename = URL slug. Branding (name, description, URL, locale) and optional theming live in the config file — `site.config.json` (clone/dev default) or the consumer's `cantare.config.json`.

- `astro.config.mjs`: reads the config via `fs` at `CANTARE_CONFIG` (Node-only, runs at build start), sets `site`/`outDir`, and exposes the parsed config as a baked-in literal through a tiny inline Vite plugin (`virtual:cantare-config`) — safe in **both** Node and browser bundles.
- `src/lib/site.ts`: imports `virtual:cantare-config` (typed via `src/virtual.d.ts`). `SiteConfig` has optional `theme`/`themeDark` maps; `themeCss()` emits `--color-*` overrides (keys minus the prefix) with bumped specificity (`:root:root`) so they win regardless of where Astro hoists the inline `<style>`. `i18n.ts` reads `site` from here, so client scripts importing `t` get the config as a literal (no fs/virtual leakage into the browser).
- `src/content.config.ts`: custom collection loader — reads `*.cho` from `CANTARE_SONGS_DIR` (default `songs`), parses with ChordSheetJS, extracts metadata into the schema.
- `src/lib/song.ts`: **single parse/render path shared by build and browser** — build renders initial HTML; song page's client script imports the same module to re-render on transposition. Route rendering changes through it or server/client output diverges.
- Chord diagrams: `src/lib/chord-data.ts` (build-time only) extracts a per-song subset of `@tombatossals/chords-db` (~900 kB) — all 12 roots per suffix used, so client-side transposition lookups work offline. `chord-lookup.ts`: chord-name parsing, suffix normalization, enharmonics. `chord-diagram.ts`: SVG renderer.
- `src/pages/songs/[slug].astro`: embeds ChordPro source + diagram subset as inline JSON `<script>` blocks; client scripts do transposition (dispatches `song:rerendered`), autoscroll, diagram updates.
- Artist/album/tag pages generated from song metadata via `src/lib/slug.ts` — `slugify` builds both routes and links; they must match.
- Search: Pagefind via `astro-pagefind` — song pages mark `data-pagefind-body`/`data-pagefind-meta`/`data-pagefind-filter`; artist, album, tag double as facets.

## Conventions

- UI strings come from `src/lib/i18n.ts` (`t.…`), locale from `site.config.json`. New user-facing text needs both `en` and `pl` entries.
- Theme + chords-visibility persist in `localStorage`, applied by inline script in `src/layouts/Base.astro` **before first paint**; toggles stay `hidden` until JS enables them (no-JS gets working defaults).
- Inline JSON via `set:html` escapes `<` as `\u003c` — preserve when adding embedded data.
- Songs in `songs/` are public-domain fixtures with `{copyright}` directives; real collections live outside the repo.
