import type { SongbookConfig } from './songbook.ts';

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  locale: string;
  /** Override `--color-*` custom properties (key without the prefix). */
  theme?: Record<string, string>;
  /** Same, applied in dark mode (forced or via prefers-color-scheme). */
  themeDark?: Record<string, string>;
  /** Footer line; omitted entirely when unset, linked when `href` is given. */
  footer?: { text: string; href?: string };
  /** Named song selections the reader can switch between. */
  songbooks?: SongbookConfig[];
}
