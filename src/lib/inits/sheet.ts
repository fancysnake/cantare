/*
 * Song rendering and chord diagrams, for the build and the browser alike: the
 * song page renders with these, and its scripts render again on transposition.
 */
import type { DiagramData } from '../pacts/chord';

import { chordDiagramFor } from '../mills/chord-diagram';
import { t } from './site';

export { isTrailing, parseSong, renderSong, renderTransposed } from '../mills/song';

/** The diagram for a chord name, labelled in the site locale; null when `data` has no fingering for it. */
export const chordDiagram = (name: string, data: DiagramData): string | null =>
  chordDiagramFor(name, data, t.chordDiagram);
