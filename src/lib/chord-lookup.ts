export interface ChordPosition {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
}

export type DiagramData = Record<string, ChordPosition>;

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

/** Key into DiagramData for a displayed chord name, e.g. "F#m7" → "F#|m7". */
export function chordKey(name: string): string | null {
  const parsed = parseChordName(name);
  if (!parsed) return null;
  return `${parsed.root}|${normalizeSuffix(parsed.suffix)}`;
}
