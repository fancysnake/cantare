export interface ChordPosition {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
}

export type DiagramData = Record<string, ChordPosition>;
