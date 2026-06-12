#!/usr/bin/env node
// @ts-check
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The package root is one level up from this bin/ directory. Astro is pointed
// here as its `root` so it loads the bundled astro.config.mjs, src/, etc.
const pkgRoot = fileURLToPath(new URL('..', import.meta.url));

const USAGE = `cantare — static songbook engine

Usage:
  cantare <command> [songsDir] [options]

Commands:
  build      Build the static site into the output directory (default)
  dev        Start the dev server
  preview    Serve the production build

Arguments:
  songsDir         Directory of .cho files (default: ./songs)

Options:
  -c, --config <file>   Site/theme config (default: ./cantare.config.json,
                        falling back to the engine's bundled default)
  -o, --out <dir>       Output directory (default: ./dist)
  -h, --help            Show this help
`;

/** @param {string[]} argv */
function parseArgs(argv) {
  /** @type {{ command: string, songsDir?: string | undefined, config?: string | undefined, out?: string | undefined, help?: boolean }} */
  const opts = { command: 'build' };
  const positional = [];
  let command = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === undefined) continue;
    if (arg === '-h' || arg === '--help') opts.help = true;
    else if (arg === '-c' || arg === '--config') opts.config = argv[++i];
    else if (arg.startsWith('--config=')) opts.config = arg.slice('--config='.length);
    else if (arg === '-o' || arg === '--out') opts.out = argv[++i];
    else if (arg.startsWith('--out=')) opts.out = arg.slice('--out='.length);
    else if (command === null) command = arg;
    else positional.push(arg);
  }
  if (command) opts.command = command;
  opts.songsDir = positional[0];
  return opts;
}

const opts = parseArgs(process.argv.slice(2));

if (opts.help) {
  process.stdout.write(USAGE);
  process.exit(0);
}

const cwd = process.cwd();
const songsDir = path.resolve(cwd, opts.songsDir ?? 'songs');
const outDir = path.resolve(cwd, opts.out ?? 'dist');

// Config resolution: an explicit --config is honored as given; otherwise prefer
// the consumer's ./cantare.config.json and fall back to the engine default.
const defaultConfig = path.join(pkgRoot, 'site.config.json');
let configPath;
if (opts.config) {
  configPath = path.resolve(cwd, opts.config);
} else {
  const consumerConfig = path.resolve(cwd, 'cantare.config.json');
  configPath = existsSync(consumerConfig) ? consumerConfig : defaultConfig;
}

process.env.CANTARE_SONGS_DIR = songsDir;
process.env.CANTARE_CONFIG = configPath;
process.env.CANTARE_OUT_DIR = outDir;

const astro = await import('astro');
const inlineConfig = { root: pkgRoot };

switch (opts.command) {
  case 'build':
    await astro.build(inlineConfig);
    break;
  case 'dev':
    await astro.dev(inlineConfig);
    break;
  case 'preview':
    await astro.preview(inlineConfig);
    break;
  default:
    process.stderr.write(`Unknown command: ${opts.command}\n\n${USAGE}`);
    process.exit(1);
}
