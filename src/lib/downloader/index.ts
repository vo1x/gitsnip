import type { DownloadOptions, GitHubContent, DownloadStats } from '../../types/index.js';
import { fetchGitHubContent, downloadFile } from '../github/api.js';
import { writeFileAtomic, confirmOverwrite, resolveOutputPath } from '../utils/fs.js';
import { info, error, createProgressBar } from '../utils/logger.js';
import { createGitSnipError } from '../utils/errors.js';

async function downloadMultiple(
  items: GitHubContent[],
  options: DownloadOptions,
  stats: DownloadStats,
  updateProgress: () => void
): Promise<void> {
  for (const item of items) {
    if (item.type === 'file') {
      const outputPath = resolveOutputPath(item.path, options.out || '.');
      await downloadFileItem(item, outputPath, options, stats);
      updateProgress();
    } else if (item.type === 'dir') {
      const subItems = await fetchGitHubContent(
        options.owner,
        options.repo,
        item.path,
        options.branch,
        options.token
      );
      if (Array.isArray(subItems)) {
        await downloadMultiple(subItems, options, stats, updateProgress);
      }
    } else {
      info(`Skipping ${item.type}: ${item.name}`);
      stats.skippedFiles++;
    }
  }
}

// Download a single file
async function downloadFileItem(
  item: GitHubContent,
  outputPath: string,
  options: DownloadOptions,
  stats: DownloadStats
): Promise<void> {
  if (!item.download_url) {
    error(`No download URL for file: ${item.name}`);
    stats.errors++;
    return;
  }

  if (options.dryRun) {
    info(`Would download: ${outputPath}`);
    stats.downloadedFiles++;
    return;
  }

  try {
    const shouldDownload = await confirmOverwrite(outputPath, options.force);
    if (!shouldDownload) {
      info(`Skipped: ${outputPath}`);
      stats.skippedFiles++;
      return;
    }

    const headers: Record<string, string> = {};
    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const data = await downloadFile(item.download_url, headers);
    await writeFileAtomic(outputPath, data);

    stats.downloadedFiles++;
    info(`Downloaded: ${outputPath}`);
  } catch (err) {
    error(`Failed to download ${item.name}: ${err instanceof Error ? err.message : String(err)}`);
    stats.errors++;
  }
}

function countFiles(items: GitHubContent[]): number {
  return items.reduce((count, item) => (item.type === 'file' ? count + 1 : count), 0);
}

export async function downloadPath(options: DownloadOptions): Promise<DownloadStats> {
  const stats: DownloadStats = {
    totalFiles: 0,
    downloadedFiles: 0,
    skippedFiles: 0,
    errors: 0,
    startTime: new Date(),
  };

  try {
    const data = await fetchGitHubContent(
      options.owner,
      options.repo,
      options.folder,
      options.branch,
      options.token
    );

    if (Array.isArray(data)) {
      const files = countFiles(data);
      stats.totalFiles = files;
      if (files === 0) {
        info('No files found to download');
        stats.endTime = new Date();
        return stats;
      }
      const progressBar = createProgressBar(files);
      await downloadMultiple(data, options, stats, progressBar.update);
      progressBar.finish();
    } else {
      stats.totalFiles = 1;
      if (data.type === 'file') {
        const outputPath = resolveOutputPath(data.path, options.out || '.');
        await downloadFileItem(data, outputPath, options, stats);
      } else {
        throw createGitSnipError('Cannot download single directory. Use folder download instead.');
      }
    }

    stats.endTime = new Date();
    return stats;
  } catch (err) {
    stats.errors++;
    stats.endTime = new Date();
    throw err;
  }
}
