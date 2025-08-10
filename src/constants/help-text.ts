export const helpText = `
Examples:
  $ npx gitsnip@latest owner/repo
      Download the entire repository into the current directory.

  $ npx gitsnip@latest owner/repo src
      Download just the 'src' folder from a repo.

  $ npx gitsnip@latest https://github.com/owner/repo/tree/main/src
      Download a specific folder from a branch using the full GitHub URL.

  $ npx gitsnip@latest https://github.com/owner/repo/blob/main/file.txt
      Download a single file from a repo using a full GitHub URL.

  $ npx gitsnip@latest owner/repo -o my-folder -b dev
      Download the repository's 'dev' branch into 'my-folder'.

  $ npx gitsnip@latest owner/repo --force
      Overwrite existing files in the output directory without prompting.

  $ npx gitsnip@latest owner/repo --token ghp_yourTokenHere
      Download from a private repo using a GitHub token.
`;
