import path from 'path';
import { asyncGlob } from '../helpers/async-glob';
import { Migration } from '../types/migration';

export async function findMigrations(where: string[]): Promise<Migration[]> {
  let migrationFiles: string[] = [];
  for (const pattern of where) {
    const matchedFiles = await asyncGlob(pattern);
    migrationFiles = migrationFiles.concat(matchedFiles);
  }

  return migrationFiles.map(migrationFromFile);
}

function migrationFromFile(filename: string): Migration {
  return {
    filename,
    filepath: path.resolve(process.cwd(), filename),
    name: path.basename(filename).replace(/\.[^/.]+$/, '')
  };
}
