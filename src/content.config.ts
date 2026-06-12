import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseSong, extractMeta } from './lib/song';

const SONGS_DIR = process.env.CANTARE_SONGS_DIR ?? 'songs';

const songs = defineCollection({
  loader: async () => {
    const dir = path.resolve(SONGS_DIR);
    // Recurse so songs can be organized in subfolders (e.g. by artist). The
    // slug stays the bare filename — the `/songs/[slug]` route is a single
    // segment, so subfolders are organizational only and never appear in URLs.
    const entries = await fs.readdir(dir, { recursive: true, withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.cho'));

    const seen = new Map<string, string>();
    return Promise.all(
      files.map(async (entry) => {
        const filePath = path.join(entry.parentPath, entry.name);
        const id = entry.name.replace(/\.cho$/, '');
        const prior = seen.get(id);
        if (prior !== undefined) {
          throw new Error(
            `Duplicate song slug "${id}": ${path.relative(dir, prior)} and ${path.relative(dir, filePath)}. Filenames must be unique across subfolders.`,
          );
        }
        seen.set(id, filePath);
        const source = await fs.readFile(filePath, 'utf-8');
        const meta = extractMeta(parseSong(source));
        return { id, source, ...meta };
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
