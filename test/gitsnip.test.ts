import { describe, it, expect } from 'vitest';
import { execa } from 'execa';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const baseTempDir = path.join(os.tmpdir(), 'gitsnip-tests');

async function makeTempDir(testName: string) {
  const dir = path.join(baseTempDir, testName.replace(/\W+/g, '_'));
  await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

const tests = [
  {
    args: ['vo1x/apple-music-rpc', '--force'],
    shouldSucceed: true,
    expectInOutput: 'INFO  Snipping from repository',
  },
  {
    args: ['https://github.com/vo1x/apple-music-rpc', '--force'],
    shouldSucceed: true,
    expectInOutput: 'INFO  Snipping from repository',
  },
  {
    args: ['vo1x/apple-music-rpc', 'Appie/', '--force'],
    shouldSucceed: true,
    expectInOutput: 'INFO  Target path',
  },
  {
    args: ['vo1x/apple-music-rpc/Appie/', '--force'],
    shouldSucceed: true,
    expectInOutput: 'INFO  Target path',
  },
  {
    args: ['https://github.com/vo1x/apple-music-rpc/tree/main/Appie/Assets.xcassets', '--force'],
    shouldSucceed: true,
    expectInOutput: 'INFO  Target path',
  },
  {
    args: ['https://github.com/vo1x/apple-music-rpc/blob/main/Appie/Info.plist', '--force'],
    shouldSucceed: true,
    expectInOutput: 'INFO  Target path',
  },
  {
    args: ['vo1x/apple-music-rpc', '-b', 'main', '--force'],
    shouldSucceed: true,
    expectInOutput: 'INFO  Using branch/commit: main',
  },
  {
    args: ['vo1x/apple-music-rpc', '-o', './my-rpc', '--force'],
    shouldSucceed: true,
    expectInOutput: 'INFO  Saving to:',
  },
  { args: ['--help'], shouldSucceed: true, expectInOutput: 'Usage:' },
  { args: ['--version'], shouldSucceed: true },
  { args: [], shouldSucceed: false },
];

describe('gitsnip CLI integration tests', () => {
  for (const { args, shouldSucceed, expectInOutput } of tests) {
    it(`should run ${shouldSucceed ? 'successfully' : 'with error'} for args: ${args.join(' ')}`, async () => {
      const tempDir = await makeTempDir(args.join('_'));
      const finalArgs = [...args, '-o', tempDir];

      try {
        const { stdout } = await execa('npx', ['gitsnip', ...finalArgs]);

        if (expectInOutput) {
          expect(stdout).toContain(expectInOutput);
        }

        if (!shouldSucceed) {
          throw new Error('Expected failure but command succeeded');
        }
      } catch (error) {
        if (shouldSucceed) {
          throw error;
        }
      } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
      }
    });
  }
});
