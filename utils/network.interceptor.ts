import type { Page, Response } from '@playwright/test';
import type { TmdbPageResponse } from '../api/endpoints/tmdb.models';
import { env } from '../core/config/env';
import { logger } from '../core/logger/logger';

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
  logger.info(
    `API ← ${response.url().replace(/api_key=[^&]+/, 'api_key=***')} | page ${json.page} | ` +
      `${json.results.length} items | total_pages ${json.total_pages}`,
  );
  return json;
}
