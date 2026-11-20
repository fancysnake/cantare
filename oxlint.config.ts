import type { DummyRuleMap, OxlintOverride } from 'oxlint';

import { builtinModules } from 'node:module';
import { defineConfig } from 'oxlint';

// GLIMPSE layers (https://glimpse.fancysnake.dev/). A layer is declared by
// path; the flat modules in src/lib/ belong to none until they move into one.
// oxlint sees an import as text, not as a resolved path, so a rule bans the
// `../` steps that leave the layer and re-allows the layers it may import.
// Its regex engine has no lookahead and skips such a pattern without an error.

/** Each layer and the layers it may import besides itself. */
const LAYERS: Record<string, string[]> = {
  pacts: [],
  specs: [],
  mills: ['pacts', 'specs'],
  links: ['pacts'],
};
/** Layers that run without the framework and Node. */
const PURE = new Set(['pacts', 'specs', 'mills']);
const GATES = ['src/pages/**', 'src/layouts/**', 'src/components/**', 'bin/**'];

type Pattern = { message: string } & ({ regex: string } | { group: string[] });

const BUILTINS = builtinModules.filter((name) => !/[:/]/.test(name)).join('|');
const FRAMEWORK_MESSAGE =
  'pacts, specs and mills run without the framework and Node; astro/zod is the one exemption.';
const FRAMEWORK: Pattern[] = [
  {
    regex: `^(astro:|virtual:|node:|@astrojs/|astro-|astro$|(${BUILTINS})(/|$))`,
    message: FRAMEWORK_MESSAGE,
  },
  { group: ['astro/**', '!astro/zod'], message: FRAMEWORK_MESSAGE },
];
const EDGES: Pattern = {
  regex: '(^|/)astro\\.config(\\.mjs)?$',
  message: 'Nothing imports edges.',
};
// A `./` before a `../` would slip past the groups below.
const DETOUR: Pattern = {
  regex: '^\\./\\.{1,2}/|/\\./',
  message: 'Write a relative import as its shortest path.',
};

const restrict = (files: string[], patterns: Pattern[]): OxlintOverride => ({
  files,
  rules: { 'no-restricted-imports': ['error', { patterns: [...patterns, DETOUR, EDGES] }] },
});

/**
 * Bans every import that reaches src/lib/ or above, but for the `allowed`
 * layers. `up` is the path from the importing file to src/lib/.
 */
const leaving = (allowed: string[], up: string, message: string): Pattern => ({
  group: [
    `${up}**`,
    ...(up === './' ? ['../**'] : []),
    ...allowed.flatMap((layer) => [`!${up}${layer}`, `!${up}${layer}.*`, `!${up}${layer}/**`]),
    // A `!` glob exempts the import from every pattern, so a detour through
    // an allowed layer is banned again here: the last glob that matches wins.
    `${up}*/**/../**`,
    `${up}*/**/./**`,
  ],
  message,
});

// When two overrides match a file, the later one replaces the rule.
const layerOverrides = Object.entries(LAYERS).flatMap(([name, others]) => {
  const pure = PURE.has(name) ? FRAMEWORK : [];
  const allowed = [name, ...others];
  const message = others.length
    ? `${name} imports ${others.join(' and ')} only.`
    : `${name} imports no other project code.`;
  return [
    restrict(
      [`src/lib/${name}/**`],
      [
        {
          group: ['../**'],
          message: `${name} is checked two folders deep; nest no deeper, or extend the layer rules.`,
        },
        ...pure,
      ],
    ),
    // The module shape sits in src/lib/ itself, so its siblings are the other layers.
    restrict([`src/lib/${name}.ts`], [leaving(others, './', message), ...pure]),
    restrict([`src/lib/${name}/*`], [leaving(allowed, '../', message), ...pure]),
    restrict([`src/lib/${name}/*/*`], [leaving(allowed, '../../', message), ...pure]),
  ];
});

/**
 * The typescript-eslint strict and stylistic type-checked rules that the
 * categories below leave off.
 */
const STRICT = [
  'adjacent-overload-signatures',
  'array-type',
  'ban-ts-comment',
  'ban-tslint-comment',
  'class-literal-property-style',
  'consistent-generic-constructors',
  'consistent-indexed-object-style',
  'consistent-type-assertions',
  'consistent-type-definitions',
  'dot-notation',
  'no-confusing-void-expression',
  'no-deprecated',
  'no-dynamic-delete',
  'no-empty-object-type',
  'no-explicit-any',
  'no-inferrable-types',
  'no-invalid-void-type',
  'no-misused-promises',
  'no-mixed-enums',
  'no-namespace',
  'no-non-null-assertion',
  'no-require-imports',
  'no-unnecessary-condition',
  'no-unsafe-argument',
  'no-unsafe-assignment',
  'no-unsafe-call',
  'no-unsafe-function-type',
  'no-unsafe-member-access',
  'no-unsafe-return',
  'non-nullable-type-assertion-style',
  'only-throw-error',
  'prefer-find',
  'prefer-for-of',
  'prefer-function-type',
  'prefer-includes',
  'prefer-literal-enum-member',
  'prefer-nullish-coalescing',
  'prefer-optional-chain',
  'prefer-promise-reject-errors',
  'prefer-regexp-exec',
  'prefer-string-starts-ends-with',
  'related-getter-setter-pairs',
  'require-await',
  'restrict-plus-operands',
  'return-await',
  'use-unknown-in-catch-callback-variable',
];

/** The layer rules alone, so `layers.check.ts` can lint a throwaway tree with them. */
export const layers: { rules: DummyRuleMap; overrides: OxlintOverride[] } = {
  rules: { 'no-restricted-imports': ['error', { patterns: [EDGES] }] },
  overrides: [
    ...layerOverrides,
    // Exemption: gates import mills. No inits layer exists yet, so gates
    // compose mills directly.
    restrict(GATES, [
      {
        regex: '^\\.{1,2}/(.*/)?lib/(links|specs|inits)(\\.[jt]s)?(/|$)',
        message: 'Gates import pacts and mills only.',
      },
    ]),
    restrict(
      ['astro.config.mjs'],
      [{ regex: '^\\.{1,2}/(.*/)?(src|bin)(/|$)', message: 'edges imports no project code.' }],
    ),
    // Checks sit next to the code they assert and may import across layers.
    { files: ['**/*.check.ts'], rules: { 'no-restricted-imports': 'off' } },
  ],
};

export default defineConfig({
  plugins: ['typescript', 'unicorn', 'oxc', 'import'],
  categories: { correctness: 'error', suspicious: 'error', perf: 'warn' },
  options: { typeAware: true, denyWarnings: true, reportUnusedDisableDirectives: 'error' },
  env: { browser: true, node: true, es2024: true },
  ignorePatterns: ['dist', 'site', '.astro'],
  rules: {
    ...layers.rules,
    ...Object.fromEntries(STRICT.map((rule) => [`typescript/${rule}`, 'error'])),
    'no-empty-function': 'error',
    // A stylesheet is imported for its effect alone.
    'import/no-unassigned-import': 'off',
    // The waits in the client scripts are sequential by intent.
    'no-await-in-loop': 'off',
    // JSON.parse returns `any`, and the two places that read JSON assert its shape.
    'typescript/no-unsafe-type-assertion': 'off',
    // Numbers stringify deterministically; the SVG renderer interpolates
    // coordinates in nearly every line.
    'typescript/restrict-template-expressions': ['error', { allowNumber: true }],
  },
  overrides: layers.overrides,
});
