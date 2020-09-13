import { Config } from './config';

export function getUrlFromConfig(config: Config): string {
  if (config.url) {
    return config.url;
  }

  return `${config.host}:${config.port}`;
}
