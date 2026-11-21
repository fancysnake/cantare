# How it works

- `src/content.config.ts` loads `songs/*.cho` through a custom collection
  loader; `src/lib/mills/song.ts` is the single parse/render path shared by the
  build and the browser (transposition re-renders client-side).
- `src/lib/mills/routes.ts` owns every internal link. Templates never write a
  path, so slugs and the `CANTARE_BASE` prefix have one definition each.
- The code under `src/lib/` follows the [GLIMPSE](https://glimpse.fancysnake.dev/)
  layers: `pacts` holds the data shapes, `mills` the logic, `links` the file,
  config and chord database access, and `inits` wires them together. Pages,
  layouts and components import `pacts` and `inits` only; `mise run lint`
  rejects any other import.
- Chord diagrams come from `@tombatossals/chords-db` fingering data drawn by
  `src/lib/mills/chord-diagram.ts`, a small hand-rolled SVG renderer. Each song
  page embeds only the fingerings it can need (its chord suffixes in all 12
  roots), so diagrams keep working while transposing — offline.
- Pagefind indexes song pages (lyrics + metadata) and the headings of
  artist/album/tag pages; artist, album, and tag double as search facets.
- Preferences (theme, chords on/off) persist in `localStorage` and apply
  before first paint.
