/**
 * Self-check for word grouping — the one part of song.ts that reads its own
 * renderer's HTML back, so neither `astro check` nor ESLint can see a wrong
 * boundary rule. Run it with `node src/lib/song.check.ts`.
 */
import assert from 'node:assert/strict';
import { stdout } from 'node:process';
import { extractMeta, parseSong, renderSong } from './song.ts';

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

// Two urls on one host must not render two identically labelled buttons.
const { urls } = extractMeta(
  parseSong(
    '{meta: url https://www.youtube.com/watch?v=a Live, 1994}\n{meta: url https://www.youtube.com/watch?v=b}',
  ),
);
assert.deepEqual(urls, [
  { href: 'https://www.youtube.com/watch?v=a', label: 'Live, 1994' },
  { href: 'https://www.youtube.com/watch?v=b', label: 'youtube.com' },
]);

stdout.write('song.check: ok\n');
