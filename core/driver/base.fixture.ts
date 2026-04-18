import { test as base } from '@playwright/test';
import { DiscoverPage } from '../../pages/discover.page';
import { TmdbService } from '../../api/endpoints/tmdb.service';
import { logger as rootLogger } from '../logger/logger';

interface TestLogger {
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
}

interface TestFixtures {
  discoverPage: DiscoverPage;
  app: DiscoverPage;
  api: TmdbService;
  log: TestLogger;
}

export const test = base.extend<TestFixtures>({
  discoverPage: async ({ page }, use) => {
    const discover = new DiscoverPage(page);
    await discover.goto();
    await use(discover);
  },

  app: async ({ page }, use) => {
    await use(new DiscoverPage(page));
  },

  api: async ({ request }, use) => {
    await use(new TmdbService(request));
  },

  // eslint-disable-next-line no-empty-pattern
  log: async ({}, use, testInfo) => {
    const prefix = testInfo.title.split(' ')[0];
    await use({
      info: (msg: string) => rootLogger.info(`[${prefix}] ${msg}`),
      warn: (msg: string) => rootLogger.warn(`[${prefix}] ${msg}`),
      error: (msg: string) => rootLogger.error(`[${prefix}] ${msg}`),
    });
  },
});

export { expect } from '@playwright/test';
