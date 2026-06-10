# Cantare

A static songbook for singing meetups: open the site, search for the song
being sung (by title, lyrics, artist, album, or tag), and sing along.
Lyrics-only by default; flip on chords to get transposition, autoscroll,
and chord diagrams.

Built with [Astro](https://astro.build) (static site generation),
[ChordSheetJS](https://github.com/martijnversluis/ChordSheetJS) (ChordPro
parsing and rendering), and [Pagefind](https://pagefind.app) (client-side
search). Tooling: [mise](https://mise.jdx.dev) for tasks and tool versions,
[aube](https://aube.jdx.dev) as the package manager.

## Getting started

```sh
mise install   # installs node + aube, then `aube install` runs on enter
mise run dev   # dev server at http://localhost:4321
```

| Task               | What it does                                        |
| ------------------ | --------------------------------------------------- |
| `mise run dev`     | Dev server with hot reload                          |
| `mise run build`   | Static production build into `dist/` + search index |
| `mise run preview` | Serve the production build locally                  |
| `mise run lint`    | ESLint (strict, type-checked) + Prettier check      |
| `mise run format`  | Format the codebase with Prettier                   |
| `mise run check`   | `astro check` type-checks the templates             |

Search needs a Pagefind index. The production build always has one; the dev
server serves the index from the **last build**, so run `mise run build` once
after adding songs if you want them searchable during development.

## Adding a song

Create a [ChordPro](https://www.chordpro.org/chordpro/chordpro-introduction/)
file in `songs/`, e.g. `songs/my-song.cho`:

```text
{title: My Song}
{artist: Jane Doe}
{album: Campfire Classics}
{key: G}
{capo: 2}
{meta: tags folk, campfire}

{start_of_verse}
A [G]line of lyrics with [C]inline [D]chords
{end_of_verse}

{start_of_chorus}
The [Em]chorus gets an [C]accent [G]bar
{end_of_chorus}
```

That's it — rebuild and the song appears in the alphabetical list, its
artist/album/tag pages, and the search index. The filename becomes the URL
slug (`/songs/my-song/`).

Notes:

- `title` and `artist` are required in practice (they fall back to
  "Untitled"/"Unknown"); `album`, `key`, `capo`, and `tags` are optional.
- Tags are comma-separated in a `{meta: tags ...}` directive.
- Chord names use English notation (C D E F G A B).

## How it works

- `src/content.config.ts` loads `songs/*.cho` through a custom collection
  loader; `src/lib/song.ts` is the single parse/render path shared by the
  build and the browser (transposition re-renders client-side).
- Chord diagrams come from `@tombatossals/chords-db` fingering data drawn by
  `src/lib/chord-diagram.ts`, a small hand-rolled SVG renderer. Each song
  page embeds only the fingerings it can need (its chord suffixes in all 12
  roots), so diagrams keep working while transposing — offline.
- Pagefind indexes song pages (lyrics + metadata) and the headings of
  artist/album/tag pages; artist, album, and tag double as search facets.
- Preferences (theme, chords on/off) persist in `localStorage` and apply
  before first paint.
