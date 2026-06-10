# Feature: Cantare — static songbook (Astro + Pagefind + ChordSheetJS)

A statically generated songbook. Songs are authored as ChordPro files, parsed at
build time with ChordSheetJS, rendered to HTML pages by Astro, and made
searchable with Pagefind. Tasks run through mise; packages managed with aube.

## Stack (already installed)

- Astro ^6.4.5, ChordSheetJS ^15.3.1, Pagefind ^1.5.2
- mise (node latest, aube latest; `aube install` on enter)

## Steps

- [x] 1. **Project scaffold** — `git init`; add `astro.config.mjs`, `tsconfig.json`,
     `src/pages/index.astro` (placeholder), `.gitignore` (node*modules, dist,
     .astro); add `package.json` scripts (`dev`, `build`, `preview`) and mise
     tasks in `mise.toml` (`dev`, `build`, `preview`) that call `aube run <script>`.
     — \_Test: `mise run dev` serves a placeholder page at localhost:4321.*

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

- [x] 8b. **Artist & tag indexes in header** — `/artists/` and `/tags/` index
      pages listing all artists / all tags (with song counts), linked from the
      site header. — _Test: header "Artists" opens the artist list; clicking one
      shows their songs; same for Tags._

- [x] 9. **Autoscroll** — Ultimate-Guitar-style autoscroll on song pages: a
     dependency-free client script (`requestAnimationFrame`) with play/pause and
     speed +/− controls in the song toolbar; controls hidden in print styles and
     absent without JS. — _Test: pressing play scrolls the sheet smoothly; speed
     controls change the rate; pause stops it._

- [x] 10. **Chord lookup (diagrams)** — fingering data from
      `@tombatossals/chords-db`, rendered by our own small SVG chord-box module
      (svguitar was rejected by aube's low-download gate; hand-rolled renderer
      chosen instead); tapping/hovering a chord in the sheet shows its diagram in
      a popover, plus a "chords in this song" strip above the sheet; lookup uses
      the normalized (post-transpose) chord name. — _Test: hovering G7 shows its
      diagram; after transposing +2, the same position shows A7's diagram._

- [x] 10b. **Dark mode toggle** — theme inferred from OS setting by default,
      switchable via a header toggle (light/dark/system), persisted in
      localStorage, no flash on load. — _Test: toggle overrides the OS theme and
      survives reload; "system" follows the OS again._

- [x] 10d. **Mobile text size & chords toggle** — smaller chord-sheet type on
      narrow viewports so lines don't wrap unreadably; header button toggling
      chord visibility globally (lyrics-only by default, persisted in
      localStorage; hides chords, transpose and diagram strip when off).
      — _Test: phone viewport shows unwrapped lines; chords appear only after
      enabling and stay enabled after reload._

- [x] 10e. **Brand color palette** — rebase the theme's CSS custom properties
      on brand colors #FFFF33 (yellow), #FF3333 (red), #3055AB (blue): derive
      light/dark variants with sufficient WCAG contrast for text, links, chords,
      and accents in both themes. — _Test: both themes use the new palette and
      body/chord text stays readable (AA contrast)._

- [x] 10c. **Linting toolchain** — ESLint (flat config) with typescript-eslint
      strict-type-checked + stylistic, eslint-plugin-astro; Prettier with
      prettier-plugin-astro; `mise run lint` / `mise run format`; fix all
      findings. — _Test: `mise run lint` exits clean; introducing an `any` or
      unused variable makes it fail._

- [x] 11b. **Site config for multiple instances** — `site.config.json` at the
      repo root (name, description, url) consumed by the layout (brand, page
      titles, meta) and astro.config, so one codebase can host several
      songbook instances differing only in config + `songs/`.
      — _Test: changing `name` in site.config.json rebrands the header and
      every page title after rebuild._

- [ ] 12. **i18n (en/pl)** — all UI strings (nav, toggles, transpose/scroll
      controls, search labels, counts, 404, aria-labels) move to
      `src/lib/i18n.ts` with English and Polish dictionaries; locale chosen
      per instance in `site.config.json`; `<html lang>` set from locale;
      Polish plural rules for song counts. — _Test: with locale "pl" the whole
      UI reads in Polish; switching config to "en" restores English._

- [x] 11. **Polish & docs** — 404 page, HTML meta/titles per page, README.md
      (authoring a new song, running tasks), `mise run check` task running
      `astro check`. — _Test: `mise run check` passes; adding a new `.cho` file and
      rebuilding makes it appear in index and search with no other changes._
