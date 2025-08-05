export interface DownloadFolderOptions {
  owner: string;
  repo: string;
  branch?: string;
  folder: string;
  out?: string;
  token?: string;
  type: "file" | "dir";
}
