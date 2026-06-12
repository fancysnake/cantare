// @ts-check
import { createReadStream, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
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

// astro-pagefind's dev middleware serves `/pagefind/` from `<viteRoot>/dist`,
// where viteRoot is Astro's `root` — the engine package dir on the installable
// path. But the build writes the index to CANTARE_OUT_DIR (the consumer's
// dist), so dev 404s every Pagefind asset and search fails to load. This
// integration serves `/pagefind/` from CANTARE_OUT_DIR; registered before
// pagefind(), it shadows that broken dev serving (pagefind() stays for its
// build-time index generation). Clone/dev is unchanged: there CANTARE_OUT_DIR
// resolves to the same repo `./dist`.
/** @type {Record<string, string>} */
const PAGEFIND_MIME = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
};

/** @returns {import('astro').AstroIntegration} */
function pagefindDevServer() {
  const outDir = path.resolve(process.env.CANTARE_OUT_DIR ?? './dist');
  return {
    name: 'cantare-pagefind-dev',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          const url = req.url;
          if (!url?.startsWith('/pagefind/')) {
            next();
            return;
          }
          const urlPath = decodeURIComponent(url.split('?')[0] ?? '');
          const filePath = path.join(outDir, urlPath);
          const rel = path.relative(outDir, filePath);
          let stat;
          try {
            stat = statSync(filePath);
          } catch {
            stat = undefined;
          }
          if (rel.startsWith('..') || path.isAbsolute(rel) || !stat?.isFile()) {
            next();
            return;
          }
          const ext = path.extname(filePath);
          res.setHeader('Content-Type', PAGEFIND_MIME[ext] ?? 'application/octet-stream');
          res.setHeader('Content-Length', stat.size);
          createReadStream(filePath).pipe(res);
        });
      },
    },
  };
}

export default defineConfig({
  site: config.url,
  outDir: process.env.CANTARE_OUT_DIR ?? './dist',
  integrations: [pagefindDevServer(), pagefind()],
  vite: {
    plugins: [cantareConfigPlugin()],
  },
  redirects: {
    '/search/': '/',
  },
});
