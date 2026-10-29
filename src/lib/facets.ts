import type { CollectionEntry } from 'astro:content';
import { slugify } from './slug';

type Song = CollectionEntry<'songs'>;

export interface Facet {
  name: string;
  songs: Song[];
}

/** Groups songs by the slug of each value `valuesOf` returns; first spelling seen names the group. */
export function groupBySlug(songs: Song[], valuesOf: (song: Song) => string[]): Map<string, Facet> {
  const groups = new Map<string, Facet>();
  for (const song of songs) {
    for (const name of valuesOf(song)) {
      const slug = slugify(name);
      const group = groups.get(slug) ?? { name, songs: [] };
      group.songs.push(song);
      groups.set(slug, group);
    }
  }
  return groups;
}
