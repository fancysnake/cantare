import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseSong, extractMeta } from './lib/song';

const SONGS_DIR = process.env.CANTARE_SONGS_DIR ?? 'songs';

const songs = defineCollection({
  loader: async () => {
    const dir = path.resolve(SONGS_DIR);
    const files = (await fs.readdir(dir)).filter((name) => name.endsWith('.cho'));

    return Promise.all(
      files.map(async (name) => {
        const source = await fs.readFile(path.join(dir, name), 'utf-8');
        const meta = extractMeta(parseSong(source));
        return { id: name.replace(/\.cho$/, ''), source, ...meta };
      }),
    );
  },
  schema: z.object({
    title: z.string(),
    artist: z.string(),
    album: z.string().optional(),
    language: z.string().optional(),
    key: z.string().optional(),
    capo: z.number().optional(),
    copyright: z.string().optional(),
    tags: z.array(z.string()),
    source: z.string(),
  }),
});

export const collections = { songs };
