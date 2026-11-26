/*
 * The config's songbooks, checked and turned into matchers. Build only. The
 * song loader and the page helpers both read them from here, so neither can see
 * an unchecked list.
 */
import { site } from '../links/config/virtual';
import { parseSiteConfig } from '../mills/config';
import { songbookMatchers } from '../mills/songbook';

export const songbooks = songbookMatchers(parseSiteConfig(site).songbooks);
