import { Config } from './config';

interface MongoCredentials {
  user: string;
  password: string;
}

export function getAuthFromConfig(config: Config): MongoCredentials | undefined {
  if (config.username && config.password) {
    return { user: config.username, password: config.password };
  }

  return undefined;
}
