#!/usr/bin/env bun

import chalk from "chalk";
import minimist from "minimist";
import * as fs from "fs";
import * as path from "path";

import { writeFileRecursive } from "./utils/file-handler";
import { parseGithubUrl } from "./utils/parser";

interface DownloadFolderOptions {
  owner: string;
  repo: string;
  branch?: string;
  folder: string;
  out?: string;
  token?: string;
}

async function downloadFolder({
  owner,
  repo,
  branch = "main",
  folder,
  out = ".",
  token,
}: DownloadFolderOptions): Promise<void> {
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
      console.log(dest);
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

(async function () {
  const argv = minimist(Bun.argv.slice(2), {
    string: ["out", "branch", "token"],
    alias: { o: "out", b: "branch", t: "token" },
  });
  const [repoArg, folderArg] = argv._;

  let branch: string, owner: string, repo: string, folder: string;
  let userOut = argv.out || ".";
  if (repoArg) {
    const parsed = parseGithubUrl(repoArg);
    if (parsed) {
      ({ owner, repo, branch, folder } = parsed);
      if (argv.branch) branch = argv.branch;
      console.log(folder);
      userOut = folder.split("/").pop();
    }
  } else if (repoArg && folder) {
    [owner, repo] = repoArg.split("/");
    branch = argv.branch || "main";
    folder = folderArg;
  } else {
    console.log(chalk.bold("Usage:"));
    console.log(
      "  ghpick <user/repo> <folder> [--out dir] [--branch branch] [--token gh_token]"
    );
    console.log(
      "  ghpick <github url to folder> [--out dir] [--token gh_token]"
    );
    process.exit(1);
  }

  try {
    await downloadFolder({
      owner,
      repo,
      branch: argv.branch || "main",
      folder,
      out: userOut,
      token: argv.token,
    });
    console.log(chalk.bold.green("\nDone!"));
  } catch (err: any) {
    console.error(chalk.red("\nError:"), err.message);
    process.exit(1);
  }
})();
