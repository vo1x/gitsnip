import * as fs from 'node:fs';
import * as path from 'node:path';
import { createFileSystemError } from './errors.js';
import { confirm } from '@clack/prompts';
import { DownloadOptions, ParsedUrl } from '../types/index.js';

import { info } from './logger.js';

export async function verifyOutputDir(outDir: string, force = false): Promise<boolean> {
  try {
    const absOutDir = path.resolve(outDir);

    await fs.promises.mkdir(absOutDir, { recursive: true });

    const files = await fs.promises.readdir(absOutDir);
    if (files.length === 0) return true;

    if (force) {
      info(`--force flag used. Overwriting contents of "${absOutDir}".`);
      return true;
    }

    const response = await confirm({
      message: `Directory "${absOutDir}" is not empty. Overwrite its contents?`,
      initialValue: false,
    });
    return response === true;
  } catch (err) {
    return false;
  }
}

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

export function resolveOutputPath(
  parsed: ParsedUrl,
  options: DownloadOptions,
  repoArg: string
): string {
  if (options.out) return path.resolve(process.cwd(), options.out);

  if (parsed.type === 'blob' || repoArg.includes('/blob/')) {
    return path.resolve(process.cwd(), '.');
  }

  return path.resolve(process.cwd(), parsed.repo);
}
