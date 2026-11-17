import { z } from 'astro/zod';

const webUrl = z.url({ protocol: /^https?$/ });

/** The metadata a song's ChordPro directives carry. */
export const songMetaSchema = z.object({
  title: z.string(),
  artist: z.string(),
  album: z.string().optional(),
  language: z.string().optional(),
  key: z.string().optional(),
  capo: z.number().optional(),
  copyright: z.string().optional(),
  redirect: webUrl.optional(),
  urls: z.array(z.object({ href: webUrl, label: z.string() })),
  tags: z.array(z.string()),
});

export type SongMeta = z.infer<typeof songMetaSchema>;

/** A source link on a song's own page. */
export type SongUrl = SongMeta['urls'][number];

/** Where a song list points. */
export interface SongLink {
  href: string;
  target?: '_blank';
}

/** A random-pick candidate: the song's link and the songbooks it may be picked in. */
export type RandomLink = SongLink & { songbooks: string[] };
