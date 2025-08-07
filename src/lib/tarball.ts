import * as tar from 'tar';
import { pipeline } from 'node:stream/promises';
import fs from 'node:fs';
import { Readable } from 'node:stream';

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

  const nodeStream = Readable.fromWeb(res.body as any);

  await fs.promises.mkdir(outDir, { recursive: true });

  await pipeline(
    nodeStream,
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
