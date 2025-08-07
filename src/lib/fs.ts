import * as fs from 'node:fs';
import * as path from 'node:path';
import { confirm } from '@clack/prompts';
import { DownloadOptions, ParsedUrl } from '../types/index.js';
import { createFileSystemError } from './errors.js';

import { info } from './logger.js';

export async function verifyOutputDir(outDir: string, force = false): Promise<boolean> {
  try {
    const absOutDir = path.resolve(outDir);

    try {
      await fs.promises.mkdir(outDir, { recursive: true });
    } catch (err) {
      throw createFileSystemError(`Failed to create directory: ${outDir}`, outDir);
    }

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
