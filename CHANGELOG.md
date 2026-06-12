# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog],
and this project adheres to [Semantic Versioning].

## [Unreleased]

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

[unreleased]: https://github.com/fancysnake/cantare/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/fancysnake/cantare/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/fancysnake/cantare/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/fancysnake/cantare/releases/tag/v0.1.0
