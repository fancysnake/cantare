// @ts-check
import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';
import site from './site.config.json' with { type: 'json' };

export default defineConfig({
  site: site.url,
  integrations: [pagefind()],
  redirects: {
    '/search/': '/',
  },
});
