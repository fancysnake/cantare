import type { ChordsDb, DiagramData } from '../pacts/chord';

/* chords-db uses these twelve key spellings */
const ENHARMONIC: Record<string, string> = {
  Db: 'C#',
  'D#': 'Eb',
  Gb: 'F#',
  'G#': 'Ab',
  'A#': 'Bb',
  Cb: 'B',
  'B#': 'C',
  Fb: 'E',
  'E#': 'F',
};

const SUFFIX_ALIASES: Record<string, string> = {
  '': 'major',
  maj: 'major',
  M: 'major',
  m: 'minor',
  min: 'minor',
  '-': 'minor',
  '+': 'aug',
  o: 'dim',
  ø: 'm7b5',
  M7: 'maj7',
  Δ: 'maj7',
  '2': 'sus2',
  '4': 'sus4',
};

export function parseChordName(name: string): { root: string; suffix: string } | null {
  const match = /^([A-G][#b]?)(.*)$/.exec(name.trim());
  if (!match) return null;
  const [, rawRoot = '', rawSuffix = ''] = match;
  const root = ENHARMONIC[rawRoot] ?? rawRoot;
  const suffix = rawSuffix.replace(/\/.*$/, ''); // ignore bass notes for fingering lookup
  return { root, suffix };
}

export function normalizeSuffix(suffix: string): string {
  return SUFFIX_ALIASES[suffix] ?? suffix;
}

function diagramKey(root: string, suffix: string): string {
  return `${root}|${suffix}`;
}

/** Key into DiagramData for a displayed chord name, e.g. "F#m7" → "F#|m7". */
export function chordKey(name: string): string | null {
  const parsed = parseChordName(name);
  if (!parsed) return null;
  return diagramKey(parsed.root, normalizeSuffix(parsed.suffix));
}

/* chords-db spells these two keys differently in its `chords` map */
const DB_KEY: Record<string, string> = {
  'C#': 'Csharp',
  'F#': 'Fsharp',
};

/**
 * The fingerings a song needs: for every suffix it uses, all twelve roots,
 * so transposing in the browser finds a diagram without the full database.
 */
export function diagramDataForChords(chordNames: string[], db: ChordsDb): DiagramData {
  const suffixes = new Set<string>();
  for (const name of chordNames) {
    const parsed = parseChordName(name);
    if (parsed) suffixes.add(normalizeSuffix(parsed.suffix));
  }

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
