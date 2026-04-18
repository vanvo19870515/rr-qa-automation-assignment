import type { Page, Response } from '@playwright/test';
import type { TmdbPageResponse } from '../services/api/models/tmdb.models';
import { env } from '../config/env';
import { rootLogger } from './logger';

export async function waitForTmdbResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = env.timeouts.api,
): Promise<TmdbPageResponse> {
  const pattern = typeof urlPattern === 'string' ? new RegExp(urlPattern) : urlPattern;

  const response = await page.waitForResponse(
    (res: Response) => pattern.test(res.url()) && res.status() === 200,
    { timeout },
  );

  const json = (await response.json()) as TmdbPageResponse;
  rootLogger.info(
    `API ← ${response.url().replace(/api_key=[^&]+/, 'api_key=***')} | page ${json.page} | ` +
      `${json.results.length} items | total_pages ${json.total_pages}`,
  );
  return json;
}

function matchTmdbRequest(
  response: Response,
  endpointPattern: string | RegExp,
  query: Record<string, string | number> = {},
): boolean {
  const endpointRegex =
    typeof endpointPattern === 'string' ? new RegExp(endpointPattern) : endpointPattern;
  if (!endpointRegex.test(response.url())) {
    return false;
  }

  const url = new URL(response.url());
  return Object.entries(query).every(([key, value]) => url.searchParams.get(key) === String(value));
}

export async function waitForTmdbResponseByQuery(
  page: Page,
  endpointPattern: string | RegExp,
  query: Record<string, string | number>,
  timeout: number = env.timeouts.api,
): Promise<TmdbPageResponse> {
  const response = await page.waitForResponse(
    (res: Response) => res.status() === 200 && matchTmdbRequest(res, endpointPattern, query),
    { timeout },
  );
  const json = (await response.json()) as TmdbPageResponse;
  rootLogger.info(
    `API(query) ← ${response.url().replace(/api_key=[^&]+/, 'api_key=***')} | page ${json.page} | ` +
      `${json.results.length} items`,
  );
  return json;
}

export const waitForTmdbRequestByQuery = waitForTmdbResponseByQuery;
