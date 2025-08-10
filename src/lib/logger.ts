import chalk from 'chalk';
import ora, { type Ora } from 'ora';

// will migrate this to an object.

let currentSpinner: Ora | null = null;

const label = (text: string, bg: (s: string) => string) => chalk.black.bold(bg(` ${text} `));

export function info(msg: string): void {
  stopSpinner();
  console.log(label('INFO', chalk.bgCyanBright), msg);
}

export function _success(msg: string): void {
  stopSpinner();
  console.log(label('SUCCESS', chalk.bgGreenBright), msg);
}

export function error(msg: string): void {
  stopSpinner();
  console.error(label('ERROR', chalk.bgRedBright), msg);
}

export function warn(msg: string): void {
  stopSpinner();
  console.log(label('WARN', chalk.bgYellowBright), msg);
}

export function debug(msg: string): void {
  if (process.env.DEBUG) {
    stopSpinner();
    console.log(label('DEBUG', chalk.bgGray), msg);
  }
}

export function progress(text: string): void {
  if (currentSpinner) {
    currentSpinner.text = text;
  } else {
    currentSpinner = ora({ text, spinner: 'dots12' }).start();
  }
}

export function stopSpinner(): void {
  if (currentSpinner) {
    currentSpinner.stop();
    currentSpinner = null;
    process.stdout.write('\n');
  }
}
