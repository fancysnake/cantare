# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog],
and this project adheres to [Semantic Versioning].

## [Unreleased]

## [0.3.9] - 2026-06-21

### Fixed

- **`{chorus: Label}` recall replayed the wrong chorus, or only its title.**
  chordsheetjs only ever replays the _last_ chorus block and treats the label
  as decoration, so songs whose pre-choruses are `{soc: Pre-chorus}` blocks
  recalled the pre-chorus, and a second `{chorus}` collided with the first and
  rendered the label alone. Recalls are now expanded in-house: `{chorus: Label}`
  replays the chorus whose `{soc: Label}` matches (bare `{chorus}` or an
  unmatched label still falls back to the last chorus before it).

## [0.3.8] - 2026-06-13

### Added

- **Bridge sections get a neutral left border**, setting them apart from
  verses while staying distinct from the accent-coloured chorus.

### Fixed

- **Labelled `{chorus: Label}` recall lost its accent border.** The labelled
  recall line stays type `none`, so once expanded in place the paragraph
  became indeterminate and dropped the `chorus` class. Recall lines are now
  retagged as chorus, so the border renders while the label still shows.
- **Section headings were oversized**: emitted as bare `<h3>`, they fell back
  to the browser's default heading size and margins. Now a tight 1rem caption
  sitting just above its lines.

## [0.3.7] - 2026-06-13

### Fixed

- **`{chorus}` recall directive rendered as an empty block** instead of
  reprinting the referenced chorus. Enabled chordsheetjs's
  `expandChorusDirective` so a bare `{chorus}` expands in place, in both the
  static build and client-side transposition re-rendering.

## [0.3.6] - 2026-06-13

### Fixed

- **Space between chord-separated words dropped in lyrics-only mode**
  ("my friend" → "myfriend"): gap came only from chord padding, gone when
  chords hidden. Trailing space now preserved; mid-word splits (`e[A]xist`)
  stay joined.
- **Words split mid-word in column/focus mode**: each chord-anchored syllable
  was a separately-wrappable column. Syllables now grouped non-breaking; lines
  wrap only between words.
- **Control bar overflowed horizontally on phones**, clipping Reset.
  Transpose/autoscroll groups now wrap; row tightens on narrow screens.
- **Search UI showed English on non-English sites**: Pagefind ships sparse
  per-locale translations. Placeholder, hint, clear and result-count strings
  now come from the site's i18n table.
- **Per-facet "clear" buttons shown disabled before filtering**: now hidden
  until the facet has a value.

### Changed

- **Song pages cap and center reading width in single-column mode** (was
  full-screen); column/focus modes still full width.

## [0.3.5] - 2026-06-13

### Fixed

- **Grids next to whitespace-only lines still stayed visible in lyrics-only
  mode.** 0.3.4 isolated grids separated by a blank line, but chordsheetjs
  treats a whitespace-only line (e.g. a stray `" "`) as content, not a
  paragraph break, so such a line next to a grid was absorbed as an empty
  lyric row — making the paragraph mixed-type and dropping the `grid` class
  again. Whitespace-only lines are now normalized to empty before parsing, so
  the grid keeps its class and hides reliably.

## [0.3.4] - 2026-06-12

### Fixed

- **Grids adjacent to other content stayed visible in lyrics-only mode.**
  chordsheetjs only tags a paragraph as `grid` when every line in it is a grid
  line, so a grid not separated from neighbouring lines by a blank line merged
  into a mixed paragraph that lost the `grid` class — and with it the 0.3.3
  hiding rule. Grid environments are now isolated into their own paragraph
  before parsing, so the class is always emitted and the grid hides reliably.

## [0.3.3] - 2026-06-12

### Fixed

- **Grid sections in lyrics-only mode.** ChordPro grid environments
  (`{start_of_grid}`…`{end_of_grid}`) are pure chord/bar notation, but stayed
  visible when chords were toggled off. The whole grid block is now hidden in
  lyrics-only mode, alongside inline chords.

## [0.3.2] - 2026-06-12

### Fixed

- **Songs in subfolders.** The content loader now reads `.cho` files
  recursively, so songs can be organized into subfolders (e.g. by artist).
  The slug stays the bare filename — subfolders are organizational and never
  appear in URLs. Duplicate filenames across folders fail the build with a
  clear error.

## [0.3.1] - 2026-06-12

### Fixed

- **Search in the package `dev` path.** When run as an installed package,
  `cantare dev` served `/pagefind/` from the engine's own directory
  (`node_modules/cantare/dist`) instead of the consumer's `CANTARE_OUT_DIR`,
  so the Pagefind assets 404'd and the search component failed to load with a
  MIME-type error. The dev server now serves the Pagefind index from
  `CANTARE_OUT_DIR`.

## [0.3.0] - 2026-06-12

### Added

- **Installable engine.** cantare can now be used as a git-installed package: a
  consumer repo is just `package.json` + `cantare.config.json` + `songs/`, built
  with `npx cantare build ./songs`. A `cantare` CLI (`build`/`dev`/`preview`)
  resolves the songs directory, config, and output directory from the consumer's
  cwd and drives Astro's programmatic API against the bundled engine. Engine
  updates come by re-installing — no code to merge. Cloning and building from
  source still works unchanged.
- **Config from `cantare.config.json`.** The site config is read at build start
  and exposed to both server and browser bundles as a baked-in literal
  (`virtual:cantare-config`). The repo's `site.config.json` remains the default
  config for the clone/dev path.
- **Theming from config.** Optional `theme` and `themeDark` maps override the
  `--color-*` palette (keys without the prefix); `themeDark` applies in dark
  mode. Omitted properties keep the engine default.
- **Consumer starter + deploy docs.** `examples/consumer/` is a copy-paste
  starter; `DEPLOY.md` documents the Coolify (Nixpacks static) recipe, and the
  README covers both the package and develop-from-source paths.

## [0.2.0] - 2026-06-11

### Added

- **Language metadata.** Songs can declare a language via
  `{meta: language ...}`. Generated `/languages/` index and per-language pages,
  a header nav link, a Pagefind search facet, and the language shown on each
  song's meta line — mirroring the artist/album/tag taxonomy. Values are
  free-form — any label works, consistency is the author's call.
- **Focus + multi-column modes.** Focus strips the page to the sheet (hides
  site nav, Esc exits); the single/multi column switch reflows long songs and
  shrinks the font to fit the screen. Focus auto-enables multi-column;
  autoscroll adapts to the active mode; print ignores both.
- **Compact song toolbar.** Title, metadata, and the transpose/autoscroll/focus
  controls share one row above the sheet.
- **Lorem-ipsum fixture.** Long multi-section placeholder song for exercising
  rendering, columns, autoscroll, and the diagram subset.

## [0.1.0] - 2026-06-11

First public release. Static songbook for singing meetups: search, sing along,
lyrics-only by default — chords, transposition, autoscroll, and diagrams a
toggle away.

### Added

- **Songs from ChordPro.** `.cho` files in `songs/`; filename = URL slug. Astro
  content collection parses with ChordSheetJS into a typed schema (title,
  artist, album, key, capo, copyright, tags).
- **Song pages.** Inline chords over lyrics; verse/chorus/accent styling;
  `{copyright}` shown under the sheet.
- **Transposition.** One parse/render module shared by build and browser →
  server and re-rendered output identical. Re-renders in place, no round trip.
- **Chord diagrams.** SVG renderer over `@tombatossals/chords-db`. Each page
  embeds its suffixes across all 12 roots → diagrams survive transposition
  offline. Strip on the page; popovers on hover (desktop) or tap (touch).
- **Autoscroll.** Hands-free scroll at adjustable speed.
- **Lyrics-first.** Lyrics-only by default, chords behind a toggle; text scales
  down on phones.
- **Focus + multi-column modes.** Focus strips to the sheet; column switch
  reflows long songs and shrinks font to fit. Focus auto-enables multi-column;
  autoscroll adapts; print ignores both.
- **Search as homepage.** Pagefind over title/lyrics/metadata; artist, album,
  tag as facets. Random-song pick.
- **Browse + taxonomy.** Alphabetical index plus generated artist/album/tag
  pages, header-linked and cross-linked.
- **Dark mode.** System/light/dark, applied before first paint.
- **i18n.** Central dictionary, English + Polish; locale from site config.
- **Multi-instance branding.** Name, description, URL, locale in
  `site.config.json` — swap it and `songs/` for a different songbook.
- **Persisted preferences.** Theme and chords-visibility in `localStorage`,
  applied before first paint; no-JS defaults.
- **Polish.** Custom 404, per-page meta descriptions, one-row song toolbar,
  green/purple/gold palette.
- **Example songs.** Amazing Grace, Auld Lang Syne, Greensleeves + lorem-ipsum
  stress fixture.
- **Tooling.** mise, aube, type-checked ESLint + Prettier, Husky +
  lint-staged, lint CI, Renovate, `astro check`.

<!-- Links -->

[keep a changelog]: https://keepachangelog.com/en/1.0.0/
[semantic versioning]: https://semver.org/spec/v2.0.0.html

<!-- Versions -->

[unreleased]: https://github.com/fancysnake/cantare/compare/v0.3.9...HEAD
[0.3.9]: https://github.com/fancysnake/cantare/compare/v0.3.8...v0.3.9
[0.3.8]: https://github.com/fancysnake/cantare/compare/v0.3.7...v0.3.8
[0.3.7]: https://github.com/fancysnake/cantare/compare/v0.3.6...v0.3.7
[0.3.6]: https://github.com/fancysnake/cantare/compare/v0.3.5...v0.3.6
[0.3.5]: https://github.com/fancysnake/cantare/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/fancysnake/cantare/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/fancysnake/cantare/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/fancysnake/cantare/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/fancysnake/cantare/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/fancysnake/cantare/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/fancysnake/cantare/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/fancysnake/cantare/releases/tag/v0.1.0
