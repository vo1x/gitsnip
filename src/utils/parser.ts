export const parseGithubUrl = (url: string) =>{
  if (url.startsWith("https://github.com/")) {
    const m = url.match(
      /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)$/
    );
    if (!m) throw new Error("Invalid GitHub folder URL format.");
    return {
      owner: m[1],
      repo: m[2],
      branch: m[3],
      folder: m[4],
    };
  } else {
    // Fallback: user/repo folder
    return null;
  }
}
