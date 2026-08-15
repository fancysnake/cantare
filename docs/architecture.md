# How it works

- `src/content.config.ts` loads `songs/*.cho` through a custom collection
  loader; `src/lib/song.ts` is the single parse/render path shared by the
  build and the browser (transposition re-renders client-side).
- `src/lib/routes.ts` owns every internal link. Templates never write a path,
  so slugs and the `CANTARE_BASE` prefix have one definition each.
- Chord diagrams come from `@tombatossals/chords-db` fingering data drawn by
  `src/lib/chord-diagram.ts`, a small hand-rolled SVG renderer. Each song
  page embeds only the fingerings it can need (its chord suffixes in all 12
  roots), so diagrams keep working while transposing — offline.
- Pagefind indexes song pages (lyrics + metadata) and the headings of
  artist/album/tag pages; artist, album, and tag double as search facets.
- Preferences (theme, chords on/off) persist in `localStorage` and apply
  before first paint.
