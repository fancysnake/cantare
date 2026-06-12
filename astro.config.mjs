// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';

// astro.config runs in Node at build start, so reading the config off disk is
// safe here. The CLI points CANTARE_CONFIG at the consumer's config; the
// clone/dev path falls back to the engine's bundled default next to this file.
const configPath = process.env.CANTARE_CONFIG ?? new URL('./site.config.json', import.meta.url);
// JSON.parse is inherently `any`; the cast types the fields we read from it.
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const config = /** @type {{ url: string }} */ (JSON.parse(readFileSync(configPath, 'utf-8')));

// Expose the resolved config as a baked-in literal via a virtual module, so it
// is safe to import from both Node-side and browser-side bundles.
function cantareConfigPlugin() {
  const virtualId = 'virtual:cantare-config';
  const resolvedId = '\0' + virtualId;
  return {
    name: 'cantare-config',
    /** @param {string} id */
    resolveId(id) {
      if (id === virtualId) return resolvedId;
      return undefined;
    },
    /** @param {string} id */
    load(id) {
      if (id === resolvedId) return `export default ${JSON.stringify(config)};`;
      return undefined;
    },
  };
}

export default defineConfig({
  site: config.url,
  outDir: process.env.CANTARE_OUT_DIR ?? './dist',
  integrations: [pagefind()],
  vite: {
    plugins: [cantareConfigPlugin()],
  },
  redirects: {
    '/search/': '/',
  },
});
