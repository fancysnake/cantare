# Cantare

A static songbook for singing meetups: open the site, search for the song
being sung (by title, lyrics, artist, album, or tag), and sing along.
Lyrics-only by default; flip on chords to get transposition, autoscroll,
and chord diagrams.

- **Docs:** <https://cantare.fancysnake.dev>
- **Demo:** <https://cantare.fancysnake.dev/demo/>

Built with [Astro](https://astro.build) (static site generation),
[ChordSheetJS](https://github.com/martijnversluis/ChordSheetJS) (ChordPro
parsing and rendering), and [Pagefind](https://pagefind.app) (client-side
search). Tooling: [mise](https://mise.jdx.dev) for tasks and tool versions,
[aube](https://aube.jdx.dev) as the package manager.

## Quick start

Run a songbook as a package — a `package.json`, a `cantare.config.json`, and a
`songs/` folder (see [`examples/consumer/`](examples/consumer)):

```sh
npm install
npx cantare build ./songs   # static site into ./dist
```

Or develop from source; the repo's own `site.config.json` and `songs/` are the
defaults, so a fresh clone builds the demo:

```sh
mise install
mise run dev   # dev server at http://localhost:4321
```

Everything else — the CLI, config and theming, adding songs, deploying — is in
the [docs](https://cantare.fancysnake.dev) (MkDocs sources in [`docs/`](docs);
`mise run site:serve` to preview them).

## Licensing

The code is released under the [MIT license](LICENSE). The example songs in
`songs/` are public-domain works (see the `{copyright}` directive in each
file) kept as fixtures; real song collections are expected to live outside
this repository, and their rights remain with their respective owners.
