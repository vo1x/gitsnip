import { downloadAndExtractTarball } from './extract.js';
import { downloadSingleFile } from './download-file.js';
import path from 'node:path';
import { isRateLimitError } from './errors.js';

export async function downloadGitHubContent({
  owner,
  repo,
  ref,
  outDir,
  requestedPath,
  token,
  isFile,
}: {
  owner: string;
  repo: string;
  ref: string;
  outDir: string;
  requestedPath: string;
  token?: string;
  isFile: boolean;
}): Promise<boolean> {
  if (isFile) {
    try {
      await downloadSingleFile({
        owner,
        repo,
        ref,
        filePath: requestedPath,
        outFile: path.join(outDir, path.basename(requestedPath)),
        token,
      });
      return true;
    } catch (err) {
      if (isRateLimitError(err)) {
        const result = await downloadAndExtractTarball({
          owner,
          repo,
          ref,
          outDir,
          filterPath: requestedPath,
          token,
        });
        return result.success;
      } else {
        throw err;
      }
    }
  } else {
    const result = await downloadAndExtractTarball({
      owner,
      repo,
      ref,
      outDir,
      filterPath: requestedPath,
      token,
    });
    return result.success;
  }
}
