import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

import { readSongFiles } from './lib/links/songs/fs';
import { songMeta } from './lib/mills/song';
import { parseSongbooks, songbooksOf } from './lib/mills/songbook';
import { songMetaSchema } from './lib/pacts/song';
import { site } from './lib/site';

const SONGS_DIR = process.env.CANTARE_SONGS_DIR ?? 'songs';
const songbooks = parseSongbooks(site.songbooks);

const songs = defineCollection({
  loader: async () =>
    (await readSongFiles(SONGS_DIR)).map((file) => {
      const { id, source } = file;
      const meta = songMeta(file);
      return Object.assign({ id, source }, meta, { songbooks: songbooksOf(meta, songbooks) });
    }),
  schema: songMetaSchema.extend({
    songbooks: z.array(z.string()),
    source: z.string(),
  }),
});

export const collections = { songs };
