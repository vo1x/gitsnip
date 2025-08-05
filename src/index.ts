#!/usr/bin/env bun

import minimist from "minimist";
import { parseGithubUrl } from "./utils/parser";
import { downloadPath } from "./utils/file-handler";
import type { DownloadFolderOptions as RepoOptions } from "./types";
import { Logger } from "./messages";

async function main() {
  const argv = minimist(Bun.argv.slice(2), {
    string: ["out", "branch", "token"],
    alias: { o: "out", b: "branch", t: "token" },
  });

  const [repoArg, folderArg] = argv._ as string[];

  let options: Partial<RepoOptions> = {
    out: argv.out || ".",
    token: argv.token,
    type: "dir",
  };

  const parsed = repoArg
    ? (parseGithubUrl(repoArg) as Partial<RepoOptions> | null)
    : null;

  if (parsed) {
    options = {
      ...options,
      ...parsed,
      out: argv.out || (parsed.folder ? parsed.folder.split("/").pop() : "."),
      branch: argv.branch || parsed.branch || "main",
      type: parsed.type as "dir" | "file" | undefined,
    };
  } else if (repoArg && folderArg) {
    const [owner, repo] = repoArg.split("/");
    options = {
      ...options,
      owner,
      repo,
      folder: folderArg,
      branch: argv.branch || "main",
    };
  } else {
    Logger.usage();
    process.exit(1);
  }

  if (!options.owner || !options.repo || !options.folder) {
    Logger.usage();
    process.exit(1);
  }

  try {
    if (parsed?.type === "file") {
      Logger.info(
        `Downloading file "${options.folder}" from ${options.owner}/${options.repo} (branch: ${options.branch})...`
      );
    } else {
      Logger.info(
        `Downloading folder "${options.folder}" from ${options.owner}/${options.repo} (branch: ${options.branch})...`
      );
    }
    await downloadPath(options as RepoOptions, parsed?.type as "file" | "dir");
    Logger.success("\nDone!");
  } catch (err: any) {
    Logger.error(err?.message || String(err));
    process.exit(1);
  }
}

main();
