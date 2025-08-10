
export interface DownloadOptions {
  out?: string;
  branch?: string;
  token?: string;
  force?: boolean;
  zip?: boolean;
}

export type ParsedUrl = {
  owner: string;
  repo: string;
  branch?: string;
  folder?: string;
  type: "tree" | "blob" | "repo";
};

export type ZipPath = {
  tmpDirParent: string;
  tmpDirPath: string;
  archivePath: string;
  archiveDisplay: string;
  archiveRootName: string;
};
