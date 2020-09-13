import glob from 'glob';
import path from 'path';

export async function getMigrationFiles(files: string[]): Promise<string[]> {
  let migrationFiles: string[] = [];
  for (const pattern of files) {
    const matchedFiles = await asyncGlob(pattern);
    migrationFiles = migrationFiles.concat(matchedFiles);
  }

  return migrationFiles.map(file => path.resolve(process.cwd(), file));
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
