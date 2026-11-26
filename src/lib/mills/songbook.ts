import { slugify } from '../pacts/slug.ts';
import {
  FACET_KEYS,
  OTHER,
  type FacetKey,
  type SongbookConfig,
  type SongbookFields,
} from '../pacts/songbook.ts';

interface Songbook {
  slug: string;
  name: string;
  match: Record<FacetKey, Set<string>>;
}

const slugSet = (values: string[] = []) => new Set(values.map(slugify));

/** A song's values under each facet key, as lists so a missing album or language is just empty. */
export function facetValues(song: SongbookFields): Record<FacetKey, string[]> {
  return {
    tags: song.tags,
    artists: [song.artist],
    albums: song.album ? [song.album] : [],
    languages: song.language ? [song.language] : [],
  };
}

/** The config's songbooks with their values slugified, so matching ignores case and accents like the listing pages do. */
export function songbookMatchers(config: SongbookConfig[] = []): Songbook[] {
  return config.map(({ name, tags, artists, albums, languages }) => ({
    slug: slugify(name),
    name,
    match: {
      tags: slugSet(tags),
      artists: slugSet(artists),
      albums: slugSet(albums),
      languages: slugSet(languages),
    },
  }));
}

/** Slugs of the songbooks a song belongs to: `other` when none picks it, nothing when none are defined. */
export function songbooksOf(song: SongbookFields, songbooks: Songbook[]): string[] {
  if (songbooks.length === 0) return [];
  const values = facetValues(song);
  const matched = songbooks
    .filter(({ match }) =>
      FACET_KEYS.some((key) => values[key].some((value) => match[key].has(slugify(value)))),
    )
    .map(({ slug }) => slug);
  return matched.length > 0 ? matched : [OTHER];
}

/** The switcher's choices: the songbooks, then `otherName` when some song lands in Other. */
export function songbookOptions(
  songbooks: Songbook[],
  songs: { data: { songbooks: string[] } }[],
  otherName: string,
): { slug: string; name: string }[] {
  const options = songbooks.map(({ slug, name }) => ({ slug, name }));
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
