// @ts-check
import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

// GLIMPSE layers (https://glimpse.fancysnake.dev/). A layer is declared by
// path; the flat modules in src/lib/ belong to none until they move into one.

const EDGES = {
  regex: 'astro\\.config',
  message: 'Nothing imports edges.',
};
const FRAMEWORK = {
  regex: '^(astro:|virtual:|node:|astro(/(?!zod$)|$))',
  message:
    'pacts, specs and mills run without the framework and Node; astro/zod is the one exemption.',
};
const GATES_REACH = {
  regex: '(^|/)lib/(mills|links|specs)(\\.ts)?(/|$)',
  message: 'Gates import pacts as their only layer.',
};

/**
 * Bans every import that climbs out of a layer folder, except into `allowed`.
 * shortcut: `../` between a layer's own subfolders is banned too, switch to a
 * resolver-based rule when a layer needs it.
 * @param {string} message
 * @param {...string} allowed regex source, matched right after the last `../`
 */
const climbsOut = (message, ...allowed) => ({
  regex: `^(\\.\\./)+(?!${['\\.\\./', ...allowed].join('|')})`,
  message,
});
const PACTS = 'pacts(/|$)';
const SPECS = 'specs(\\.ts)?$';

/**
 * @param {string[]} files
 * @param {...{ regex: string, message: string }} patterns
 * @returns {import('eslint').Linter.Config}
 */
const layer = (files, ...patterns) => ({
  files,
  // Checks sit next to the code they assert and may import across layers.
  ignores: ['**/*.check.ts'],
  rules: {
    'no-restricted-imports': ['error', { patterns: [EDGES, ...patterns] }],
  },
});

const layers = [
  layer(['src/lib/pacts/**'], FRAMEWORK, climbsOut('pacts imports no other project code.')),
  layer(['src/lib/specs.ts'], FRAMEWORK, {
    regex: '^\\.\\.?/',
    message: 'specs imports no project code.',
  }),
  layer(
    ['src/lib/mills/**'],
    FRAMEWORK,
    climbsOut('mills import pacts and specs only.', PACTS, SPECS),
  ),
  layer(['src/lib/links/**'], climbsOut('links import pacts only.', PACTS)),
  layer(['src/pages/**', 'src/layouts/**', 'src/components/**', 'bin/**'], GATES_REACH),
  layer(['src/lib/inits.ts']),
  layer(['astro.config.mjs'], {
    regex: '^\\.\\.?/',
    message: 'edges imports no project code.',
  }),
];

export default defineConfig(
  { ignores: ['dist/', 'site/', '.astro/'] },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  astro.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Numbers stringify deterministically; the SVG renderer interpolates
      // coordinates in nearly every line.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    // Node entry points (the CLI and the Astro config) run in Node, not the
    // browser, so expose the Node globals they rely on.
    files: ['bin/**/*.js', 'astro.config.mjs'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly' },
    },
  },
  {
    // Type-aware linting is not supported inside .astro files and their
    // extracted <script> blocks; fall back to untyped rules there.
    files: ['**/*.astro', '**/*.astro/*.ts', '**/*.astro/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  ...layers,
);
