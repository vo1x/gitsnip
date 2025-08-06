import chalk from "chalk";

export const Logger = {
  usage() {
    console.log(
      chalk.bold("Usage:") +
        `
  ghpick <user/repo> <folder> [--out dir] [--branch branch] [--token gh_token]
  ghpick <github url to folder> [--out dir] [--token gh_token]
`
    );
  },
  error(msg: string) {
    console.error(chalk.red("Error:"), msg);
  },
  success(msg: string) {
    console.log(chalk.bold.green(msg));
  },
  info(msg: string) {
    console.log(chalk.cyan(msg));
  },
};
