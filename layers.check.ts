/**
 * Self-check for the GLIMPSE layer rules in eslint.config.js. Most layers hold
 * no code yet, so `mise run lint` passes whatever their rules say. This lints
 * import lines inside a throwaway tree that has every layer in both shapes.
 * Run it with `node layers.check.ts`.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { stdout } from 'node:process';
import { Linter } from 'eslint';
import { layers } from './eslint.config.js';

const MODULES = [
  ...['pacts', 'specs', 'mills', 'links', 'inits'].flatMap((name) => [
    `src/lib/${name}.ts`,
    `src/lib/${name}/a.ts`,
    `src/lib/${name}/b.ts`,
  ]),
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
  ['src/lib/mills/a.ts', "import '../../lib/pacts';", false],
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
  ['src/pages/p.ts', "import '../lib/pacts/a';", false],
  ['src/pages/p.ts', "import '../lib/flat';", false],
  ['src/pages/p.ts', "import '../lib/mills';", true],
  ['src/pages/p.ts', "import '../lib/specs/a';", true],
  ['src/pages/p.ts', "import '../lib/inits';", true],
  ['src/components/c.ts', "await import('../lib/links');", true],
  ['bin/b.js', "await import('astro');", false],
  ['bin/b.js', "import '../src/lib/links/a';", true],
  ['src/lib/flat.ts', "import '../../astro.config.mjs';", true],
  ['astro.config.mjs', "import './src/lib/flat';", true],
];

const root = mkdtempSync(join(tmpdir(), 'layers-'));
try {
  for (const module of MODULES) {
    mkdirSync(dirname(join(root, module)), { recursive: true });
    writeFileSync(join(root, module), '');
  }
  const linter = new Linter({ cwd: root });
  const config = [{ files: ['**/*.ts', '**/*.js', '**/*.mjs'] }, ...layers(root)];
  for (const [file, code, banned] of CASES) {
    const messages = linter.verify(code, config, join(root, file));
    // A parse error or a bad zone also reports, and would pass as a ban.
    assert.deepEqual(
      messages.filter(
        (m) => m.ruleId === null || ['path', 'glob', 'mixedGlob'].includes(m.messageId ?? ''),
      ),
      [],
      `${file}: ${code}`,
    );
    assert.equal(
      messages.length > 0,
      banned,
      `${file}: ${code} should be ${banned ? 'banned' : 'allowed'}`,
    );
  }
} finally {
  rmSync(root, { recursive: true, force: true });
}

stdout.write('layer checks passed\n');
