import { url } from './site';
import { slugify } from './slug';

/**
 * Every internal link in the site, as a finished href.
 *
 * Routes and the links pointing at them have to agree on both the slug and the
 * `CANTARE_BASE` prefix, and neither is checkable by the compiler — a hand-written
 * `href="/songs/foo/"` type-checks and lints, then breaks under a sub-path. So
 * templates never build a path: `[slug].astro` pages own the slug via
 * `getStaticPaths`, and these helpers own the link.
 */
export const homeHref = (): string => url('/');

export const songsHref = (): string => url('/songs/');
export const songHref = (id: string): string => url(`/songs/${id}/`);

export const artistsHref = (): string => url('/artists/');
export const artistHref = (name: string): string => url(`/artists/${slugify(name)}/`);

export const albumHref = (name: string): string => url(`/albums/${slugify(name)}/`);

export const tagsHref = (): string => url('/tags/');
export const tagHref = (name: string): string => url(`/tags/${slugify(name)}/`);

export const languagesHref = (): string => url('/languages/');
export const languageHref = (name: string): string => url(`/languages/${slugify(name)}/`);
