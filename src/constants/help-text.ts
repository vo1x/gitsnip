export const helpText = `
Examples:
  $ gitsnip owner/repo
      Download the entire repository into the current directory.

  $ gitsnip owner/repo src
      Download just the 'src' folder from a repo.

  $ gitsnip owner/repo/tree/main/src
      Download a specific folder from a branch using the full GitHub URL.

  $ gitsnip owner/repo/blob/main/file.txt
      Download a single file from a repo.

  $ gitsnip owner/repo -o my-folder -b dev
      Download the repository's 'dev' branch into 'my-folder'.

  $ gitsnip owner/repo --zip
      Download and extract the entire repo, then zip it up (archive will be in the current directory).

  $ gitsnip owner/repo src --zip -o downloads
      Download and extract only the 'src' folder, then zip it into the 'downloads' folder.

  $ gitsnip owner/repo -t ghp_yourTokenHere
      Download from a private repo using a GitHub token.

  $ gitsnip owner/repo --force
      Overwrite existing files in the output directory without prompting.
`;
