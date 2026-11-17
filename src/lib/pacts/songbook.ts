import { z } from 'astro/zod';
import { slugify } from './slug.ts';

export const FACET_KEYS = ['tags', 'artists', 'albums', 'languages'] as const;

/** A song field that songbooks match on and the listing pages group by. */
export type FacetKey = (typeof FACET_KEYS)[number];

/** The built-in songbook holding every song no defined songbook picks. */
export const OTHER = 'other';

const slugs = (values: string[] = []) => new Set(values.map(slugify));

// An empty slug would match every song whose value also slugifies to nothing.
const sluggable = z.string().refine((value) => slugify(value) !== '', 'has no letters or digits');
const values = z.array(sluggable).optional();

/** A songbook as written in the config: a song belongs if it matches any listed value. */
export const songbookSchema = z
  .strictObject({
    name: sluggable,
    tags: values,
    artists: values,
    albums: values,
    languages: values,
  })
  .refine((config) => FACET_KEYS.some((key) => config[key]?.length), {
    error: `lists no ${FACET_KEYS.join(', ')}, so it would hold no songs`,
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
