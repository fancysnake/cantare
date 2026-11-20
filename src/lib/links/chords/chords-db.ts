/*
 * Build-time only: chords-db (~900 kB) stays out of the client bundle; song
 * pages embed the small subset this link returns.
 */
import guitar from '@tombatossals/chords-db/lib/guitar.json';
import {
  CHORD_ROOTS,
  diagramKey,
  type ChordPosition,
  type ChordRoot,
  type DiagramData,
} from '../../pacts/chord';

/** The part of a `@tombatossals/chords-db` instrument file that diagrams read. */
interface ChordsDb {
  chords: Record<string, { suffix: string; positions: ChordPosition[] }[]>;
}

const db: ChordsDb = guitar;

/** How chords-db spells each root in its `chords` map. */
const DB_KEY: Record<ChordRoot, string> = {
  C: 'C',
  'C#': 'Csharp',
  D: 'D',
  Eb: 'Eb',
  E: 'E',
  F: 'F',
  'F#': 'Fsharp',
  G: 'G',
  Ab: 'Ab',
  A: 'A',
  Bb: 'Bb',
  B: 'B',
};

const chordsByRoot = CHORD_ROOTS.map((root) => {
  const chords = db.chords[DB_KEY[root]];
  if (!chords) throw new Error(`chords-db has no chords for root "${root}".`);
  return [root, chords] as const;
});

/**
 * The fingerings for every given suffix, all twelve roots, so transposing in
 * the browser finds a diagram without the full database.
 */
export function fingeringsForSuffixes(suffixes: Iterable<string>): DiagramData {
  const data: DiagramData = {};
  for (const suffix of suffixes) {
    for (const [root, chords] of chordsByRoot) {
      const position = chords.find((c) => c.suffix === suffix)?.positions[0];
      if (position) {
        const { frets, fingers, baseFret, barres } = position;
        data[diagramKey(root, suffix)] = { frets, fingers, baseFret, barres };
      }
    }
  }
  return data;
}
