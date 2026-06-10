# Feature: Cantare — static songbook (Astro + Pagefind + ChordSheetJS)

A statically generated songbook. Songs are authored as ChordPro files, parsed at
build time with ChordSheetJS, rendered to HTML pages by Astro, and made
searchable with Pagefind. Tasks run through mise; packages managed with aube.

## Stack (already installed)

- Astro ^6.4.5, ChordSheetJS ^15.3.1, Pagefind ^1.5.2
- mise (node latest, aube latest; `aube install` on enter)

## Steps

- [x] 1. **Project scaffold** — `git init`; add `astro.config.mjs`, `tsconfig.json`,
  `src/pages/index.astro` (placeholder), `.gitignore` (node_modules, dist,
  .astro); add `package.json` scripts (`dev`, `build`, `preview`) and mise
  tasks in `mise.toml` (`dev`, `build`, `preview`) that call `aube run <script>`.
  — _Test: `mise run dev` serves a placeholder page at localhost:4321._

- [x] 2. **Song sources + content collection** — create `songs/` with 2–3 sample
  ChordPro (`.cho`) files (title, artist, key directives + verse/chorus). Define
  a `songs` collection in `src/content.config.ts` with a custom loader that
  reads `songs/*.cho` and delegates to a shared `src/lib/song.ts` module
  (ChordSheetJS `ChordProParser`) to extract metadata (title, artist, album,
  key, capo, and tags from a `{meta: tags ...}` directive) plus the raw
  ChordPro body. All parse/render logic lives in
  `src/lib/song.ts` so build-time and client-side code share one path.
  — _Test: index page lists the sample song titles and artists, read from the collection._

- [x] 3. **Song pages** — dynamic route `src/pages/songs/[slug].astro` using
  `getStaticPaths` over the collection; render the parsed song with
  `HtmlDivFormatter` (chords above lyrics), show title/artist/key/capo header;
  link each song from the index. — _Test: click a song on the index; the chord
  sheet renders with chords aligned above lyrics._

- [x] 4. **Chord sheet styling** — a base layout (`src/layouts/Base.astro`) with
  site nav + global CSS (plain CSS with custom properties for colors/spacing;
  dark mode via `prefers-color-scheme`), plus the ChordSheetJS-recommended CSS
  for `HtmlDivFormatter` output (chord/lyrics columns, section labels,
  comments); readable on mobile; `@media print` rules (hide nav/controls, no
  page breaks inside verses). — _Test: song page is legible on narrow viewport;
  chorus/verse sections visually distinct; print preview shows only the chord
  sheet._

- [x] 5. **Browse & taxonomies** — group the song list alphabetically by title
  with an artist subtitle; add taxonomy index pages for artists
  (`src/pages/artists/[slug].astro`), albums (`src/pages/albums/[slug].astro`),
  and tags (`src/pages/tags/[slug].astro`), each listing its songs; song pages
  link to their artist/album/tags. — _Test: index shows grouped list; artist,
  album, and tag pages each show only their songs; links round-trip from a
  song page._

- [x] 6. **Pagefind search** — extend the `build` script to `astro build && pagefind
  --site dist`; add a search page (or header search box) loading the Pagefind UI
  from `/pagefind/pagefind-ui.js`; mark song lyrics/title regions with
  `data-pagefind-body`, and expose artist/album/tags as search facets via
  `data-pagefind-filter` and `data-pagefind-meta`. — _Test: `mise run build && mise
  run preview`; searching a lyric fragment finds the song; search works without
  any server-side code._

- [x] 7. **Search-first home & random pick** — the homepage becomes the search
  page (meetup use case: open site → search immediately), with a "Browse all
  songs" link; the grouped alphabetical list moves to `/songs/`. Artist, album,
  and tag pages get indexed by Pagefind (heading only, so they appear as
  results leading to their subpages without duplicating song lyrics hits).
  A "pick random song" button on the home page and on artist/album/tag pages
  navigates to a random song from that page's set (JS enhancement).
  — _Test: opening the site shows search; searching an artist name returns the
  artist page as a result; the random button opens a song; on a tag page it
  only picks songs with that tag._

- [x] 8. **Client-side transposition** — on the song page, +/− semitone buttons (and
  capo display) powered by a small client script that calls the shared
  `src/lib/song.ts` render function (raw ChordPro + semitone offset → HTML);
  default key from metadata; buttons get `aria-label`s and visible
  `:focus-visible` states.
  — _Test: pressing + shifts every chord up a semitone; reload restores original key._

- [ ] 9. **Autoscroll** — Ultimate-Guitar-style autoscroll on song pages: a
  dependency-free client script (`requestAnimationFrame`) with play/pause and
  speed +/− controls in the song toolbar; controls hidden in print styles and
  absent without JS. — _Test: pressing play scrolls the sheet smoothly; speed
  controls change the rate; pause stops it._

- [ ] 10. **Chord lookup (diagrams)** — add `@tombatossals/chords-db` (fingering
  data) and `svguitar` (SVG diagram rendering) via aube; tapping/hovering a
  chord in the sheet shows its diagram in a popover, plus a "chords in this
  song" strip above the sheet; honor ChordPro `{define: ...}` overrides;
  lookup uses the normalized (post-transpose) chord name. — _Test: hovering G7
  shows its diagram; after transposing +2, the same position shows A7's
  diagram; a song with a custom {define} shows the custom shape._

- [ ] 11. **Polish & docs** — 404 page, HTML meta/titles per page, README.md
  (authoring a new song, running tasks), `mise run check` task running
  `astro check`. — _Test: `mise run check` passes; adding a new `.cho` file and
  rebuilding makes it appear in index and search with no other changes._
