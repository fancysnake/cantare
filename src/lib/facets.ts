import type { CollectionEntry } from 'astro:content';
import { locale } from './i18n';
import { slugify } from './slug';
import { facetValues, type FacetKey } from './songbook';

type Song = CollectionEntry<'songs'>;

export interface Facet {
  slug: string;
  name: string;
  songs: Song[];
}

/** Groups songs by the slug of each value under `key`, sorted by name; first spelling seen names the group. */
export function groupBySlug(songs: Song[], key: FacetKey): Facet[] {
  const groups = new Map<string, Facet>();
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
