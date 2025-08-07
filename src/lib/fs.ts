import * as fs from 'node:fs';
import * as path from 'node:path';
import { confirm } from '@clack/prompts';
import { DownloadOptions, ParsedUrl } from '../types/index.js';
import { createFileSystemError } from './errors.js';

import { info } from './logger.js';

export async function verifyOutputTarget(
  outPath: string,
  force = false,
  fileName?: string 
): Promise<boolean> {
  try {
    const absPath = path.resolve(outPath);

    if (fileName) {
      await fs.promises.mkdir(absPath, { recursive: true });
      const filePath = path.join(absPath, fileName);
      const fileExists = fs.existsSync(filePath);
      
      if (!fileExists) return true;

      if (force) {
        info(`--force flag used. Overwriting file "${filePath}".`);
        return true;
      }

      const response = await confirm({
        message: `File "${filePath}" exists. Overwrite?`,
        initialValue: false,
      });
      return response === true;
    }

    if (fs.existsSync(absPath)) {
      const stat = await fs.promises.stat(absPath);
      
      if (stat.isFile()) {
        if (force) {
          info(`--force flag used. Overwriting file "${absPath}".`);
          return true;
        }

        const response = await confirm({
          message: `File "${absPath}" exists. Overwrite?`,
          initialValue: false,
        });
        return response === true;
      }
      
      if (stat.isDirectory()) {
        const files = await fs.promises.readdir(absPath);
        if (files.length === 0) return true;

        if (force) {
          info(`--force flag used. Overwriting contents of "${absPath}".`);
          return true;
        }

        const response = await confirm({
          message: `Directory "${absPath}" is not empty. Overwrite its contents?`,
          initialValue: false,
        });
        return response === true;
      }
    }

    await fs.promises.mkdir(absPath, { recursive: true });
    return true;

  } catch (err) {
    throw createFileSystemError(`Failed to verify output target: ${outPath}`, outPath);
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