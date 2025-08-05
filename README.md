ghpick
======

Download any file, folder, or whole repo from GitHub—without git.

---
Usage
-----

# Clone a full repo (no .git folder)
npx ghpick owner/repo
npx ghpick https://github.com/owner/repo

# Download a folder
npx ghpick owner/repo/tree/main/path/to/folder
npx ghpick https://github.com/owner/repo/tree/main/path/to/folder

# Download a file
npx ghpick owner/repo/blob/main/path/to/file
npx ghpick https://github.com/owner/repo/blob/main/path/to/file

# Specify branch or commit SHA
npx ghpick owner/repo -b dev
npx ghpick owner/repo -b 1234abcd

# Private repos (requires GitHub token)
npx ghpick owner/repo --token <your_github_token>

---
Features
--------

- Download a whole repo, any folder, or single file from GitHub
- Supports branches and commit SHAs
- Supports public and private repos (with token)
- Outputs a regular folder—no git history, no .git folder
- Skips and warns about symlinks/submodules

---
To-Do
-----

- [ ] Support downloading symlinks
- [ ] Support cloning submodules (optionally)
- [ ] Add progress bar / spinner
- [ ] Add archive (zip/tar) output option
- [ ] Improve error messages for rate-limited or large repos
- [ ] Add Windows path compatibility checks

---
License
-------

MIT

---
