> [!WARNING]
> **This package is under active development and not yet production-ready.**
> Features and CLI usage may change at any time. Expect bugs, breaking changes, and incomplete features.
> **Use at your own risk.**

# gitsnip

**Download any file, folder, or entire repo from GitHub—without git.**

[![npm version](https://img.shields.io/npm/v/gitsnip?color=green)](https://www.npmjs.com/package/gitsnip)
[![MIT License](https://img.shields.io/github/license/vo1x/gitsnip)](LICENSE)

---

## 🚀 Quick Start

> **You do not need git or GitHub CLI—just Node.js 18+ and npx.**

### Clone a full repo (no .git folder):

    npx gitsnip owner/repo
    npx gitsnip https://github.com/owner/repo

### Download a folder:

    npx gitsnip owner/repo/tree/main/path/to/folder
    npx gitsnip https://github.com/owner/repo/tree/main/path/to/folder

### Download a file:

    npx gitsnip owner/repo/blob/main/path/to/file
    npx gitsnip https://github.com/owner/repo/blob/main/path/to/file

### Specify branch or commit SHA:

    npx gitsnip owner/repo -b dev
    npx gitsnip owner/repo -b 1234abcd

### Download from private repos (with token):

    npx gitsnip owner/repo --token <your_github_token>

---

## 🛠️ Options

| Option             | Shorthand   | Description                               |
|--------------------|-------------|-------------------------------------------|
| `-o, --out`        |             | Output directory (default: .)             |
| `-b, --branch`     |             | Branch or commit SHA (default: main)      |
| `-t, --token`      |             | GitHub token for private repos            |
| `--dry-run`        |             | Show what would be downloaded             |
| `--force`          |             | Overwrite existing files without prompting|

---

## ✨ Features

- Download any public or private file, folder, or repo from GitHub
- Supports branches and commit SHAs
- No git history—just files and folders
- Works without git or GitHub CLI
- Handles most GitHub URLs and short forms
- Overwrite prompt for existing files (`--force` skips prompt)

---

## 🔥 Examples

    # Download a public repo as a folder (no .git)
    npx gitsnip vercel/next.js

    # Download a folder only
    npx gitsnip vercel/next.js/tree/canary/packages/next

    # Download a single file
    npx gitsnip vercel/next.js/blob/canary/packages/next/package.json

    # Use a GitHub token for a private repo
    npx gitsnip owner/private-repo --token ghp_xxxxxxx

    # Specify output directory
    npx gitsnip vercel/next.js -o my-folder

---

## ⚡️ To-Do

- [ ] Add tests
- [ ] Support downloading symlinks
- [ ] Support cloning submodules (optionally)
- [ ] Add archive (zip/tar) output option
- [ ] Improve error messages for rate-limited or large repos
- [ ] Add Windows path compatibility checks

---

## 📄 License

MIT

---

**Enjoy using `gitsnip`? Star this repo! [⭐](https://github.com/vo1x/gitsnip)**
