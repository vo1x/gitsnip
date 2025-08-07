#!/usr/bin/env node

import { Command } from 'commander';
import ora from 'ora';
import fs from 'node:fs';
import path from 'node:path';

import { rimraf } from 'rimraf';

import { parseGithubUrl } from '../lib/parser.js';
import { downloadAndExtractTarball } from '../lib/tarball.js';
import { info, success, error } from '../lib/logger.js';
import { verifyOutputTarget, resolveOutputPath, createTmpDir } from '../lib/fs.js';
import { zipDirectory } from '../lib/zip.js';

const program = new Command();
program
  .name('gitsnip')
  .description('Download any file, folder, or whole repo from GitHub—without git')
  .version('0.2.4', '-v, --version', 'output the current version')
  .argument('<repo>', 'GitHub repository (owner/repo or full URL)')
  .argument('[folder]', 'Folder/file path to download (optional if URL includes path)')
  .option('-o, --out <dir>', 'Output directory')
  .option('-b, --branch <branch>', 'Branch name', 'main')
  .option('-t, --token <token>', 'GitHub token for private repos')
  .option('--force', 'Overwrite existing files without prompting')
  .option('-z, --zip', 'Export the result as a .zip archive')
  .action(async (repoArg: string, folderArg: string | undefined, options) => {
    try {
      let parsed;
      try {
        parsed = parseGithubUrl(repoArg);
      } catch (e) {
        error('Invalid GitHub repository format. Use: owner/repo or full GitHub URL');
        process.exit(1);
      }

      const outputDir = resolveOutputPath(parsed, options, repoArg);

      let fileName: string | undefined;
      if (parsed.type === 'blob') {
        fileName = path.basename(parsed.folder);
      }

      const shouldProceed = await verifyOutputTarget(outputDir, options.force || false, fileName);
      if (!shouldProceed) {
        error(`Aborted by user: Output directory is not empty.`);
        process.exit(1);
      }

      let extractPath = parsed.folder;
      if (folderArg) extractPath = folderArg;

      info(`Repository: ${parsed.owner}/${parsed.repo}`);
      info(`Branch: ${options.branch || parsed.branch || 'main'}`);
      info(`Path: ${extractPath || '(entire repository)'}`);
      info(`Output: ${outputDir}`);

      if (options.zip) {
        const { tmpDirPath } = await createTmpDir(outputDir);

        const spinner = ora('Downloading tarball from GitHub...').start();

        await downloadAndExtractTarball({
          owner: parsed.owner,
          repo: parsed.repo,
          ref: options.branch || parsed.branch || 'main',
          outDir: tmpDirPath,
          filterPath: extractPath,
          token: options.token,
          force: options.force,
        });

        spinner.succeed('Download and extraction complete! 🎉');

        const items = await fs.promises.readdir(tmpDirPath);
        if (!items.length) {
          error('Nothing was extracted. Aborting.');
          await rimraf(tmpDirPath);
          process.exit(1);
        }

        const toZip = items[0];
        const toZipPath = path.join(tmpDirPath, toZip);
        const zipPath = path.join(outputDir, `${toZip}.zip`);

        await zipDirectory(toZipPath, zipPath);
        success(`Created zip archive: ${zipPath}`);

        await rimraf(tmpDirPath);
        success(`Removed temporary folder: ${tmpDirPath}`);
      } else {
        const spinner = ora('Downloading tarball from GitHub...').start();

        await downloadAndExtractTarball({
          owner: parsed.owner,
          repo: parsed.repo,
          ref: options.branch || parsed.branch || 'main',
          outDir: outputDir,
          filterPath: extractPath,
          token: options.token,
          force: options.force,
        });

        spinner.succeed('Download and extraction complete! 🎉');
        success(`Done: Files saved to "${outputDir}"`);
      }
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program.addHelpText(
  'after',
  `
Examples:
  $ gitsnip owner/repo
      Download the entire repository into the current directory.

  $ gitsnip owner/repo src
      Download just the 'src' folder from a repo.

  $ gitsnip owner/repo/tree/main/src
      Download a specific folder from a branch using the full GitHub URL.

  $ gitsnip owner/repo/blob/main/file.txt
      Download a single file from a repo.

  $ gitsnip owner/repo -o my-folder -b dev
      Download the repository's 'dev' branch into 'my-folder'.

  $ gitsnip owner/repo --zip
      Download and extract the entire repo, then zip it up (archive will be in the current directory).

  $ gitsnip owner/repo src --zip -o downloads
      Download and extract only the 'src' folder, then zip it into the 'downloads' folder.

  $ gitsnip owner/repo -t ghp_yourTokenHere
      Download from a private repo using a GitHub token.

  $ gitsnip owner/repo --force
      Overwrite existing files in the output directory without prompting.
`
);

program.parse();
