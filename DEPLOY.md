# Deploying a cantare songbook

This covers deploying a **consumer** songbook (the package path) as a static
site. The build emits a plain `dist/` directory of HTML/CSS/JS plus a Pagefind
search index — any static host works.

## What you need

A repo containing:

- `package.json` with `cantare` as a dependency (see
  [`examples/consumer/`](examples/consumer))
- `cantare.config.json` — name, description, url, locale, optional theme
- `songs/` — your `.cho` files

## Build command

```sh
npm ci && npx cantare build ./songs
```

- **Output / publish directory:** `dist`
- **Node:** 20+ (whatever your host's static/Nixpacks image provides)
- No `mise`, no `aube`, no environment variables required on the consumer side
  — the CLI resolves everything (songs dir, config, output) from the repo.

## Coolify (Nixpacks static)

1. New resource → your Git repository.
2. Build pack: **Nixpacks** (static).
3. **Install/Build command:** `npm ci && npx cantare build ./songs`
4. **Publish directory:** `dist`
5. Deploy. Coolify serves the static `dist/` output; Pagefind search runs
   entirely client-side, so no server runtime is needed.

## Notes

- `npm ci` requires a committed `package-lock.json`. Run `npm install` once
  locally and commit the lockfile.
- Installing `cantare` from git pulls the engine and its dependencies
  (Astro, ChordSheetJS, Pagefind, chord data); the build needs no extra setup.
- To bump the engine, re-install (`npm install cantare@<ref>`), commit the
  updated lockfile, and redeploy — there is no code to merge.
