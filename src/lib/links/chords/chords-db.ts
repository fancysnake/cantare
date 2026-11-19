/*
 * Build-time only: chords-db (~900 kB) stays out of the client bundle; song
 * pages embed the small subset this link returns.
 */
import guitar from '@tombatossals/chords-db/lib/guitar.json';
import { diagramKey, type ChordPosition, type DiagramData } from '../../pacts/chord';

/** The part of a `@tombatossals/chords-db` instrument file that diagrams read. */
interface ChordsDb {
  keys: string[];
  chords: Record<string, { suffix: string; positions: ChordPosition[] }[]>;
}

const db: ChordsDb = guitar;

/* chords-db spells these two keys differently in its `chords` map */
const DB_KEY: Record<string, string> = {
  'C#': 'Csharp',
  'F#': 'Fsharp',
};

/**
 * The fingerings for every given suffix, all twelve roots, so transposing in
 * the browser finds a diagram without the full database.
 */
export function fingeringsForSuffixes(suffixes: Iterable<string>): DiagramData {
  const data: DiagramData = {};
  for (const suffix of suffixes) {
    for (const key of db.keys) {
      const chord = db.chords[DB_KEY[key] ?? key]?.find((c) => c.suffix === suffix);
      const position = chord?.positions[0];
      if (position) {
        const { frets, fingers, baseFret, barres } = position;
        data[diagramKey(key, suffix)] = { frets, fingers, baseFret, barres };
      }
    }
  }
  return data;
}
