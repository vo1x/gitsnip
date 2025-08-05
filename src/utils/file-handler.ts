import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";

import type { DownloadFolderOptions } from "../types";

export const writeFileRecursive = (filePath: string, buffer: ArrayBuffer) => {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, Buffer.from(buffer));
};

export async function downloadFolder({
  owner,
  repo,
  branch = "main",
  folder,
  out = ".",
  token,
}: Partial<DownloadFolderOptions>): Promise<void> {
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${folder}?ref=${branch}`;
  const headers: Record<string, string> = { "User-Agent": "gitpick" };
  if (token) headers.Authorization = `token ${token}`;

  const res = await fetch(api, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`);
  const items = await res.json();

  if (!Array.isArray(items))
    throw new Error("The path you provided is not a directory on GitHub.");

  for (const item of items) {
    if (item.type === "file") {
      const fileRes = await fetch(item.download_url, { headers });

      const fileBuf = await fileRes.arrayBuffer();
      const dest = path.join(out, item.name);
      
      writeFileRecursive(dest, fileBuf);
      console.log(chalk.green("✓"), dest);
    } else if (item.type === "dir") {
      const subDir = path.join(out, item.name);

      // recursive call
      await downloadFolder({
        owner,
        repo,
        branch,
        folder: `${folder}/${item.name}`,
        out: subDir,
        token,
      });
    }
  }
}
