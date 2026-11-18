import { slugify } from '../pacts/slug';
import type { FacetKey, SongbookFields } from '../pacts/songbook';
import { facetValues } from './songbook';

export interface Facet<Song> {
  slug: string;
  name: string;
  songs: Song[];
}

/** Groups songs by the slug of each value under `key`, sorted by name in `locale`; first spelling seen names the group. */
export function groupBySlug<Song extends { data: SongbookFields }>(
  songs: Song[],
  key: FacetKey,
  locale: string,
): Facet<Song>[] {
  const groups = new Map<string, Facet<Song>>();
  for (const song of songs) {
    for (const name of facetValues(song.data)[key]) {
      const slug = slugify(name);
      const group = groups.get(slug) ?? { slug, name, songs: [] };
      group.songs.push(song);
      groups.set(slug, group);
    }
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name, locale));
}
