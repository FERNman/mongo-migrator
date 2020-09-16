import glob from 'glob';

export function asyncGlob(pattern: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(pattern, (err, files) => {
      if (err) {
        reject(err);
      }

      resolve(files);
    });
  });
}
