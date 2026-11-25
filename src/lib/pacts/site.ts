import { z } from 'astro/zod';

import { slugify } from './slug.ts';
import { OTHER, songbookSchema } from './songbook.ts';

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
  songbooks: z
    .array(songbookSchema)
    .superRefine((songbooks, context) => {
      // Two songbooks with one slug would share a switcher choice and a `?songbook=` link.
      const seen = new Set([OTHER]);
      for (const [index, { name }] of songbooks.entries()) {
        const slug = slugify(name);
        if (seen.has(slug)) {
          context.addIssue({
            code: 'custom',
            path: [index, 'name'],
            message: `"${name}" clashes with another songbook (or the built-in "${OTHER}")`,
          });
        }
        seen.add(slug);
      }
    })
    .optional(),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
