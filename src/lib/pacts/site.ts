import { z } from 'astro/zod';

import { songbooksSchema } from './songbook.ts';

const colors = z.record(z.string(), z.string());

/** The site config file. An unknown key is an error, so a misspelled optional field cannot pass as absent. */
export const siteConfigSchema = z.strictObject({
  name: z.string(),
  description: z.string(),
  url: z.string(),
  locale: z.string(),
  /** Override `--color-*` custom properties (key without the prefix). */
  theme: colors.optional(),
  /** Same, applied in dark mode (forced or via prefers-color-scheme). */
  themeDark: colors.optional(),
  /** Footer line; omitted entirely when unset, linked when `href` is given. */
  footer: z.strictObject({ text: z.string(), href: z.string().optional() }).optional(),
  /** Named song selections the reader can switch between. */
  songbooks: songbooksSchema.optional(),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
