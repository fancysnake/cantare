import { ChordProParser, HtmlDivFormatter, Tag, CHORUS, type Song } from 'chordsheetjs';

export interface SongMeta {
  title: string;
  artist: string;
  album?: string | undefined;
  language?: string | undefined;
  key?: string | undefined;
  capo?: number | undefined;
  copyright?: string | undefined;
  tags: string[];
}

const GRID_OPEN = /^\s*\{\s*(?:start_of_grid|sog)\b/i;
const GRID_CLOSE = /^\s*\{\s*(?:end_of_grid|eog)\b/i;

// chordsheetjs tags a paragraph as `grid` only when every line in it is a grid
// line. Two things break that, leaving the grid without its class (and so
// unhidable in lyrics-only mode):
//   1. chordsheetjs treats a whitespace-only line as content, not a paragraph
//      break, so a stray " " line next to a grid is absorbed as an empty lyric
//      row — making the paragraph mixed-type (INDETERMINATE).
//   2. A grid not separated from neighbouring content by a blank line at all
//      merges into that content's paragraph.
// Normalize whitespace-only lines to truly empty, then ensure a blank line
// around the grid delimiters, so every grid is its own paragraph.
function isolateGrids(source: string): string {
  const lines = source.split('\n').map((line) => (line.trim() === '' ? '' : line));
  const out: string[] = [];
  lines.forEach((line, i) => {
    const prev = out[out.length - 1];
    if (GRID_OPEN.test(line) && prev !== undefined && prev !== '') out.push('');
    out.push(line);
    const next = lines[i + 1];
    if (GRID_CLOSE.test(line) && next !== undefined && next !== '') out.push('');
  });
  return out.join('\n');
}

// A bare `{chorus}` recall line carries no renderable item, so the paragraph it
// expands into (see renderSong's expandChorusDirective) is all-chorus lines and
// keeps the `chorus` type/class. A labelled recall (`{chorus: Chorus}`) instead
// renders its label, so the recall line stays type `none`; mixed with the
// expanded chorus lines the paragraph becomes INDETERMINATE and loses the
// `chorus` class (and its accent border). Retag the recall line itself as chorus
// so the expanded paragraph is homogeneous either way.
function retagChorusRecalls(song: Song): Song {
  for (const line of song.lines) {
    if (line.items.some((item) => item instanceof Tag && item.name === CHORUS)) {
      line.type = CHORUS;
    }
  }
  return song;
}

export function parseSong(source: string): Song {
  return retagChorusRecalls(new ChordProParser().parse(isolateGrids(source)));
}

// HtmlDivFormatter splits a word into one `.column` per chord anchor, and each
// column is an independently-wrappable flex item — so a mid-word chord
// (`e[A]xist`) lets the word break across lines/columns. Wrap each run of
// columns that belong to one word in a `.word` span (kept together via CSS) so
// lines still wrap between words but never inside one. A word ends at the
// column whose lyrics end in whitespace, or at a row/paragraph boundary (any
// non-column markup between two columns).
const COLUMN =
  /<div class="column"><div class="chord">(.*?)<\/div><div class="lyrics">(.*?)<\/div><\/div>/g;

function groupWords(html: string): string {
  let result = '';
  let pos = 0;
  let inWord = false;
  let match: RegExpExecArray | null;
  COLUMN.lastIndex = 0;
  while ((match = COLUMN.exec(html)) !== null) {
    const between = html.slice(pos, match.index);
    if (between.length > 0 && inWord) {
      result += '</span>';
      inWord = false;
    }
    result += between;
    if (!inWord) {
      result += '<span class="word">';
      inWord = true;
    }
    result += match[0];
    if (/\s$/.test(match[2] ?? '')) {
      result += '</span>';
      inWord = false;
    }
    pos = match.index + match[0].length;
  }
  if (inWord) result += '</span>';
  result += html.slice(pos);
  return result;
}

export function renderSong(song: Song): string {
  // expandChorusDirective re-prints the referenced chorus where a bare
  // `{chorus}` recall directive appears; without it chordsheetjs emits an
  // empty paragraph there.
  return groupWords(new HtmlDivFormatter({ expandChorusDirective: true }).format(song));
}

export interface RenderedSheet {
  html: string;
  key?: string | undefined;
}

export function renderTransposed(source: string, semitones: number): RenderedSheet {
  let song = parseSong(source);
  if (semitones !== 0) {
    song = song.transpose(semitones, { normalizeChordSuffix: true });
  }
  return { html: renderSong(song), key: song.key ?? undefined };
}

function single(value: string | string[] | null | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

export function extractMeta(song: Song): SongMeta {
  const meta = song.metadata;
  const tags = single(meta.get('tags'));

  return {
    title: single(meta.get('title')) ?? 'Untitled',
    artist: single(meta.get('artist')) ?? 'Unknown',
    album: single(meta.get('album')),
    language: single(meta.get('language')),
    key: single(meta.get('key')),
    capo: maybeNumber(single(meta.get('capo'))),
    copyright: single(meta.get('copyright')),
    tags: tags
      ? tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
  };
}

function maybeNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}
