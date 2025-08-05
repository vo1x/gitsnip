export interface DownloadFolderOptions {
  owner: string;
  repo: string;
  branch?: string;
  folder: string;
  out?: string;
  token?: string;
}

export interface IGitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir" | "symlink" | "submodule";
  _links: {
    self: string;
    git: string;
    html: string;
  };
  content?: string;
  encoding?: string;
}

export type GitHubResponse = IGitHubContent | IGitHubContent[];
