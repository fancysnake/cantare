import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { SongFile } from '../../pacts/song';

/** Every `.cho` file under `dir`; throws when two share a slug. */
export async function readSongFiles(dir: string): Promise<SongFile[]> {
  const root = path.resolve(dir);
  // Recurse so songs can be organized in subfolders (e.g. by artist). The
  // slug stays the bare filename — the `/songs/[slug]` route is a single
  // segment, so subfolders are organizational only and never appear in URLs.
  const entries = await fs.readdir(root, { recursive: true, withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.cho'));

  const seen = new Map<string, string>();
  return Promise.all(
    files.map(async (entry) => {
      const filePath = path.join(entry.parentPath, entry.name);
      const relative = path.relative(root, filePath);
      const id = entry.name.replace(/\.cho$/, '');
      const prior = seen.get(id);
      if (prior !== undefined) {
        throw new Error(
          `Duplicate song slug "${id}": ${prior} and ${relative}. Filenames must be unique across subfolders.`,
        );
      }
      seen.set(id, relative);
      return { id, path: relative, source: await fs.readFile(filePath, 'utf-8') };
    }),
  );
}
