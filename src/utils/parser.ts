export const parseGithubUrl = (url: string) => {
  if (url.startsWith("https://github.com/")) {
    const m = url.match(
      /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:tree|blob)\/([^/]+)\/(.+)$/
    );
    if (m) {
      return {
        owner: m[1],
        repo: m[2],
        branch: m[3],
        folder: m[4],
        type: url.includes("/blob/") ? "file" : "dir",
      };
    }
    throw new Error("Invalid GitHub folder or file URL format.");
  }
  const [owner, repo] = url.split("/");
  if (!owner || !repo) {
    throw new Error("Invalid GitHub repo format. Use user/repo or valid URL.");
  }
  return { owner, repo, branch: undefined, folder: undefined, type: undefined };
};
