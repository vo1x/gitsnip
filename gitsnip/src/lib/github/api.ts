import type { GitHubResponse } from '../../types/index.js';
import { createGitHubApiError, createNetworkError } from '../utils/errors.js';

async function fetchWithRetry(
  url: string, 
  options: { headers?: Record<string, string>, maxRetries?: number } = {}
): Promise<Response> {
  const { maxRetries = 3, headers = {} } = options;
  let lastError: Error | undefined;

  const defaultHeaders = {
    "User-Agent": "gitsnip",
    "Accept": "application/vnd.github.v3+json",
    ...headers
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, { headers: defaultHeaders });

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
        await new Promise(res => setTimeout(res, delay));
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw createGitHubApiError(
          `GitHub API error: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`,
          response.status
        );
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      break;
    }
  }

  if (lastError) throw createNetworkError(`Failed to fetch after ${maxRetries} attempts: ${lastError.message}`);
  throw createNetworkError(`Failed to fetch after ${maxRetries} attempts (unknown error)`);
}

export async function fetchGitHubContent(
  owner: string,
  repo: string,
  path: string,
  branch = 'main',
  token?: string
): Promise<GitHubResponse> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetchWithRetry(url, { headers });
  return response.json() as Promise<GitHubResponse>;
}

export async function downloadFile(url: string, headers?: Record<string, string>): Promise<ArrayBuffer> {
  const response = await fetchWithRetry(url, { headers });
  return response.arrayBuffer();
}
