/*
 * Build-time only: extracts the fingering subset a song page needs from
 * chords-db (~900 kB), so the client only ever receives a small JSON map.
 * For every chord suffix used in the song we embed all twelve roots, which
 * keeps client-side transposition lookups offline.
 */
import guitar from '@tombatossals/chords-db/lib/guitar.json';
import { parseChordName, normalizeSuffix, type DiagramData } from './chord-lookup';

const KEY_TO_CHORDS_MAP: Record<string, string> = {
  'C#': 'Csharp',
  'F#': 'Fsharp',
};

type DbChord = {
  suffix: string;
  positions: {
    frets: number[];
    fingers: number[];
    baseFret: number;
    barres: number[];
  }[];
};

const chords = guitar.chords as Record<string, DbChord[]>;

export function diagramDataForChords(chordNames: string[]): DiagramData {
  const suffixes = new Set<string>();
  for (const name of chordNames) {
    const parsed = parseChordName(name);
    if (parsed) suffixes.add(normalizeSuffix(parsed.suffix));
  }

  const data: DiagramData = {};
  for (const suffix of suffixes) {
    for (const key of guitar.keys) {
      const chord = chords[KEY_TO_CHORDS_MAP[key] ?? key]?.find((c) => c.suffix === suffix);
      const position = chord?.positions[0];
      if (position) {
        const { frets, fingers, baseFret, barres } = position;
        data[`${key}|${suffix}`] = { frets, fingers, baseFret, barres };
      }
    }
  }
  return data;
}
