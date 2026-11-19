/*
 * Build-time only: chords-db (~900 kB) stays out of the client bundle; song
 * pages hand it to the diagram-data mill and embed the small subset it returns.
 */
import guitar from '@tombatossals/chords-db/lib/guitar.json';
import type { ChordsDb } from '../../pacts/chord';

export const chordsDb: ChordsDb = guitar;
