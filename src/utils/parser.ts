function matchTreeOrBlobUrl(input: string) {
  const m = input.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(tree|blob)\/([^/]+)\/(.+)$/
  );
  if (!m) return null;
  return {
    owner: m[1],
    repo: m[2],
    branch: m[4],
    folder: m[5],
  };
}

function matchRepoUrl(input: string) {
  const m = input.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/);
  if (!m) return null;
  return {
    owner: m[1],
    repo: m[2],
    branch: undefined,
    folder: "",
  };
}

function matchShortForm(input: string) {
  const parts = input.split("/");
  if (parts.length === 2) {
    // owner/repo
    return { owner: parts[0], repo: parts[1], branch: undefined, folder: "" };
  }
  if (parts.length > 2) {
    // owner/repo/path/to/folder
    return {
      owner: parts[0],
      repo: parts[1],
      branch: undefined,
      folder: parts.slice(2).join("/"),
    };
  }
  return null;
}

export const parseGithubUrl = (input: string) => {
  const treeOrBlob = matchTreeOrBlobUrl(input);
  if (treeOrBlob) return treeOrBlob;

  const repoUrl = matchRepoUrl(input);
  if (repoUrl) return repoUrl;

  const shortForm = matchShortForm(input);
  if (shortForm) return shortForm;

  throw new Error("Invalid GitHub repo/folder/file input.");
};
