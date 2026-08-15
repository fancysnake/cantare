# Configuration

`cantare.config.json` carries the brand and, optionally, a footer and a theme:

```json
{
  "name": "My Songbook",
  "description": "A small collection of songs.",
  "url": "https://songs.example.com",
  "locale": "en",
  "footer": { "text": "© 2026 Me", "href": "https://example.com" },
  "theme": { "accent": "#0a7d6b" },
  "themeDark": { "accent": "#3fd6b8" }
}
```

From source, the same file is the repo's `site.config.json`.

## Footer

`footer` renders a single line under the page, linked when `href` is set. Omit
it and no footer is rendered — the engine asserts nothing about your songbook's
name or licence, which is rarely the engine's own.

## Theming

`theme` (always applied) and `themeDark` (applied in dark mode — forced or via
`prefers-color-scheme`) override the palette. Keys are the `--color-*` custom
properties **without** the prefix; anything you omit keeps the engine default.
The full set lives in
[`src/styles/global.css`](https://github.com/fancysnake/cantare/blob/main/src/styles/global.css):

`bg`, `surface`, `text`, `muted`, `border`, `border-strong`, `accent`, `chord`.

## Hosting under a sub-path

Set `CANTARE_BASE` at build time to serve the songbook from somewhere other
than the domain root — this docs site does it for the demo:

```sh
CANTARE_BASE=/demo npx cantare build ./songs
```

Every generated link, asset and the Pagefind index are prefixed accordingly.
Unset, the base is `/`. The value must be a site-absolute path starting with a
single `/`; anything else fails the build rather than producing a site whose
links are quietly relative.

!!! note

    `CANTARE_BASE` is newer than the current release (`v0.4.0`). Until the next
    tag it is available only when building from source — see the
    [changelog](https://github.com/fancysnake/cantare/blob/main/CHANGELOG.md).

See [Deploying a songbook](deploy.md) for hosting the built `dist/`.
