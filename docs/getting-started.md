# Getting started

## Use as a package

A consumer songbook is a `package.json`, a `cantare.config.json`, and a
`songs/` folder — nothing else. See
[`examples/consumer/`](https://github.com/fancysnake/cantare/tree/main/examples/consumer)
for a copy-paste starter.

```json
{
  "name": "my-songbook",
  "private": true,
  "type": "module",
  "scripts": { "build": "cantare build ./songs" },
  "dependencies": { "cantare": "github:fancysnake/cantare#v0.4.0" }
}
```

```sh
npm install
npx cantare build ./songs   # static site into ./dist
```

The CLI:

| Command                    | What it does                                       |
| -------------------------- | -------------------------------------------------- |
| `cantare build [songsDir]` | Build into `./dist` (songsDir defaults to `songs`) |
| `cantare dev [songsDir]`   | Dev server at http://localhost:4321                |
| `cantare preview`          | Serve the production build                         |

Options: `-c, --config <file>` (defaults to `./cantare.config.json`, falling
back to the engine's bundled config) and `-o, --out <dir>` (defaults to
`./dist`). Engine updates arrive by re-installing the dependency — no code to
merge.

Next: [configure the songbook](configuration.md) and [add songs](songs.md).

## Pin the version, and force the upgrade

There is no registry release behind `github:` — npm resolves the ref once,
writes the commit into `package-lock.json`, and reuses that commit forever.
So pin the tag you want and treat it as the version:

```json
{ "dependencies": { "cantare": "github:fancysnake/cantare#v0.4.0" } }
```

Leave the ref off and you are not on the latest engine, you are on whatever
`main` happened to be the day you first installed — on every machine, forever,
because the lockfile carries the commit. Nothing warns you that a release came
and went.

To move to a new release, bump the tag and re-install. Released versions are
the [tags](https://github.com/fancysnake/cantare/tags); substitute the one you
want for `vX.Y.Z`:

```sh
npm install cantare@github:fancysnake/cantare#vX.Y.Z
```

Naming the spec is the reliable form. A bare `npm install` is happy with a
lockfile entry that still satisfies `package.json`, so on an unpinned or
branch-tracking ref (`#main`) it changes nothing at all — that case needs the
explicit spec above, or `npm update cantare`, to re-resolve.

Then commit the updated `package-lock.json`, or your host's `npm ci` will keep
building the old engine. What changed in each release is in the
[changelog](https://github.com/fancysnake/cantare/blob/main/CHANGELOG.md).

## Develop / customize from source

Clone the repo and work with the tooling directly. The repo's own
`site.config.json` is the **default config** and `songs/` the default content,
so a fresh clone builds the demo site with no extra setup.

```sh
mise install   # installs node + aube, then `aube install` runs on enter
mise run dev   # dev server at http://localhost:4321
```

| Task                  | What it does                                        |
| --------------------- | --------------------------------------------------- |
| `mise run dev`        | Dev server with hot reload                          |
| `mise run build`      | Static production build into `dist/` + search index |
| `mise run preview`    | Serve the production build locally                  |
| `mise run lint`       | ESLint (strict, type-checked) + Prettier check      |
| `mise run format`     | Format the codebase with Prettier                   |
| `mise run check`      | `astro check` type-checks the templates             |
| `mise run site:serve` | These docs at http://localhost:8000                 |
| `mise run site:check` | Build the docs, failing on a broken link            |

Search needs a Pagefind index. The production build always has one; the dev
server serves the index from the **last build**, so run `mise run build` once
after adding songs if you want them searchable during development.
