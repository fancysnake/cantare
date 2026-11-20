import { defineCollection } from 'astro:content';

import { loadSongs, songSchema } from './lib/inits/content';

export const collections = {
  songs: defineCollection({ loader: loadSongs, schema: songSchema }),
};
