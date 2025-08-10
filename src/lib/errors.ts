export function createGitSnipError(message: string, code?: string) {
  const err = new Error(message);
  (err as any).code = code || 'GITSNIP_ERROR';
  (err as any).name = 'GitSnipError';
  return err;
}

export function createGitHubApiError(message: string, status?: number) {
  const err = new Error(message);
  (err as any).code = 'GITHUB_API_ERROR';
  (err as any).status = status;
  (err as any).name = 'GitHubApiError';
  return err;
}

export function createFileSystemError(message: string, path?: string) {
  const err = new Error(message);
  (err as any).code = 'FILESYSTEM_ERROR';
  (err as any).path = path;
  (err as any).name = 'FileSystemError';
  return err;
}

export function createNetworkError(message: string) {
  const err = new Error(message);
  (err as any).code = 'NETWORK_ERROR';
  (err as any).name = 'NetworkError';
  return err;
}

export function createRateLimitError(resetDate?: Date): Error {
  const err = new Error('GitHub API rate limit exceeded');
  err.name = 'RateLimitError';
  if (resetDate) {
    (err as any).resetDate = resetDate;
  }
  return err;
}

export function isRateLimitError(err: unknown): err is Error & { resetDate?: Date } {
  return err instanceof Error && err.name === 'RateLimitError';
}
