import glob from 'glob';
import { Migration } from './migration';

export async function loadMigrations(from: string[]): Promise<Migration[]> {
  let migrationFiles: string[] = [];
  for (const pattern of from) {
    const matchedFiles = await asyncGlob(pattern);
    migrationFiles = migrationFiles.concat(matchedFiles);
  }

  return Promise.all(migrationFiles.map(file => Migration.fromFile(file)));
}

function asyncGlob(pattern: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(pattern, (err, files) => {
      if (err) {
        reject(err);
      }

      resolve(files);
    });
  });
}
