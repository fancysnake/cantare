# Adding a song

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

- `title` and `artist` are recommended; omitted, they fall back to
  "Untitled"/"Unknown". `album`, `key`, `capo`, `copyright`, and `tags` are
  optional. A `{copyright: ...}` notice is displayed under the chord sheet.
- Tags are comma-separated in a `{meta: tags ...}` directive.
- `{meta: link https://...}` makes the song open that page in a new tab
  instead of its own sheet — a quick way to list a song hosted elsewhere (e.g. Ultimate Guitar)
  without copying it. Only a title, artist and link are needed:

  ```text
  {title: Wonderwall}
  {artist: Oasis}
  {meta: link https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-27596}
  ```

  The song still shows up in lists, artist/tag pages, search and the random
  pick. A search result leads to the song's own page, with a button to the
  link.

- `{meta: urls https://... https://...}` adds a button per URL, labelled with
  its host, to the song's own page without redirecting lists away from it.
  Separate URLs with spaces or repeat the directive. Unlike `link`, it suits a
  song with its own sheet, and the two can be combined.

- Chord names use English notation (C D E F G A B).
- `{chord_style: trailing}` suits songbooks converted from documents, where a
  line's chords are listed after the lyrics instead of anchored to a syllable:

  ```text
  {chord_style: trailing}

  Are you going to Scarborough Fair	[Am] [G] [Am]
  ```

  Those chords render on the lyric line rather than in a row above it, and are
  still real chords — transposition and diagrams work as usual.
