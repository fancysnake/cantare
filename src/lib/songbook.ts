import { slugify } from './slug.ts';

/** A songbook as written in the config: a song belongs if it matches any listed value. */
export interface SongbookConfig {
  name: string;
  tags?: string[];
  artists?: string[];
  albums?: string[];
  languages?: string[];
}

const KEYS = ['tags', 'artists', 'albums', 'languages'] as const;
type Key = (typeof KEYS)[number];

export interface Songbook {
  slug: string;
  name: string;
  /** Slugified values per key, so matching ignores case and accents like the listing pages do. */
  match: Record<Key, Set<string>>;
}

/** The built-in songbook holding every song no defined songbook picks. */
export const OTHER = 'other';

/** The song metadata songbooks match on. */
export interface SongbookFields {
  artist: string;
  album?: string | undefined;
  language?: string | undefined;
  tags: string[];
}

/** Validate the config's songbooks; a mistake fails the build rather than silently matching nothing. */
export function parseSongbooks(configs: SongbookConfig[] | undefined): Songbook[] {
  const seen = new Set([OTHER]);
  return (configs ?? []).map((config) => {
    const slug = slugify(config.name);
    if (!slug) {
      throw new Error(`Songbook name ${JSON.stringify(config.name)} has no letters or digits.`);
    }
    if (seen.has(slug)) {
      throw new Error(
        `Songbook "${config.name}" clashes with another one (or the built-in "${OTHER}").`,
      );
    }
    seen.add(slug);
    const unknown = Object.keys(config).filter(
      (key) => key !== 'name' && !(KEYS as readonly string[]).includes(key),
    );
    if (unknown.length > 0) {
      throw new Error(
        `Songbook "${config.name}": unknown key ${unknown.join(', ')}; use ${KEYS.join(', ')}.`,
      );
    }
    const match = Object.fromEntries(
      KEYS.map((key) => [key, new Set((config[key] ?? []).map(slugify))]),
    ) as Record<Key, Set<string>>;
    if (KEYS.every((key) => match[key].size === 0)) {
      throw new Error(
        `Songbook "${config.name}" lists no ${KEYS.join(', ')}, so it would hold no songs.`,
      );
    }
    return { slug, name: config.name, match };
  });
}

/** Slugs of the songbooks a song belongs to: `other` when none picks it, nothing when none are defined. */
export function songbooksOf(song: SongbookFields, songbooks: Songbook[]): string[] {
  if (songbooks.length === 0) return [];
  const values: Record<Key, string[]> = {
    tags: song.tags,
    artists: [song.artist],
    albums: song.album ? [song.album] : [],
    languages: song.language ? [song.language] : [],
  };
  const slugs = songbooks
    .filter(({ match }) =>
      KEYS.some((key) => values[key].some((value) => match[key].has(slugify(value)))),
    )
    .map(({ slug }) => slug);
  return slugs.length > 0 ? slugs : [OTHER];
}

/**
 * CSS that applies the active songbook (`data-songbook` on <html>) before first paint.
 *
 * Membership is baked into attributes at build time, so this is the whole filter:
 * `data-songbooks` hides an element outside the songbook, `data-songbooks-dim`
 * greys it and moves it last, `data-songbooks-group` hides a group with nothing
 * left in it, and `data-songbooks-note` shows only outside the songbook.
 */
export function songbookCss(slugs: string[]): string {
  if (slugs.length === 0) return '';
  const blocks = slugs.map((slug) => {
    const active = `:root[data-songbook='${slug}']`;
    return [
      `${active} [data-songbooks]:not([data-songbooks~='${slug}']),`,
      `${active} [data-songbooks-group]:not(:has([data-songbooks~='${slug}'])) { display: none; }`,
      `${active} [data-songbooks-dim]:not([data-songbooks-dim~='${slug}']) { order: 1; opacity: 0.5; }`,
      `${active} [data-songbooks-note]:not([data-songbooks-note~='${slug}']) { display: block; }`,
    ].join('\n');
  });
  return ['[data-songbooks-note] { display: none; }', ...blocks].join('\n');
}
