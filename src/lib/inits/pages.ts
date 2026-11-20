/*
 * What pages read at build time: the songs, their groupings, the chord
 * fingerings and the internal links. Build only: it reads the content
 * collection and the chord database (~900 kB), so no browser script imports it.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

import type { DiagramData } from '../pacts/chord';
import type { Facet, FacetKey } from '../pacts/songbook';

import { fingeringsForSuffixes } from '../links/chords/chords-db';
import { diagramSuffixes } from '../mills/chord-lookup';
import { groupBySlug } from '../mills/facets';
import { routes } from '../mills/routes';
import { songbookOptions as optionsOf } from '../mills/songbook';
import { themeCss as themeCssOf } from '../mills/theme';
import { locale, site, t } from './site';

export { songbookCss } from '../mills/songbook';

export const {
  url,
  homeHref,
  songsHref,
  songHref,
  songLink,
  artistsHref,
  artistHref,
  albumHref,
  tagsHref,
  tagHref,
  languagesHref,
  languageHref,
} = routes(import.meta.env.BASE_URL);

type Song = CollectionEntry<'songs'>;

export const songs = (): Promise<Song[]> => getCollection('songs');

/** The songs grouped by each value under `key`, sorted by name in the site locale. */
export const facets = async (key: FacetKey): Promise<Facet<Song>[]> =>
  groupBySlug(await songs(), key, locale);

/** The songbook switcher's choices. */
export const songbookOptions = async (): Promise<{ slug: string; name: string }[]> =>
  optionsOf(site.songbooks, await songs(), t.songbookOther);

/** The palette overrides from the site config, as CSS; empty when it sets none. */
export const themeCss = themeCssOf(site);

/** The fingerings a song page embeds for its chords, all twelve roots, so transposing needs no database. */
export const diagramData = (chordNames: string[]): DiagramData =>
  fingeringsForSuffixes(diagramSuffixes(chordNames));
