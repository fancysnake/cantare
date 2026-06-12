import { ChordProParser, HtmlDivFormatter, type Song } from 'chordsheetjs';

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
// line. A grid not separated from adjacent content by a blank line merges into
// a mixed paragraph whose type collapses to INDETERMINATE, dropping the `grid`
// class — so it can't be hidden in lyrics-only mode. Isolate each grid into its
// own paragraph so the class is always emitted.
function isolateGrids(source: string): string {
  const lines = source.split('\n');
  const out: string[] = [];
  lines.forEach((line, i) => {
    const prev = out[out.length - 1];
    if (GRID_OPEN.test(line) && prev !== undefined && prev.trim() !== '') out.push('');
    out.push(line);
    const next = lines[i + 1];
    if (GRID_CLOSE.test(line) && next !== undefined && next.trim() !== '') out.push('');
  });
  return out.join('\n');
}

export function parseSong(source: string): Song {
  return new ChordProParser().parse(isolateGrids(source));
}

export function renderSong(song: Song): string {
  return new HtmlDivFormatter().format(song);
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
