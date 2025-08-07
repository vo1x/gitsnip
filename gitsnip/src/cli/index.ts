#!/usr/bin/env node

import { Command } from 'commander';
import { downloadCommand } from './commands/download.js';

const program = new Command();

program
  .name('gitsnip')
  .description('Download any file, folder, or whole repo from GitHub—without git')
  .version('1.0.0');

program.addCommand(downloadCommand);

program
  .argument('<repo>', 'GitHub repository (owner/repo or full URL)')
  .argument('[folder]', 'Folder/file path to download (optional if URL includes path)')
  .option('-o, --out <dir>', 'Output directory', '.')
  .option('-b, --branch <branch>', 'Branch name', 'main')
  .option('-t, --token <token>', 'GitHub token for private repos')
  .option('--dry-run', 'Show what would be downloaded without downloading')
  .option('--force', 'Overwrite existing files without prompting')
  .action(async (...args) => {
    await downloadCommand.parseAsync(process.argv.slice(2), { from: 'user' });
  });

program.addHelpText(
  'after',
  `
Examples:
  $ gitsnip owner/repo                           # Download entire repo
  $ gitsnip owner/repo src                       # Download 'src' folder
  $ gitsnip owner/repo/tree/main/src             # Download folder via URL
  $ gitsnip owner/repo/blob/main/file.txt        # Download single file
  $ gitsnip owner/repo -o my-folder -b dev       # Custom output & branch
  $ gitsnip owner/repo -t ghp_token123           # Private repo with token
  $ gitsnip owner/repo --dry-run                 # Preview download
`
);

program.parse();
