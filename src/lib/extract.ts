import * as tar from 'tar';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import fs from 'node:fs';
import path from 'node:path';

export async function downloadAndExtractTarball({
  owner,
  repo,
  ref = 'main',
  outDir = '.',
  filterPath = '',
  token,
}: {
  owner: string;
  repo: string;
  ref?: string;
  outDir?: string;
  filterPath?: string;
  token?: string;
}) {
  await fs.promises.mkdir(outDir, { recursive: true });

  const tarballUrl = `https://github.com/${owner}/${repo}/archive/${ref}.tar.gz`;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(tarballUrl, { headers });
  if (!res.ok) {
    throw new Error(`Failed to download tarball: ${res.status} ${res.statusText}`);
  }

  let stream: any = res.body as any;
  if (typeof res.body?.getReader === 'function') {
    stream = Readable.fromWeb(res.body as any);
  }

  const lastSegment = filterPath.replace(/\/$/, '');
  const targetBase = path.basename(lastSegment);

  await pipeline(
    stream,
    tar.x({
      cwd: outDir,
      strip: 1,
      filter: (filePath) => {
        if (!filterPath) return true;
        return filePath.includes(`/${targetBase}/`) || filePath.endsWith(`/${targetBase}`);
      },
      onentry: (entry) => {
        if (!filterPath) return;
        const parts = entry.path.split(`${targetBase}/`);
        if (parts.length > 1) {
          entry.path = `${targetBase}/${parts[1] || ''}`;
        }
      },
    })
  );

  const extractedItems = await fs.promises.readdir(outDir);
  const success = extractedItems.length > 0;

  return { success };
}
