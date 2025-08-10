import fs from 'node:fs';
import path from 'node:path';

export function isPathExists(p: string) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

export function nextAvailableDirName(dir: string, baseName: string): string {
  if (!isPathExists(path.join(dir, baseName))) return baseName;
  let i = 1;
  while (isPathExists(path.join(dir, `${baseName}_${i}`))) i++;
  return `${baseName}_${i}`;
}

export function nextAvailableFileName(dir: string, fileName: string): string {
  const ext = path.extname(fileName);
  const name = path.basename(fileName, ext);
  if (!isPathExists(path.join(dir, fileName))) return fileName;
  let i = 1;
  while (isPathExists(path.join(dir, `${name}_${i}${ext}`))) i++;
  return `${name}_${i}${ext}`;
}
