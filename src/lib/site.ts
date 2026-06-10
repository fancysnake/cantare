import config from '../../site.config.json';

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
}

export const site: SiteConfig = config;
