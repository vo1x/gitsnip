import * as tar from 'tar';
import { pipeline } from 'node:stream/promises';
import fs from 'node:fs';

export async function downloadAndExtractTarball({
  owner,
  repo,
  ref = 'main',
  outDir = '.',
  filterPath = '',
  token,
  force = false,
}: {
  owner: string;
  repo: string;
  ref?: string;
  outDir?: string;
  filterPath?: string;
  token?: string;
  force?: boolean;
}) {

  const tarballUrl = `https://github.com/${owner}/${repo}/archive/${ref}.tar.gz`;
  const prefix = `${repo}-${ref.replace(/\//g, '-')}`;

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(tarballUrl, { headers });

  if (!res.ok) {
    throw new Error(`Failed to download tarball: ${res.status} ${res.statusText}`);
  }

  await fs.promises.mkdir(outDir, { recursive: true });

  await pipeline(
    res.body as any,
    tar.x({
      cwd: outDir,
      strip: 1,
      filter: (filePath: string, entry) => {
        if (!filterPath) return true;

        return filePath.startsWith(`${prefix}/${filterPath}`);
      },
    })
  );
}
