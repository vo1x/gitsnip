import fs from 'node:fs/promises';
import path from 'node:path';
import { createRateLimitError } from './errors.js'; 

export async function downloadSingleFile({
  owner,
  repo,
  ref,
  filePath,
  outFile,
  token,
}: {
  owner: string;
  repo: string;
  ref: string;
  filePath: string;
  outFile: string;
  token?: string;
}) {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filePath}`;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  console.log(url);

  const res = await fetch(url, { headers });
  if (!res.ok) {
    if (res.status === 403 && res.headers.get('X-RateLimit-Remaining') === '0') {
      const reset = res.headers.get('X-RateLimit-Reset');
      const resetDate = reset ? new Date(parseInt(reset) * 1000) : undefined;
      throw createRateLimitError(resetDate);
    }
    throw new Error(`Failed to download file: ${res.status} ${res.statusText}`);
  }

  const data = await res.arrayBuffer();
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, Buffer.from(data));
}


