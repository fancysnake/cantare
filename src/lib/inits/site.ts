/*
 * The site config and the UI strings in its locale. The config is a baked-in
 * literal, so this module runs in the build and in the browser.
 */
import { site } from '../links/config/virtual';
import { strings } from '../mills/i18n';

export { site };

export const { locale, t } = strings(site.locale);
