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

- `title` and `artist` are required in practice (they fall back to
  "Untitled"/"Unknown"); `album`, `key`, `capo`, `copyright`, and `tags` are
  optional. A `{copyright: ...}` notice is displayed under the chord sheet.
- Tags are comma-separated in a `{meta: tags ...}` directive.
- Chord names use English notation (C D E F G A B).
- `{chord_style: trailing}` suits songbooks converted from documents, where a
  line's chords are listed after the lyrics instead of anchored to a syllable:

  ```text
  {chord_style: trailing}

  Are you going to Scarborough Fair	[Am] [G] [Am]
  ```

  Those chords render on the lyric line rather than in a row above it, and are
  still real chords — transposition and diagrams work as usual.
