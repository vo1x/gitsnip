import { confirm } from '@clack/prompts';

export const askOverwrite = async (message: string) => {
  return await confirm({ message, initialValue: false });
};
