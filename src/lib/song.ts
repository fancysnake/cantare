import { ChordProParser, HtmlDivFormatter, Tag, CHORUS, type Line, type Song } from 'chordsheetjs';

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

// chordsheetjs's expandChorusDirective replays only the last chorus block and
// treats `{chorus: Label}` as decoration — so `{soc: Pre-chorus}` blocks get
// recalled wrongly, and a second recall collides with the first. Expand here
// instead: `{chorus: Label}` replays the chorus whose `{soc: Label}` matches;
// bare/unmatched falls back to the last chorus before the recall. Recall line
// retagged chorus so its paragraph (label + lyrics) keeps the accent border.
function recallLabel(line: Line): string | undefined {
  const tag = line.items.find((item): item is Tag => item instanceof Tag && item.name === CHORUS);
  return tag?.value;
}

function expandChorusRecalls(song: Song): Song {
  // Build blocks (label + lyrics between soc/eoc) as we walk, so a recall sees
  // only blocks defined before it.
  const blocks: { label: string; lines: Line[] }[] = [];
  let current: { label: string; lines: Line[] } | null = null;
  const expanded: Line[] = [];
  for (const line of song.lines) {
    const soc = line.items.find(
      (item): item is Tag => item instanceof Tag && item.name === 'start_of_chorus',
    );
    const eoc = line.items.some((item) => item instanceof Tag && item.name === 'end_of_chorus');
    if (soc) {
      current = { label: soc.value, lines: [] };
      blocks.push(current);
    } else if (eoc) {
      current = null;
    } else if (current && line.type === CHORUS && line.hasRenderableItems()) {
      current.lines.push(line);
    }

    expanded.push(line);
    if (line.items.some((item) => item instanceof Tag && item.name === CHORUS)) {
      const label = recallLabel(line);
      const target =
        (label && [...blocks].reverse().find((b) => b.label === label)) ??
        blocks[blocks.length - 1];
      if (target) {
        line.type = CHORUS;
        for (const source of target.lines) {
          const clone = source.clone();
          clone.type = CHORUS;
          expanded.push(clone);
        }
      }
    }
  }

  song.lines = expanded;
  return song;
}

export function parseSong(source: string): Song {
  return expandChorusRecalls(new ChordProParser().parse(isolateGrids(source)));
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
  // Recalls already expanded in parseSong; chordsheetjs's expandChorusDirective
  // stays off — it replays only the last chorus, ignores `{chorus: Label}`.
  return groupWords(new HtmlDivFormatter().format(song));
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
