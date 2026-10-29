import { z } from 'astro/zod';
import { slugify } from './slug.ts';

const KEYS = ['tags', 'artists', 'albums', 'languages'] as const;

/** A song field that songbooks match on and the listing pages group by. */
export type FacetKey = (typeof KEYS)[number];

/** The built-in songbook holding every song no defined songbook picks. */
export const OTHER = 'other';

const slugs = (values: string[] = []) => new Set(values.map(slugify));

// An empty slug would match every song whose value also slugifies to nothing.
const sluggable = z.string().refine((value) => slugify(value) !== '', 'has no letters or digits');
const values = z.array(sluggable).optional();

/** A songbook as written in the config: a song belongs if it matches any listed value. */
const songbookSchema = z
  .strictObject({
    name: sluggable,
    tags: values,
    artists: values,
    albums: values,
    languages: values,
  })
  .refine((config) => KEYS.some((key) => config[key]?.length), {
    error: `lists no ${KEYS.join(', ')}, so it would hold no songs`,
  })
  // Slugified values, so matching ignores case and accents like the listing pages do.
  .transform(({ name, tags, artists, albums, languages }) => ({
    slug: slugify(name),
    name,
    match: {
      tags: slugs(tags),
      artists: slugs(artists),
      albums: slugs(albums),
      languages: slugs(languages),
    },
  }));

export type SongbookConfig = z.input<typeof songbookSchema>;
export type Songbook = z.output<typeof songbookSchema>;

/** The song metadata songbooks match on. */
export interface SongbookFields {
  artist: string;
  album?: string | undefined;
  language?: string | undefined;
  tags: string[];
}

/** A song's values under each facet key, as lists so a missing album or language is just empty. */
export function facetValues(song: SongbookFields): Record<FacetKey, string[]> {
  return {
    tags: song.tags,
    artists: [song.artist],
    albums: song.album ? [song.album] : [],
    languages: song.language ? [song.language] : [],
  };
}

/** Validate the config's songbooks; a mistake fails the build rather than silently matching nothing. */
export function parseSongbooks(config: unknown): Songbook[] {
  const result = z.array(songbookSchema).optional().safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid songbooks in the config:\n${z.prettifyError(result.error)}`);
  }
  const seen = new Set([OTHER]);
  for (const { slug, name } of result.data ?? []) {
    if (seen.has(slug)) {
      throw new Error(`Songbook "${name}" clashes with another one (or the built-in "${OTHER}").`);
    }
    seen.add(slug);
  }
  return result.data ?? [];
}

/** Slugs of the songbooks a song belongs to: `other` when none picks it, nothing when none are defined. */
export function songbooksOf(song: SongbookFields, songbooks: Songbook[]): string[] {
  if (songbooks.length === 0) return [];
  const values = facetValues(song);
  const matched = songbooks
    .filter(({ match }) =>
      KEYS.some((key) => values[key].some((value) => match[key].has(slugify(value)))),
    )
    .map(({ slug }) => slug);
  return matched.length > 0 ? matched : [OTHER];
}

/** The switcher's choices: the config's songbooks, then `otherName` when some song lands in Other. */
export function songbookOptions(
  config: unknown,
  songs: { data: { songbooks: string[] } }[],
  otherName: string,
): { slug: string; name: string }[] {
  const options = parseSongbooks(config).map(({ slug, name }) => ({ slug, name }));
  const hasOther = songs.some((song) => song.data.songbooks.includes(OTHER));
  return hasOther ? [...options, { slug: OTHER, name: otherName }] : options;
}

/**
 * CSS that applies the active songbook (`data-songbook` on <html>) before first paint.
 *
 * Membership is baked into attributes at build time, so this is the whole filter:
 * `data-songbooks` hides an element outside the songbook, `data-songbooks-dim`
 * greys it, `data-songbooks-group` hides a group with nothing left in it,
 * `data-songbooks-note` shows only outside the songbook, and of the
 * `data-songbooks-count` spans only the active songbook's shows (the empty one
 * is the total, shown when none is active).
 */
export function songbookCss(slugs: string[]): string {
  if (slugs.length === 0) return '';
  const blocks = slugs.map((slug) => {
    const active = `:root[data-songbook='${slug}']`;
    return [
      `${active} [data-songbooks]:not([data-songbooks~='${slug}']),`,
      `${active} [data-songbooks-count=''],`,
      `${active} [data-songbooks-group]:not(:has([data-songbooks~='${slug}'])) { display: none; }`,
      `${active} [data-songbooks-dim]:not([data-songbooks-dim~='${slug}']) { opacity: 0.5; }`,
      `${active} [data-songbooks-note]:not([data-songbooks-note~='${slug}']) { display: block; }`,
      `${active} [data-songbooks-count='${slug}'] { display: inline; }`,
    ].join('\n');
  });
  return [
    "[data-songbooks-note], [data-songbooks-count]:not([data-songbooks-count='']) { display: none; }",
    ...blocks,
  ].join('\n');
}
