export interface ChordPosition {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
}

export type DiagramData = Record<string, ChordPosition>;

/** The part of a `@tombatossals/chords-db` instrument file that diagrams read. */
export interface ChordsDb {
  keys: string[];
  chords: Record<string, { suffix: string; positions: ChordPosition[] }[]>;
}
