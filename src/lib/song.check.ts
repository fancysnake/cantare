/**
 * Self-check for word grouping — the one part of song.ts that reads its own
 * renderer's HTML back, so neither `astro check` nor ESLint can see a wrong
 * boundary rule. Run it with `node src/lib/song.check.ts`.
 */
import assert from 'node:assert/strict';
import { stdout } from 'node:process';
import { parseSong, renderSong } from './song.ts';

/** The plain text of each `.word` span, chords stripped. */
function words(source: string): string[] {
  const html = renderSong(parseSong(source));
  return [...html.matchAll(/<span class="word">(.*?)<\/span>/g)].map((match) =>
    (match[1] ?? '')
      .replace(/<div class="chord">.*?<\/div>/g, '')
      .replace(/<[^>]*>/g, '')
      .trim(),
  );
}

// A chord landing mid-word must not let the word wrap apart — and only that
// word is split off, so the complete words before it stay in one reflowable
// column rather than becoming atomic boxes of their own.
assert.deepEqual(words('And [G]grace my fears re[D]lieved'), [
  'And',
  'grace',
  'my fears',
  'relieved',
]);

// A chord jammed against punctuation leaves the following words in one pair;
// they must not be glued into a single unbreakable unit.
assert.deepEqual(words("Don't [Am]worry,[C] be happy"), ["Don't", 'worry,', 'be', 'happy']);

// A bracketed trailing run stays one unit with its brackets, and the closing
// bracket gets its own column instead of sitting under the last chord.
const bracketed = '{chord_style: trailing}\nlyrics [C] ([Em] [G])';
assert.deepEqual(words(bracketed), ['lyrics', '()']);
assert.match(
  renderSong(parseSong(bracketed)),
  /<div class="chord">G<\/div><div class="lyrics"><\/div><\/div><div class="column"><div class="chord"><\/div><div class="lyrics">\)<\/div>/,
);

// Mid-line, the closing punctuation carries the space that ends its word, and
// still gets its own column — the last of its `.word`, which global.css relies
// on to pull it flush against the chord.
const midLine = '{chord_style: trailing}\nlyrics [C] ([Em] [G]) [D], [A]';
assert.deepEqual(words(midLine), ['lyrics', '()', ',', '']);
assert.match(
  renderSong(parseSong(midLine)),
  /<div class="chord">G<\/div><div class="lyrics"><\/div><\/div><div class="column"><div class="chord"><\/div><div class="lyrics">\) <\/div><\/div><\/span>/,
);

// Inline songs keep an opening bracket followed by a space as a word of its own.
assert.deepEqual(words('word ([C] la)'), ['word', '(', 'la)']);

stdout.write('song.check: ok\n');
