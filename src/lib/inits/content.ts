/*
 * The song collection: `.cho` files from `CANTARE_SONGS_DIR`, each with its
 * metadata and the songbooks it belongs to. Apart from the pages module,
 * because that one reads the collection this one defines.
 */
import { z } from 'astro/zod';

import { site } from '../links/config/virtual';
import { readSongFiles } from '../links/songs/fs';
import { parseSiteConfig } from '../mills/config';
import { songMeta } from '../mills/song';
import { songbookMatchers, songbooksOf } from '../mills/songbook';
import { songMetaSchema } from '../pacts/song';

const SONGS_DIR = process.env.CANTARE_SONGS_DIR ?? 'songs';
// The collection loads before any page renders, so this is where a bad config stops the build.
const songbooks = songbookMatchers(parseSiteConfig(site).songbooks);

export const songSchema = songMetaSchema.extend({
  songbooks: z.array(z.string()),
  source: z.string(),
});

export const loadSongs = async (): Promise<({ id: string } & z.infer<typeof songSchema>)[]> =>
  (await readSongFiles(SONGS_DIR)).map((file) => {
    const { id, source } = file;
    const meta = songMeta(file);
    return { id, source, ...meta, songbooks: songbooksOf(meta, songbooks) };
  });
