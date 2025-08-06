import { Command } from 'commander';
import { parseGithubUrl } from '../../lib/github/parser.js';
import { downloadPath } from '../../lib/downloader/index.js';
import type { DownloadOptions } from '../../types/index.js';
import { info, success, error } from '../../lib/utils/logger.js';

export const downloadCommand = new Command('download')
  .description('Download files or folders from GitHub')
  .argument('<repo>', 'GitHub repository (owner/repo or full URL)')
  .argument('[folder]', 'Folder/file path to download (optional if URL includes path)')
  .option('-o, --out <dir>', 'Output directory', '.')
  .option('-b, --branch <branch>', 'Branch name', 'main')
  .option('-t, --token <token>', 'GitHub token for private repos')
  .option('--dry-run', 'Show what would be downloaded without downloading')
  .option('--force', 'Overwrite existing files without prompting')
  .action(async (repoArg: string, folderArg: string | undefined, options) => {
    try {
      let downloadOptions: DownloadOptions;
      try {
        const parsed = parseGithubUrl(repoArg);
        let outputDir = options.out;
        if (outputDir === '.' && !options.out) {
          if (parsed.folder) {
            const isBlob = parsed.type === 'blob' || repoArg.includes('/blob/');
            outputDir = isBlob ? '.' : parsed.folder.split('/').pop() || '.';
          } else {
            outputDir = parsed.repo;
          }
        }

        downloadOptions = {
          ...parsed,
          out: outputDir,
          branch: options.branch || parsed.branch || 'main',
          token: options.token,
          force: options.force,
          dryRun: options.dryRun,
        };

        if (folderArg) {
          downloadOptions.folder = folderArg;
        }
      } catch (parseError) {
        if (repoArg.includes('/') && folderArg) {
          const [owner, repo] = repoArg.split('/');
          downloadOptions = {
            owner,
            repo,
            folder: folderArg,
            branch: options.branch || 'main',
            out: options.out,
            token: options.token,
            force: options.force,
            dryRun: options.dryRun,
          };
        } else {
          throw new Error('Invalid GitHub repository format. Use: owner/repo or full GitHub URL');
        }
      }

      if (!downloadOptions.owner || !downloadOptions.repo || downloadOptions.folder === undefined) {
        throw new Error('Could not parse repository information');
      }

      const targetPath = downloadOptions.folder || '(entire repository)';
      info(`Repository: ${downloadOptions.owner}/${downloadOptions.repo}`);
      info(`Branch: ${downloadOptions.branch}`);
      info(`Path: ${targetPath}`);
      info(`Output: ${downloadOptions.out}`);

      if (options.dryRun) {
        info('Running in dry-run mode...');
      }

      const stats = await downloadPath(downloadOptions);

      success(`\nDownload completed! 🎉`);
      success(`Files downloaded: ${stats.downloadedFiles}`);
      if (stats.skippedFiles > 0) {
        info(`Files skipped: ${stats.skippedFiles}`);
      }
      if (stats.errors > 0) {
        error(`Errors encountered: ${stats.errors}`);
      }
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });
