export interface ChordPosition {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
}

export type DiagramData = Record<string, ChordPosition>;

/** Key into DiagramData: a chord root and a normalized suffix, e.g. "F#|m7". */
export function diagramKey(root: string, suffix: string): string {
  return `${root}|${suffix}`;
}
