import { test as base } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { FilterPanelPage } from '../../pages/filter-panel.page';
import { ResultsPage } from '../../pages/results.page';
import { TmdbService } from '../../services/api/tmdb.service';
import { createTestLogger, type TestLogger } from '../../utils/logger';
import { writeApiDumpAttachment, writeConsoleDumpAttachment } from '../../src/core/reporting';

interface TestFixtures {
  homePage: HomePage;
  filterPanel: FilterPanelPage;
  resultsPage: ResultsPage;
  app: HomePage;
  api: TmdbService;
  log: TestLogger;
}

export const test = base.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    const home = new HomePage(page);
    await home.goto();
    await use(home);
  },

  filterPanel: async ({ page }, use) => {
    const home = new HomePage(page);
    await home.goto();
    await use(home.filters);
  },

  resultsPage: async ({ page }, use) => {
    const home = new HomePage(page);
    await home.goto();
    await use(home.results);
  },

  app: async ({ homePage }, use) => {
    await use(homePage);
  },

  api: async ({ request }, use) => {
    await use(new TmdbService(request));
  },

  // eslint-disable-next-line no-empty-pattern
  log: async ({}, use, testInfo) => {
    const consoleLines: string[] = [];
    const apiLines: string[] = [];
    const originalWrite = process.stdout.write.bind(process.stdout) as (
      ...args: unknown[]
    ) => boolean;

    process.stdout.write = ((chunk: unknown, encodingOrCb?: unknown, maybeCb?: unknown) => {
      const text = normalizeStdoutChunk(chunk);
      if (text.trim().length > 0) {
        consoleLines.push(text);
        if (text.includes('API ←') || text.includes('API(query) ←')) {
          apiLines.push(text);
        }
      }
      return originalWrite(chunk, encodingOrCb, maybeCb);
    }) as typeof process.stdout.write;

    await use(createTestLogger(testInfo));

    process.stdout.write = originalWrite;

    if (testInfo.status !== 'passed') {
      void writeConsoleDumpAttachment(testInfo, consoleLines);
      void writeApiDumpAttachment(testInfo, apiLines);
    }
  },
});

export { expect } from '@playwright/test';

function normalizeStdoutChunk(chunk: unknown): string {
  if (typeof chunk === 'string') {
    return chunk;
  }
  if (Buffer.isBuffer(chunk)) {
    return chunk.toString('utf-8');
  }
  return '';
}
