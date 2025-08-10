import { program } from 'commander';
import path from 'node:path';
import { rimraf } from 'rimraf';

import { parseGithubUrl } from '../lib/parser.js';
import { downloadAndExtractTarball } from '../lib/extract.js';
import { info, _success, error, progress, stopSpinner } from '../lib/logger.js';
import { helpText } from '../constants/help-text.js';
import { isPathExists, nextAvailableDirName, nextAvailableFileName } from '../lib/naming.js';
import { askOverwrite } from '../lib/ui.js';

program
  .name('gitsnip')
  .description('Download any file, folder, or whole repo from GitHub—without git')
  .version('0.5.1', '-v, --version', 'output the current version')
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
        error('Invalid GitHub repository format! Use owner/repo or a full GitHub URL.');
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

      info(`Snipping from repository: ${parsed.owner}/${parsed.repo}`);
      info(`Using branch/commit: ${refToUse}`);
      info(`Target path: ${requestedPath || '(entire repository)'}`);
      info(`Saving to: ${finalOutputPath}`);

      progress('Snipping files from GitHub...');
      const { success } = await downloadAndExtractTarball({
        owner: parsed.owner,
        repo: parsed.repo,
        ref: refToUse,
        outDir: finalOutputPath,
        filterPath: requestedPath,
        token: options.token,
      });
      stopSpinner();

      if (!success) {
        error('No files were snipped! Please check your path and try again.');
        process.exit(1);
      }

      _success(`All done! Files saved to "${finalOutputPath}"`);
    } catch (err) {
      error(err instanceof Error ? `Error: ${err.message}` : `Unexpected error: ${String(err)}`);
      process.exit(1);
    }
  });

program.addHelpText('after', helpText);

if (process.argv.length <= 2) {
  program.outputHelp();
  process.exit(0);
}

program.parse();
