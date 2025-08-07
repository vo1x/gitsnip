import { Command } from 'commander';
import ora from 'ora';
import { parseGithubUrl } from '../../lib/parser.js';
import { downloadAndExtractTarball } from '../../lib/tarball.js';
import { info, success, error } from '../../lib/logger.js';

export const downloadCommand = new Command('download')
  .description('Download files or folders from GitHub via tarball')
  .argument('<repo>', 'GitHub repository (owner/repo or full URL)')
  .argument('[folder]', 'Folder/file path to download (optional if URL includes path)')
  .option('-o, --out <dir>', 'Output directory')
  .option('-b, --branch <branch>', 'Branch name', 'main')
  .option('-t, --token <token>', 'GitHub token for private repos')
  .action(async (repoArg: string, folderArg: string | undefined, options) => {
    try {
      let parsed;
      try {
        parsed = parseGithubUrl(repoArg);
      } catch (e) {
        error('Invalid GitHub repository format. Use: owner/repo or full GitHub URL');
        process.exit(1);
      }

      let outputDir = options.out;
      if (!outputDir) {
        if (parsed.type === 'blob' || repoArg.includes('/blob/')) {
          outputDir = '.';
        } else if (parsed.folder) {
          outputDir = parsed.folder.split('/').pop() || parsed.repo;
        } else {
          outputDir = parsed.repo;
        }
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
      });

      spinner.succeed('Download and extraction complete! 🎉');
      success(`Done: Files saved to "${outputDir}"`);
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });
