// @ts-check
import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default defineConfig(
  { ignores: ['dist/', '.astro/'] },
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
    // Type-aware linting is not supported inside .astro files and their
    // extracted <script> blocks; fall back to untyped rules there.
    files: ['**/*.astro', '**/*.astro/*.ts', '**/*.astro/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
