/**
 * Self-check for songbook membership and config validation. Matching decides
 * what a reader sees in every list, and neither `astro check` nor oxlint can
 * see a wrong rule. Run it with `node src/lib/songbook.check.ts`.
 */
import assert from 'node:assert/strict';
import { stdout } from 'node:process';

import { OTHER, type SongbookFields } from '../pacts/songbook.ts';
import { parseSiteConfig } from './config.ts';
import { facetValues, songbookMatchers, songbookOptions, songbooksOf } from './songbook.ts';

const books = songbookMatchers([
  { name: 'Campfire', tags: ['folk', 'Shanty'] },
  { name: 'Celebrations', tags: ['hymn'], artists: ['Robert Burns'] },
  { name: 'Polish', languages: ['pl'], albums: ['Kolędy'] },
]);

const song = (fields: Partial<SongbookFields>): SongbookFields => ({
  artist: 'Traditional',
  tags: [],
  ...fields,
});

// A missing album or language is no value, so it groups and matches nothing.
assert.deepEqual(facetValues(song({ tags: ['folk'], language: 'en' })), {
  tags: ['folk'],
  artists: ['Traditional'],
  albums: [],
  languages: ['en'],
});

// Any listed value under any key picks the song.
assert.deepEqual(songbooksOf(song({ tags: ['folk'] }), books), ['campfire']);
assert.deepEqual(songbooksOf(song({ artist: 'Robert Burns' }), books), ['celebrations']);
assert.deepEqual(songbooksOf(song({ album: 'Kolędy' }), books), ['polish']);
// Matching ignores case and accents, like the listing pages' slugs.
assert.deepEqual(songbooksOf(song({ tags: ['shanty'] }), books), ['campfire']);
assert.deepEqual(songbooksOf(song({ album: 'koledy' }), books), ['polish']);
// A song can sit in several songbooks.
assert.deepEqual(songbooksOf(song({ tags: ['hymn'], language: 'PL' }), books), [
  'celebrations',
  'polish',
]);
// Unpicked songs land in Other; with no songbooks there is nothing to belong to.
assert.deepEqual(songbooksOf(song({ tags: ['test'] }), books), [OTHER]);
assert.deepEqual(songbooksOf(song({ tags: ['folk'] }), []), []);

// "Other" is offered only when some song lands in it.
const config = [{ name: 'Campfire', tags: ['folk'] }];
assert.deepEqual(songbookOptions(config, [{ data: { songbooks: ['campfire'] } }], 'Rest'), [
  { slug: 'campfire', name: 'Campfire' },
]);
assert.deepEqual(songbookOptions(config, [{ data: { songbooks: [OTHER] } }], 'Rest'), [
  { slug: 'campfire', name: 'Campfire' },
  { slug: OTHER, name: 'Rest' },
]);

const site = { name: 'Site', description: 'Songs', url: 'https://example.org', locale: 'en' };
const parseSongbooks = (songbooks: unknown) => parseSiteConfig({ ...site, songbooks });

assert.deepEqual(parseSiteConfig(site), site);
assert.deepEqual(songbookMatchers(parseSiteConfig(site).songbooks), []);
// A misspelled key fails, whether the field it meant is required or optional.
assert.throws(() => parseSiteConfig({ ...site, name: undefined, nmae: 'Site' }), /"nmae"/);
assert.throws(() => parseSiteConfig({ ...site, themeDrak: {} }), /"themeDrak"/);
assert.throws(() => parseSiteConfig({ ...site, footer: { text: 'x', link: 'y' } }), /"link"/);
assert.throws(() => parseSiteConfig({ ...site, description: 7 }), /expected string/);
assert.throws(() => parseSiteConfig({ ...site, footer: 'x' }), /expected object/);
assert.throws(() => parseSongbooks([{ name: 'Empty' }]), /hold no songs/);
assert.throws(() => parseSongbooks([{ name: 'Empty', tags: [] }]), /hold no songs/);
assert.throws(() => parseSongbooks([{ name: 'Other', tags: ['x'] }]), /clashes/);
assert.throws(
  () =>
    parseSongbooks([
      { name: 'Choir', tags: ['x'] },
      { name: 'choir', tags: ['y'] },
    ]),
  /clashes/,
);
assert.throws(() => parseSongbooks([{ name: 'Typo', tags: ['x'], tag: ['y'] }]), /"tag"/);
assert.throws(() => parseSongbooks({ name: 'Campfire', tags: ['x'] }), /expected array/);
assert.throws(() => parseSongbooks([{ name: '!!', tags: ['x'] }]), /no letters or digits/);
assert.throws(() => parseSongbooks([{ name: 'Blank', tags: [''] }]), /no letters or digits/);
assert.throws(() => parseSongbooks([{ name: 'Kanji', artists: ['日本'] }]), /no letters or digits/);

stdout.write('songbook checks passed\n');
