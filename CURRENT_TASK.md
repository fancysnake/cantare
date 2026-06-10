# Current Task

**Task:** Cantare songbook kickoff (see FEATURE_PLAN.md)
**Phase:** Complete — all 16 plan steps done
**Branch:** feature/songbook-kickoff (not merged)

## State

- Static songbook: Astro 6 + ChordSheetJS 15 + Pagefind 1.5 (Component UI)
- Search-first homepage; browse, artist/album/tag taxonomy pages; random pick
- Song pages: transposition, autoscroll, chord diagrams (chords-db +
  hand-rolled SVG renderer), hover/tap popovers
- Lyrics-only by default (🎸 "With/Without chords" toggle), dark mode toggle,
  print styles, mobile layout
- Palette: green #008000 (chords) / purple #47066B (accents) / gold #A06B00 (bg)
- Tooling: mise tasks (dev/build/preview/lint/format/check), aube, ESLint
  strict type-checked + Prettier, astro check, tsconfig strictest
- Branding per instance via site.config.json

## Notes for next session

- mise.toml is user-managed (write-protected for Claude): tasks added by hand
- aube gates: svguitar rejected (low downloads — replaced by own renderer),
  eslint-config-prettier rejected (MAL-2025-6022 — intentionally omitted)
- Possible follow-ups: deploy target/CI, Polish translation of UI strings,
  notation toggle (H/B), more songs
