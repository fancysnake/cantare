import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { songMetaSchema } from './lib/pacts/song';
import { site } from './lib/site';
import { readSongFiles } from './lib/links/songs/fs';
import { parseSong, extractMeta } from './lib/mills/song';
import { parseSongbooks, songbooksOf } from './lib/mills/songbook';

const SONGS_DIR = process.env.CANTARE_SONGS_DIR ?? 'songs';
const songbooks = parseSongbooks(site.songbooks);

const songs = defineCollection({
  loader: async () =>
    (await readSongFiles(SONGS_DIR)).map(({ id, path, source }) => {
      const song = parseSong(source);
      // chordsheetjs would drop the old directive silently, leaving a link-only song an empty sheet.
      if (song.metadata.get('link') !== null) {
        throw new Error(`${path}: {meta: link} was renamed to {meta: redirect}.`);
      }
      const meta = extractMeta(song);
      return { id, source, ...meta, songbooks: songbooksOf(meta, songbooks) };
    }),
  schema: songMetaSchema.extend({
    songbooks: z.array(z.string()),
    source: z.string(),
  }),
});

export const collections = { songs };
