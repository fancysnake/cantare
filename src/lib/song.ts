import { ChordProParser, HtmlDivFormatter, type Song } from 'chordsheetjs';

export interface SongMeta {
  title: string;
  artist: string;
  album?: string;
  key?: string;
  capo?: number;
  tags: string[];
}

export function parseSong(source: string): Song {
  return new ChordProParser().parse(source);
}

export function renderSong(song: Song): string {
  return new HtmlDivFormatter().format(song);
}

export interface RenderedSheet {
  html: string;
  key?: string;
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
    key: single(meta.get('key')),
    capo: maybeNumber(single(meta.get('capo'))),
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
