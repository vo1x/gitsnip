#!/usr/bin/env node

import { Command } from 'commander';
import ora from 'ora';
import { parseGithubUrl } from '../lib/parser.js';
import { downloadAndExtractTarball } from '../lib/tarball.js';
import { info, success, error } from '../lib/logger.js';
import { verifyOutputDir } from '../lib/fs.js';
import { resolveOutputPath } from '../lib/fs.js';

const program = new Command();

program
  .name('gitsnip')
  .description('Download any file, folder, or whole repo from GitHub—without git')
  .version('1.0.0')
  .argument('<repo>', 'GitHub repository (owner/repo or full URL)')
  .argument('[folder]', 'Folder/file path to download (optional if URL includes path)')
  .option('-o, --out <dir>', 'Output directory')
  .option('-b, --branch <branch>', 'Branch name', 'main')
  .option('-t, --token <token>', 'GitHub token for private repos')
  .option('--force', 'Overwrite existing files without prompting')
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

      if (!(await verifyOutputDir(outputDir, options.force))) {
        error(`Aborted by user: Output directory is not empty.`);
        process.exit(1);
      }

      let extractPath = parsed.folder;
      if (folderArg) extractPath = folderArg;

      info(`Repository: ${parsed.owner}/${parsed.repo}`);
      info(`Branch: ${options.branch || parsed.branch || 'main'}`);
      info(`Path: ${extractPath || '(entire repository)'}`);
      info(`Output: ${outputDir}`);

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
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program.addHelpText(
  'after',
  `
Examples:
  $ gitsnip owner/repo                           # Download entire repo
  $ gitsnip owner/repo src                       # Download 'src' folder
  $ gitsnip owner/repo/tree/main/src             # Download folder via URL
  $ gitsnip owner/repo/blob/main/file.txt        # Download single file
  $ gitsnip owner/repo -o my-folder -b dev       # Custom output & branch
  $ gitsnip owner/repo -t ghp_token123           # Private repo with token
  $ gitsnip owner/repo --force                   # Overwrite contents without prompting
`
);

program.parse();
