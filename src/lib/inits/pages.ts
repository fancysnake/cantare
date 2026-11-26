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
import { routesFor } from '../mills/routes';
import { songbookCss, songbookOptions } from '../mills/songbook';
import { themeCss } from '../mills/theme';
import { locale, site, t } from './site';
import { songbooks } from './songbooks';

export const routes = routesFor(import.meta.env.BASE_URL);

type Song = CollectionEntry<'songs'>;

export const allSongs = (): Promise<Song[]> => getCollection('songs');

/** The songs grouped by each value under `key`, sorted by name in the site locale. */
export const facets = async (key: FacetKey): Promise<Facet<Song>[]> =>
  groupBySlug(await allSongs(), key, locale);

/** The songbook switcher's choices. */
export const loadSongbookOptions = async (): Promise<{ slug: string; name: string }[]> =>
  songbookOptions(songbooks, await allSongs(), t.songbookOther);

/** The `<head>` stylesheet: the palette overrides from the site config, then the songbook rules. */
export const headCss = async (): Promise<string> =>
  [themeCss(site), songbookCss((await loadSongbookOptions()).map(({ slug }) => slug))]
    .filter(Boolean)
    .join('\n');

/** The fingerings a song page embeds for its chords, all twelve roots, so transposing needs no database. */
export const diagramDataFor = (chordNames: string[]): DiagramData =>
  fingeringsForSuffixes(diagramSuffixes(chordNames));
