import * as fs from 'node:fs';
import * as path from 'node:path';
import { createFileSystemError } from './errors.js';
import { confirm } from '@clack/prompts';

export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
  } catch {
    throw createFileSystemError(`Failed to create directory: ${dirPath}`, dirPath);
  }
}

export async function writeFileAtomic(filePath: string, data: ArrayBuffer): Promise<void> {
  const dir = path.dirname(filePath);
  const tempPath = `${filePath}.tmp`;

  try {
    await ensureDirectory(dir);
    await fs.promises.writeFile(tempPath, Buffer.from(data));
    await fs.promises.rename(tempPath, filePath);
  } catch {
    try {
      await fs.promises.unlink(tempPath);
    } catch {
      // ignore cleanup errors
    }
    throw createFileSystemError(`Failed to write file: ${filePath}`, filePath);
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function confirmOverwrite(filePath: string, force = false): Promise<boolean> {
  if (force || !(await fileExists(filePath))) {
    return true;
  }
  const result = await confirm({
    message: `File "${filePath}" already exists. Overwrite?`,
    initialValue: false,
  });
  return result === true;
}

export function resolveOutputPath(fileName: string, outputDir: string): string {
  if (outputDir === '.' || outputDir === './') {
    return path.join(process.cwd(), fileName);
  }
  if (path.isAbsolute(outputDir)) {
    return path.join(outputDir, fileName);
  }
  return path.join(process.cwd(), outputDir, fileName);
}
