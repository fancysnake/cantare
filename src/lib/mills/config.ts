import { z } from 'astro/zod';

import { siteConfigSchema, type SiteConfig } from '../pacts/site.ts';

/** Validate the site config; a mistake fails the build rather than rendering `undefined` or matching no songs. */
export function parseSiteConfig(config: unknown): SiteConfig {
  const result = siteConfigSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid site config:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
