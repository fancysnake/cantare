export interface ChordPosition {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
}

/** The twelve chord roots, spelled as chord diagrams are keyed. */
export const CHORD_ROOTS = [
  'C',
  'C#',
  'D',
  'Eb',
  'E',
  'F',
  'F#',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
] as const;

export type ChordRoot = (typeof CHORD_ROOTS)[number];

export type DiagramData = Record<string, ChordPosition>;

/** Key into DiagramData: a chord root and a normalized suffix, e.g. "F#|m7". */
export function diagramKey(root: string, suffix: string): string {
  return `${root}|${suffix}`;
}
