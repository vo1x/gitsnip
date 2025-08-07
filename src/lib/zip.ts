import fs from 'node:fs';
import path from 'node:path';
import yazl from 'yazl';

export async function zipDirectory(srcDir: string, outZipFile: string): Promise<void> {
  const zipfile = new yazl.ZipFile();

  function addDir(dir: string, base = '') {
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item);
      const relPath = path.join(base, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        addDir(fullPath, relPath);
      } else {
        zipfile.addFile(fullPath, relPath);
      }
    }
  }

  addDir(srcDir);

  await new Promise<void>((resolve, reject) => {
    zipfile.outputStream
      .pipe(fs.createWriteStream(outZipFile))
      .on('close', resolve)
      .on('error', reject);
    zipfile.end();
  });
}