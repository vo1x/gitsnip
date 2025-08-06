import chalk from 'chalk';
import ora, { type Ora } from 'ora';

let currentSpinner: Ora | null = null;

export function info(msg: string): void {
  stopSpinner();
  console.log(chalk.cyan('ℹ'), msg);
}

export function success(msg: string): void {
  stopSpinner();
  console.log(chalk.green('✓'), msg);
}

export function error(msg: string): void {
  stopSpinner();
  console.error(chalk.red('✗'), msg);
}

export function warn(msg: string): void {
  stopSpinner();
  console.log(chalk.yellow('⚠'), msg);
}

export function debug(msg: string): void {
  if (process.env.DEBUG) {
    stopSpinner();
    console.log(chalk.gray('→'), msg);
  }
}

export function progress(text: string): void {
  if (currentSpinner) {
    currentSpinner.text = text;
  } else {
    currentSpinner = ora(text).start();
  }
}

export function stopSpinner(): void {
  if (currentSpinner) {
    currentSpinner.stop();
    currentSpinner = null;
  }
}

export function createProgressBar(total: number) {
  let completed = 0;

  const update = (current?: number): void => {
    if (current !== undefined) completed = current;
    else completed++;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const barLength = 20;
    const filledLength = Math.floor(percentage / 5);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

    process.stdout.write(`\r${chalk.cyan(`[${bar}] ${completed}/${total} (${percentage}%)`)}`);
  };

  const finish = (): void => {
    console.log();
  };

  return { update, finish };
}
