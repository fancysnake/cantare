import { z } from 'astro/zod';

import type { SongMeta } from './song.ts';

import { slugify } from './slug.ts';

export const FACET_KEYS = ['tags', 'artists', 'albums', 'languages'] as const;

/** A song field that songbooks match on and the listing pages group by. */
export type FacetKey = (typeof FACET_KEYS)[number];

/** The built-in songbook holding every song no defined songbook picks. */
export const OTHER = 'other';

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
  .refine((config) => FACET_KEYS.some((key) => config[key]?.length), {
    error: `lists no ${FACET_KEYS.join(', ')}, so it would hold no songs`,
  });

export type SongbookConfig = z.infer<typeof songbookSchema>;

/** The config's songbook list: each slug is unique and none is `OTHER`. */
export const songbooksSchema = z.array(songbookSchema).superRefine((songbooks, context) => {
  // Two songbooks with one slug would share a switcher choice and a `?songbook=` link.
  const seen = new Set([OTHER]);
  for (const [index, { name }] of songbooks.entries()) {
    const slug = slugify(name);
    if (seen.has(slug)) {
      context.addIssue({
        code: 'custom',
        path: [index, 'name'],
        message: `"${name}" clashes with another songbook (or the built-in "${OTHER}")`,
      });
    }
    seen.add(slug);
  }
});

/** The songs that share one value of a facet key; each gets a listing page. */
export interface Facet<Song> {
  slug: string;
  name: string;
  songs: Song[];
}

/** The song metadata songbooks match on. */
export type SongbookFields = Pick<SongMeta, 'artist' | 'album' | 'language' | 'tags'>;
