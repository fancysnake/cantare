// @ts-check
import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://cantare.example.com',
  integrations: [pagefind()],
});
