/**
 * Self-check for the GLIMPSE layer rules in oxlint.config.ts. A layer that
 * holds no code passes `mise run lint` whatever its rule says. This lints
 * import lines inside a throwaway tree that has every layer in both shapes.
 * Run it with `node layers.check.ts`.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { stdout } from 'node:process';

import { layers } from './oxlint.config.ts';

const OXLINT = join(import.meta.dirname, 'node_modules/.bin/oxlint');

const MODULES = [
  ...['pacts', 'specs', 'mills', 'links', 'inits'].flatMap((name) => [
    `src/lib/${name}.ts`,
    `src/lib/${name}/a.ts`,
    `src/lib/${name}/b.ts`,
  ]),
  'src/lib/links/sub/a.ts',
  'src/lib/links/sub/deep/a.ts',
  'src/lib/flat.ts',
  'bin/cantare.js',
  'astro.config.mjs',
];

/** [importing file, import line, banned] */
const CASES: [string, string, boolean][] = [
  ['src/lib/pacts/a.ts', "import './b';", false],
  ['src/lib/pacts/a.ts', "import 'astro/zod';", false],
  ['src/lib/pacts/a.ts', "import '../specs';", true],
  ['src/lib/pacts/a.ts', "import '../flat';", true],
  ['src/lib/pacts/a.ts', "import '../../../bin/cantare.js';", true],
  ['src/lib/pacts/a.ts', "import 'node:fs';", true],
  ['src/lib/pacts/a.ts', "import 'fs/promises';", true],
  ['src/lib/pacts/a.ts', "import 'astro';", true],
  ['src/lib/pacts/a.ts', "import 'astro/config';", true],
  ['src/lib/pacts/a.ts', "import '../pacts/../flat';", true],
  ['src/lib/pacts/a.ts', "import 'astro:content';", true],
  ['src/lib/pacts/a.ts', "import 'virtual:cantare-config';", true],
  ['src/lib/pacts/a.ts', "import '@astrojs/mdx';", true],
  ['src/lib/pacts/a.ts', "import 'astro-pagefind';", true],
  ['src/lib/pacts/a.ts', "await import('node:fs');", true],
  ['src/lib/pacts.ts', "import './flat';", true],
  ['src/lib/specs.ts', "import './pacts';", true],
  ['src/lib/specs.ts', "import 'path';", true],
  ['src/lib/specs/a.ts', "import './b';", false],
  ['src/lib/mills/a.ts', "import '../pacts';", false],
  ['src/lib/mills/a.ts', "import '../pacts/a';", false],
  ['src/lib/mills/a.ts', "import '../../lib/pacts';", true],
  ['src/lib/mills/a.ts', "export * from '../links/a';", true],
  ['src/lib/links/sub/a.ts', "import '../b';", false],
  ['src/lib/links/sub/a.ts', "import './b';", false],
  ['src/lib/links/sub/a.ts', "import '../../pacts/a';", false],
  ['src/lib/links/sub/a.ts', "import '../../links/b';", false],
  ['src/lib/links/sub/a.ts', "import '../pacts';", false],
  ['src/lib/links/sub/a.ts', "import '../../mills/a';", true],
  ['src/lib/links/sub/a.ts', "import '../../flat';", true],
  ['src/lib/links/sub/a.ts', "import '.././../flat';", true],
  ['src/lib/links/sub/a.ts', "import '../../../pages/p';", true],
  ['src/lib/links/sub/deep/a.ts', "import '../../../pacts/a';", true],
  ['src/lib/links/sub/deep/a.ts', "import './b';", false],
  ['src/lib/flat.ts', "import './links/a';", false],
  ['src/lib/mills/a.ts', "import '../specs/a';", false],
  ['src/lib/mills/a.ts', "import '../mills/b';", false],
  ['src/lib/mills/a.ts', "import '../links';", true],
  ['src/lib/mills/a.ts', "import './../flat';", true],
  ['src/lib/mills/a.ts', "await import('../links/a');", true],
  ['src/lib/mills/a.ts', "import '../links/a.js';", true],
  ['src/lib/mills/a.ts', "import '../pacts/a.js';", false],
  ['src/lib/mills/a.ts', "await import('astro:content');", true],
  ['src/lib/mills.ts', "import './specs';", false],
  ['src/lib/mills.ts', "import './inits';", true],
  ['src/lib/mills/a.check.ts', "import '../links';", false],
  ['src/lib/links/a.ts', "import '../pacts';", false],
  ['src/lib/links/a.ts', "import 'node:fs';", false],
  ['src/lib/links/a.ts', "import '../mills';", true],
  ['src/lib/inits.ts', "import './mills';", false],
  ['src/lib/inits.ts', "import '../../astro.config.mjs';", true],
  ['src/lib/inits/a.ts', "import '../links/a';", false],
  ['src/lib/inits/a.ts', "import 'astro:content';", false],
  ['src/lib/inits/a.ts', "import '../flat';", true],
  ['src/lib/inits/a.ts', "import '../../pages/p';", true],
  ['src/pages/p.ts', "import '../lib/pacts/a';", false],
  ['src/pages/p.ts', "import '../lib/inits';", false],
  ['src/pages/p.ts', "import '../lib/inits/a';", false],
  ['src/pages/p.ts', "import '../components/c';", false],
  ['src/pages/p.ts', "import '../lib/flat';", true],
  ['src/pages/p.ts', "import '../lib/mills';", true],
  ['src/pages/p.ts', "import '../lib/specs/a';", true],
  ['src/pages/p.ts', "import '../lib/inits/../mills/a';", true],
  ['src/pages/p.ts', "export { getCollection } from 'astro:content';", true],
  ['src/pages/p.ts', "export type { CollectionEntry } from 'astro:content';", false],
  ['src/pages/sub/p.ts', "import '../../lib/inits/a';", false],
  ['src/pages/sub/p.ts', "import '../../lib/mills/a';", true],
  ['src/pages/sub/p.ts', "import '../../lib/flat';", true],
  ['src/components/c.ts', "import '../lib/inits/a';", false],
  ['src/components/c.ts', "import '../lib/mills/a';", true],
  ['src/layouts/l.ts', "import '../lib/flat';", true],
  ['src/content.config.ts', "import './lib/inits/a';", false],
  ['src/content.config.ts', "export { defineCollection } from 'astro:content';", false],
  ['src/content.config.ts', "import './lib/links/a';", true],
  ['src/content.config.ts', "import './lib/flat';", true],
  ['src/components/c.ts', "await import('../lib/links');", true],
  ['bin/b.js', "await import('astro');", false],
  ['bin/b.js', "import '../src/lib/links/a';", true],
  ['src/lib/flat.ts', "import '../../astro.config.mjs';", true],
  ['astro.config.mjs', "import './src/lib/flat';", true],
];

const root = mkdtempSync(join(tmpdir(), 'layers-'));
try {
  const write = (file: string, code: string) => {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), code);
  };
  for (const module of MODULES) write(module, '');
  writeFileSync(join(root, '.oxlintrc.json'), JSON.stringify(layers));
  for (const [file, code, banned] of CASES) {
    write(file, code);
    const { stdout: report } = spawnSync(OXLINT, ['--format', 'json', file], {
      cwd: root,
      encoding: 'utf8',
    });
    write(file, '');
    // A parse error or a bad config is not JSON, or reports under another
    // rule; either would pass as a ban.
    const { diagnostics } = JSON.parse(report) as { diagnostics: { code: string }[] };
    assert.deepEqual(
      diagnostics.filter((d) => d.code !== 'eslint(no-restricted-imports)'),
      [],
      `${file}: ${code}`,
    );
    assert.equal(
      diagnostics.length > 0,
      banned,
      `${file}: ${code} should be ${banned ? 'banned' : 'allowed'}`,
    );
  }
} finally {
  rmSync(root, { recursive: true, force: true });
}

stdout.write('layer checks passed\n');
