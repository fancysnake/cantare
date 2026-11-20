/*
 * The song collection: `.cho` files from `CANTARE_SONGS_DIR`, each with its
 * metadata and the songbooks it belongs to. Apart from the pages module,
 * because that one reads the collection this one defines.
 */
import { z } from 'astro/zod';

import { site } from '../links/config/virtual';
import { readSongFiles } from '../links/songs/fs';
import { songMeta } from '../mills/song';
import { parseSongbooks, songbooksOf } from '../mills/songbook';
import { songMetaSchema } from '../pacts/song';

const SONGS_DIR = process.env.CANTARE_SONGS_DIR ?? 'songs';
const songbooks = parseSongbooks(site.songbooks);

export const songSchema = songMetaSchema.extend({
  songbooks: z.array(z.string()),
  source: z.string(),
});

export const loadSongs = async (): Promise<({ id: string } & z.infer<typeof songSchema>)[]> =>
  (await readSongFiles(SONGS_DIR)).map((file) => {
    const { id, source } = file;
    const meta = songMeta(file);
    return Object.assign({ id, source }, meta, { songbooks: songbooksOf(meta, songbooks) });
  });
