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

## Running your own instance

There are two ways to run a songbook on cantare, from the same repo:

1. **Use it as a package** — your songbook is just content plus a config file;
   the engine is an installed dependency you update by re-installing. This is
   the path most people want.
2. **Develop from source** — clone the repo and edit templates and styles
   directly. This is the "eject" hatch for structural changes; it is simply the
   repo as you see it.

### Use as a package

A consumer songbook is a `package.json`, a `cantare.config.json`, and a
`songs/` folder — nothing else. See [`examples/consumer/`](examples/consumer)
for a copy-paste starter.

```jsonc
// package.json
{
  "name": "my-songbook",
  "private": true,
  "type": "module",
  "scripts": { "build": "cantare build ./songs" },
  "dependencies": { "cantare": "github:fancysnake/cantare" },
}
```

```sh
npm install
npx cantare build ./songs   # static site into ./dist
```

The CLI:

| Command                    | What it does                                       |
| -------------------------- | -------------------------------------------------- |
| `cantare build [songsDir]` | Build into `./dist` (songsDir defaults to `songs`) |
| `cantare dev [songsDir]`   | Dev server at http://localhost:4321                |
| `cantare preview`          | Serve the production build                         |

Options: `-c, --config <file>` (defaults to `./cantare.config.json`, falling
back to the engine's bundled config) and `-o, --out <dir>` (defaults to
`./dist`). Engine updates arrive by re-installing the dependency — no code to
merge.

`cantare.config.json` carries the brand and, optionally, a theme:

```json
{
  "name": "My Songbook",
  "description": "A small collection of songs.",
  "url": "https://songs.example.com",
  "locale": "en",
  "theme": { "accent": "#0a7d6b" },
  "themeDark": { "accent": "#3fd6b8" }
}
```

#### Theming

`theme` (always applied) and `themeDark` (applied in dark mode — forced or via
`prefers-color-scheme`) override the palette. Keys are the `--color-*` custom
properties **without** the prefix; anything you omit keeps the engine default.
The full set lives in [`src/styles/global.css`](src/styles/global.css):

`bg`, `surface`, `text`, `muted`, `border`, `border-strong`, `accent`, `chord`.

See [DEPLOY.md](DEPLOY.md) for hosting (e.g. Coolify) the built `dist/`.

### Develop / customize from source

Clone the repo and work with the tooling directly. The repo's own
`site.config.json` is the **default config** and `songs/` the default content,
so a fresh clone builds the demo site with no extra setup.

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
  "Untitled"/"Unknown"); `album`, `key`, `capo`, `copyright`, and `tags` are
  optional. A `{copyright: ...}` notice is displayed under the chord sheet.
- Tags are comma-separated in a `{meta: tags ...}` directive.
- Chord names use English notation (C D E F G A B).

## Licensing

The code is released under the [MIT license](LICENSE). The example songs in
`songs/` are public-domain works (see the `{copyright}` directive in each
file) kept as fixtures; real song collections are expected to live outside
this repository, and their rights remain with their respective owners.

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
