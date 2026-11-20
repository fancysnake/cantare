import type { SongLink, SongMeta } from '../pacts/song';

import { slugify } from '../pacts/slug';

/**
 * Every internal link in the site, as a finished href under `base`.
 *
 * Routes and the links pointing at them have to agree on both the slug and the
 * `CANTARE_BASE` prefix, and neither is checkable by the compiler — a hand-written
 * `href="/songs/foo/"` type-checks and lints, then breaks under a sub-path. So
 * templates never build a path: `[slug].astro` pages own the slug via
 * `getStaticPaths`, and these helpers own the link.
 */
export function routesFor(base: string) {
  const prefix = base.replace(/\/$/, '');
  /** For assets that have no route behind them (the Pagefind bundle). */
  const url = (path: string): string => `${prefix}${path}`;
  const songHref = (id: string): string => url(`/songs/${id}/`);
  return {
    url,
    homeHref: (): string => url('/'),
    songsHref: (): string => url('/songs/'),
    songHref,
    /** Where a song list points: a song with `{meta: redirect …}` opens that page in a new tab instead. */
    songLink: (song: { id: string; data: Pick<SongMeta, 'redirect'> }): SongLink =>
      song.data.redirect
        ? { href: song.data.redirect, target: '_blank' }
        : { href: songHref(song.id) },
    artistsHref: (): string => url('/artists/'),
    artistHref: (name: string): string => url(`/artists/${slugify(name)}/`),
    albumHref: (name: string): string => url(`/albums/${slugify(name)}/`),
    tagsHref: (): string => url('/tags/'),
    tagHref: (name: string): string => url(`/tags/${slugify(name)}/`),
    languagesHref: (): string => url('/languages/'),
    languageHref: (name: string): string => url(`/languages/${slugify(name)}/`),
  };
}
