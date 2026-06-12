import config from 'virtual:cantare-config';

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  locale: string;
  /** Override `--color-*` custom properties (key without the prefix). */
  theme?: Record<string, string>;
  /** Same, applied in dark mode (forced or via prefers-color-scheme). */
  themeDark?: Record<string, string>;
}

export const site: SiteConfig = config;

const PREFIX = '--color-';

function declarations(vars: Record<string, string> | undefined): string {
  if (!vars) return '';
  return Object.entries(vars)
    .map(([key, value]) => `${PREFIX}${key}: ${value};`)
    .join(' ');
}

/**
 * CSS that overrides the default palette from `site.theme` / `site.themeDark`.
 *
 * Selectors mirror global.css but are repeated (`:root:root`) to raise their
 * specificity one notch above the engine defaults, so overrides win regardless
 * of where Astro hoists this inline <style> relative to the bundled stylesheet.
 * The dark blocks out-specify the light block too, so a `themeDark` value wins
 * in dark mode while a light-only override leaves the engine's dark default
 * standing. Returns an empty string when no overrides are configured.
 */
export function themeCss(): string {
  const light = declarations(site.theme);
  const dark = declarations(site.themeDark);
  const blocks: string[] = [];
  if (light) blocks.push(`:root:root { ${light} }`);
  if (dark) {
    blocks.push(
      `@media (prefers-color-scheme: dark) { :root:root:not([data-theme='light']) { ${dark} } }`,
    );
    blocks.push(`:root:root[data-theme='dark'] { ${dark} }`);
  }
  return blocks.join('\n');
}
