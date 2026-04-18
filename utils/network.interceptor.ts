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
