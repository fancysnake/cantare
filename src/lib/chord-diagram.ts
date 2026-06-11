/*
 * Minimal SVG chord-box renderer for chords-db positions.
 * frets/fingers are low-E → high-E; -1 = muted, 0 = open.
 * Uses currentColor throughout so it follows light/dark themes.
 */
import type { ChordPosition } from './chord-lookup';
import { t } from './i18n';

const STRINGS = 6;
const FRETS = 4;
const LEFT = 14;
const TOP = 26;
const STRING_GAP = 11;
const FRET_GAP = 17;
const RIGHT = LEFT + (STRINGS - 1) * STRING_GAP;
const BOTTOM = TOP + FRETS * FRET_GAP;

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function chordDiagramSvg(name: string, position: ChordPosition): string {
  const { frets, fingers, baseFret, barres } = position;
  const parts: string[] = [];

  parts.push(
    `<text x="${(LEFT + RIGHT) / 2}" y="11" text-anchor="middle" font-size="11" font-weight="600" fill="currentColor">${escapeXml(name)}</text>`,
  );

  for (let s = 0; s < STRINGS; s += 1) {
    const x = LEFT + s * STRING_GAP;
    parts.push(
      `<line x1="${x}" y1="${TOP}" x2="${x}" y2="${BOTTOM}" stroke="currentColor" stroke-width="1"/>`,
    );
  }
  for (let f = 0; f <= FRETS; f += 1) {
    const y = TOP + f * FRET_GAP;
    parts.push(
      `<line x1="${LEFT}" y1="${y}" x2="${RIGHT}" y2="${y}" stroke="currentColor" stroke-width="1"/>`,
    );
  }

  if (baseFret === 1) {
    parts.push(
      `<rect x="${LEFT - 0.5}" y="${TOP - 3}" width="${RIGHT - LEFT + 1}" height="3" fill="currentColor"/>`,
    );
  } else {
    parts.push(
      `<text x="${RIGHT + 5}" y="${TOP + FRET_GAP / 2 + 3}" font-size="8" fill="currentColor">${baseFret}fr</text>`,
    );
  }

  for (const barre of barres) {
    const at = frets
      .map((fret, index) => ({ fret, index }))
      .filter(({ fret }) => fret === barre)
      .map(({ index }) => index);
    if (at.length > 1) {
      const x1 = LEFT + Math.min(...at) * STRING_GAP;
      const x2 = LEFT + Math.max(...at) * STRING_GAP;
      const y = TOP + (barre - 0.5) * FRET_GAP;
      parts.push(
        `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="currentColor" stroke-width="8" stroke-linecap="round" opacity="0.85"/>`,
      );
    }
  }

  frets.forEach((fret, s) => {
    const x = LEFT + s * STRING_GAP;
    if (fret === -1) {
      parts.push(
        `<text x="${x}" y="${TOP - 6}" text-anchor="middle" font-size="8" fill="currentColor">✕</text>`,
      );
    } else if (fret === 0) {
      parts.push(
        `<circle cx="${x}" cy="${TOP - 9}" r="3" fill="none" stroke="currentColor" stroke-width="1"/>`,
      );
    } else {
      const y = TOP + (fret - 0.5) * FRET_GAP;
      parts.push(`<circle cx="${x}" cy="${y}" r="4.5" fill="currentColor"/>`);
      const finger = fingers[s];
      if (finger && finger > 0) {
        parts.push(
          `<text x="${x}" y="${y + 2.5}" text-anchor="middle" font-size="7" fill="var(--color-surface, #fff)">${finger}</text>`,
        );
      }
    }
  });

  return `<svg viewBox="0 0 ${RIGHT + 16} ${BOTTOM + 8}" role="img" aria-label="${escapeXml(name)} — ${t.chordDiagram}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;
}
