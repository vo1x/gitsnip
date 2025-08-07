export interface DownloadOptions {
  owner: string;
  repo: string;
  branch?: string;
  folder: string;
  out?: string;
  token?: string;
  force?: boolean;
  dryRun?: boolean;
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export type GitHubResponse = GitHubContent | GitHubContent[];

export interface ParsedUrl {
  owner: string;
  repo: string;
  branch?: string;
  folder: string;
  type?: 'tree' | 'blob';
}

export interface DownloadStats {
  totalFiles: number;
  downloadedFiles: number;
  skippedFiles: number;
  errors: number;
  startTime: Date;
  endTime?: Date;
}
