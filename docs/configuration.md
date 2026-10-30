# Configuration

`cantare.config.json` carries the brand and, optionally, a footer, a theme and
songbooks:

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

## Songbooks

`songbooks` splits one collection into named selections a reader can switch
between, such as a choir set and campfire songs:

```json
"songbooks": [
  { "name": "Choir", "tags": ["choir", "hymn"] },
  { "name": "Campfire", "tags": ["folk"], "artists": ["Traditional"] }
]
```

A song belongs to a songbook when any one of its tags, its artist, album or
language appears in the lists; case and accents don't matter. A song can
belong to several songbooks. Songs no songbook picks go to a built-in
**Other**.

With songbooks defined, the header shows a switcher. While a songbook is
active, search, the song index and random picks show only its songs. On the
artist, tag and language indexes, counts follow it and entries with no songs
in it are greyed out. A song page opened from outside the songbook still opens
and says so. The choice is the reader's own, remembered in their browser.

To share a songbook, add `?songbook=` with its slug to any page's link. The
slug is the name lowercased, with accents dropped and every run of other
characters turned into `-`: "Campfire" becomes `campfire`, "Śpiewnik Chóru"
becomes `spiewnik-choru`. `/artists/?songbook=campfire` opens the artist index
with Campfire active. The page then drops the parameter, so the address bar
shows the plain link. `?songbook=other` works too when some songs land in
Other; an unknown slug, or the name as written, is ignored. While a songbook is active, the header's **Share link** button copies
the current page's link with that songbook added.

A songbook that lists nothing, uses an unknown key, has a name or value with no
Latin letters or digits, or has the same name as another (or as "Other") fails
the build.

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

See [Deploying a songbook](deploy.md) for hosting the built `dist/`.
