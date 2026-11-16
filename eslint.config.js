// @ts-check
import { builtinModules } from 'node:module';
import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';

// GLIMPSE layers (https://glimpse.fancysnake.dev/). A layer is declared by
// path; the flat modules in src/lib/ belong to none until they move into one.

/** @type {Record<string, string[]>} each layer and the layers it may import besides itself */
const LAYERS = { pacts: [], specs: [], mills: ['pacts', 'specs'], links: ['pacts'] };
/** Layers that run without the framework and Node. */
const PURE = ['pacts', 'specs', 'mills'];
const GATES = ['src/pages', 'src/layouts', 'src/components', 'bin'];

/**
 * A layer is one module or a folder of them; both shapes, relative to src/.
 * @param {string} name
 */
const shapes = (name) => [`lib/${name}.ts`, `lib/${name}`];
/** @param {string[]} paths */
const inSrc = (paths) => paths.map((path) => `src/${path}`);

// `\x2F` stands for `/`, which an esquery regex cannot contain.
const BUILTINS = builtinModules.filter((name) => !/[:/]/.test(name)).join('|');
const FRAMEWORK = `^(astro:|virtual:|node:|@astrojs\\x2F|astro-|astro(\\x2F(?!zod$)|$)|(${BUILTINS})(\\x2F|$))`;
const FRAMEWORK_MESSAGE =
  'pacts, specs and mills run without the framework and Node; astro/zod is the one exemption.';

/**
 * @param {string} root the directory the layer paths are relative to
 * @returns {import('eslint').Linter.Config[]}
 */
export const layers = (root) => [
  {
    // Checks sit next to the code they assert and may import across layers.
    ignores: ['**/*.check.ts'],
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver-next': [
        createNodeResolver({
          extensions: ['.ts', '.js', '.mjs'],
          extensionAlias: { '.js': ['.ts', '.js'] },
        }),
      ],
    },
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          basePath: root,
          zones: [
            ...Object.entries(LAYERS).map(([name, allowed]) => ({
              target: inSrc(shapes(name)),
              from: ['src', 'bin'],
              except: [name, ...allowed].flatMap(shapes),
              message: allowed.length
                ? `${name} imports ${allowed.join(' and ')} only.`
                : `${name} imports no other project code.`,
            })),
            {
              target: GATES,
              from: inSrc(['mills', 'links', 'specs', 'inits'].flatMap(shapes)),
              message: 'Gates import pacts as their only layer.',
            },
            {
              target: 'astro.config.mjs',
              from: ['src', 'bin'],
              message: 'edges imports no project code.',
            },
            { target: '.', from: 'astro.config.mjs', message: 'Nothing imports edges.' },
          ],
        },
      ],
    },
  },
  {
    files: PURE.flatMap((name) => [`src/lib/${name}.ts`, `src/lib/${name}/**`]),
    ignores: ['**/*.check.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ regex: FRAMEWORK, message: FRAMEWORK_MESSAGE }] },
      ],
      'no-restricted-syntax': [
        'error',
        { selector: `ImportExpression[source.value=/${FRAMEWORK}/]`, message: FRAMEWORK_MESSAGE },
      ],
    },
  },
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
  layers(import.meta.dirname),
);
