/**
 * Self-check for site config validation: a mistake the schema lets through
 * renders as `undefined` or as a silently missing field. Run it with
 * `node src/lib/mills/config.check.ts`.
 */
import assert from 'node:assert/strict';
import { stdout } from 'node:process';

import { parseSiteConfig } from './config.ts';

const site = { name: 'Site', description: 'Songs', url: 'https://example.org', locale: 'en' };

assert.deepEqual(parseSiteConfig(site), site);
// A misspelled key fails, whether the field it meant is required or optional.
assert.throws(() => parseSiteConfig({ ...site, name: undefined, nmae: 'Site' }), /"nmae"/);
assert.throws(() => parseSiteConfig({ ...site, themeDrak: {} }), /"themeDrak"/);
assert.throws(() => parseSiteConfig({ ...site, footer: { text: 'x', link: 'y' } }), /"link"/);
assert.throws(() => parseSiteConfig({ ...site, description: 7 }), /expected string/);
assert.throws(() => parseSiteConfig({ ...site, footer: 'x' }), /expected object/);

stdout.write('config checks passed\n');
