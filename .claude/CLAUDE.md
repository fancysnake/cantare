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

## Architecture

Static Astro songbook. Songs: ChordPro `.cho` files in `songs/`; filename = URL slug. Branding (name, description, URL, locale) lives only in `site.config.json`.

- `src/content.config.ts`: custom collection loader — reads `songs/*.cho`, parses with ChordSheetJS, extracts metadata into the schema.
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
