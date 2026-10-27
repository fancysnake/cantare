/**
 * Self-check for songbook membership and config validation. Matching decides
 * what a reader sees in every list, and neither `astro check` nor ESLint can
 * see a wrong rule. Run it with `node src/lib/songbook.check.ts`.
 */
import assert from 'node:assert/strict';
import { stdout } from 'node:process';
import { OTHER, parseSongbooks, songbooksOf, type SongbookFields } from './songbook.ts';

const books = parseSongbooks([
  { name: 'Campfire', tags: ['folk', 'Shanty'] },
  { name: 'Celebrations', tags: ['hymn'], artists: ['Robert Burns'] },
  { name: 'Polish', languages: ['pl'], albums: ['Kolędy'] },
]);

const song = (fields: Partial<SongbookFields>): SongbookFields => ({
  artist: 'Traditional',
  tags: [],
  ...fields,
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

assert.deepEqual(parseSongbooks(undefined), []);
assert.throws(() => parseSongbooks([{ name: 'Empty' }]), /holds no songs|no tags/);
assert.throws(() => parseSongbooks([{ name: 'Other', tags: ['x'] }]), /clashes/);
assert.throws(
  () =>
    parseSongbooks([
      { name: 'Choir', tags: ['x'] },
      { name: 'choir', tags: ['y'] },
    ]),
  /clashes/,
);
assert.throws(
  () => parseSongbooks([{ name: 'Typo', tags: ['x'], tag: ['y'] } as never]),
  /unknown key tag/,
);
assert.throws(() => parseSongbooks([{ name: '!!', tags: ['x'] }]), /no letters or digits/);

stdout.write('songbook checks passed\n');
