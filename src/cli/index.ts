#!/usr/bin/env node

import { Command } from 'commander';
import ora from 'ora';
import path from 'node:path';
import { rimraf } from 'rimraf';

import { parseGithubUrl } from '../lib/parser.js';
import { downloadAndExtractTarball } from '../lib/extract.js';
import { info, _success, error } from '../lib/logger.js';
import { helpText } from '../constants/help-text.js';
import { isPathExists, nextAvailableDirName, nextAvailableFileName } from '../lib/naming.js';
import { askOverwrite } from '../lib/ui.js';

const program = new Command();

program
  .name('gitsnip')
  .description('Download any file, folder, or whole repo from GitHub—without git')
  .version('0.4.0', '-v, --version', 'output the current version')
  .argument('<repo>', 'GitHub repository (owner/repo or full URL)')
  .argument('[folder]', 'Folder/file path to download (optional if URL includes path)')
  .option('-o, --out <dir>', 'Output directory', './')
  .option('-b, --branch <branch>', 'Branch name', 'main')
  .option('-t, --token <token>', 'GitHub token for private repos')
  .option('--force', 'Overwrite existing files without prompting')
  .action(async (repoArg, folderArg, options) => {
    try {
      let parsed;
      try {
        parsed = parseGithubUrl(repoArg);
      } catch {
        error('Invalid GitHub repository format. Use: owner/repo or full GitHub URL');
        process.exit(1);
      }

      const requestedPath = folderArg ?? parsed.folder ?? '';
      const refToUse = options.branch || parsed.branch || 'main';

      const baseOutputDir = path.resolve(options.out);
      const targetName = parsed.folder
        ? path.basename(parsed.folder)
        : parsed.branch && parsed.branch !== 'main'
          ? `${parsed.repo}-${parsed.branch}`
          : parsed.repo;

      let finalOutputPath = path.join(baseOutputDir, targetName);

      if (isPathExists(finalOutputPath) && !options.force) {
        const overwrite = await askOverwrite(
          `Path "${path.basename(finalOutputPath)}" already exists. Overwrite?`
        );

        if (!overwrite) {
          const parentDir = path.dirname(finalOutputPath);
          const baseName = path.basename(finalOutputPath);

          const isFile = parsed.type === 'blob' || (parsed.folder && !parsed.folder.includes('/'));

          finalOutputPath = path.join(
            parentDir,
            isFile
              ? nextAvailableFileName(parentDir, baseName)
              : nextAvailableDirName(parentDir, baseName)
          );
        } else {
          await rimraf(finalOutputPath);
        }
      }

      info(`Repository: ${parsed.owner}/${parsed.repo}`);
      info(`Branch: ${refToUse}`);
      info(`Path: ${requestedPath || '(entire repository)'}`);
      info(`Output: ${finalOutputPath}`);

      const spinner = ora('Downloading tarball from GitHub...').start();
      const { success } = await downloadAndExtractTarball({
        owner: parsed.owner,
        repo: parsed.repo,
        ref: refToUse,
        outDir: finalOutputPath,
        filterPath: requestedPath,
        token: options.token,
      });
      spinner.succeed('Download and extraction complete! 🎉');

      if (!success) {
        error('Nothing was extracted. Check your path.');
        process.exit(1);
      }

      _success(`Done: content saved to "${finalOutputPath}"`);
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program.addHelpText('after', helpText);

program.parse();
