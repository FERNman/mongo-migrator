import { DatabaseConfig } from './database-config';

export interface Config {
  url?: string;
  host?: string;
  port?: string;
  username?: string;
  password?: string;
  authenticationDatabase?: string;
  databases: DatabaseConfig[];
}
