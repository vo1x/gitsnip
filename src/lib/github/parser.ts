import type { ParsedUrl } from '../../types/index.js';

function matchTreeOrBlobUrl(input: string): ParsedUrl | null {
  const match = input.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(tree|blob)\/([^/]+)\/(.+)$/
  );
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2],
    type: match[3] as 'tree' | 'blob',
    branch: match[4],
    folder: match[5],
  };
}

function matchTreeOrBlobUrlNoPath(input: string): ParsedUrl | null {
  const match = input.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(tree|blob)\/([^/]+)\/?$/
  );
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2],
    type: match[3] as 'tree' | 'blob',
    branch: match[4],
    folder: "",
  };
}

function matchRepoUrl(input: string): ParsedUrl | null {
  const match = input.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2],
    folder: "",
  };
}

function matchShortForm(input: string): ParsedUrl | null {
  const parts = input.split("/");
  if (parts.length === 2) {
    return {
      owner: parts[0],
      repo: parts[1],
      folder: ""
    };
  }
  if (parts.length > 2) {
    return {
      owner: parts[0],
      repo: parts[1],
      folder: parts.slice(2).join("/")
    };
  }
  return null;
}

export function parseGithubUrl(input: string): ParsedUrl {
  const treeOrBlobWithPath = matchTreeOrBlobUrl(input);
  if (treeOrBlobWithPath) return treeOrBlobWithPath;

  const treeOrBlobNoPath = matchTreeOrBlobUrlNoPath(input);
  if (treeOrBlobNoPath) return treeOrBlobNoPath;

  const repoUrl = matchRepoUrl(input);
  if (repoUrl) return repoUrl;

  const shortForm = matchShortForm(input);
  if (shortForm) return shortForm;

  throw new Error("Invalid GitHub repository URL or format");
}
