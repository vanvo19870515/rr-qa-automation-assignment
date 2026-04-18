import { test as base } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { FilterPanelPage } from '../../pages/filter-panel.page';
import { ResultsPage } from '../../pages/results.page';
import { TmdbService } from '../../services/api/tmdb.service';
import { createTestLogger, type TestLogger } from '../../utils/logger';

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
    await use(createTestLogger(testInfo));
  },
});

export { expect } from '@playwright/test';
