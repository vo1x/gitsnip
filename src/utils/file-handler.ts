import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
import type { DownloadFolderOptions, GitHubResponse } from "../types";
import { Logger } from "./messages";

export const writeFileRecursive = (filePath: string, buffer: ArrayBuffer) => {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, Buffer.from(buffer));
};

export const parseOutputDir = (
  fileName: string,
  outputDir: string
): string | null => {
  if (!fileName || !outputDir) return null;

  let dest: string;

  if (outputDir === "." || outputDir === "./") {
    dest = path.join(process.cwd(), fileName);
  } else if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    dest = path.join(outputDir, fileName);
  } else if (fs.lstatSync(outputDir).isDirectory()) {
    dest = path.join(outputDir, fileName);
  } else {
    dest = outputDir;
  }

  return dest;
};

export async function downloadPath({
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
  const data = (await res.json()) as GitHubResponse;

  console.log(data);

  if (Array.isArray(data)) {
    for (const item of data) {
      if (item.type === "file") {
        if (!item.download_url) {
          throw new Error("Download URL is missing for the file.");
        }
        const fileRes = await fetch(item.download_url, { headers });
        const fileBuf = await fileRes.arrayBuffer();
        const dest = path.join(out, item.name);

        writeFileRecursive(dest, fileBuf);
        console.log(chalk.green("✓"), dest);
      } else if (item.type === "dir") {
        const subDir = path.join(out, item.name);
        await downloadPath({
          owner,
          repo,
          branch,
          folder: `${folder}/${item.name}`,
          out: subDir,
          token,
        });
      }
    }
    return;
  }

  if (data && data.type === "file") {
    if (!data.download_url) {
      throw new Error("Download URL is missing for the file.");
    }
    const fileRes = await fetch(data.download_url, { headers });
    const fileBuf = await fileRes.arrayBuffer();
    const dest: string | null = parseOutputDir(data.name, out);

    if (!dest) {
      Logger.error("Output path could not be resolved.");
      return;
    }

    writeFileRecursive(dest, fileBuf);
    console.log(chalk.green("✓"), dest);
    return;
  }

  throw new Error(
    "The path you provided is not a file or directory on GitHub."
  );
}
