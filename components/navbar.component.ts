import type { Page, Locator } from '@playwright/test';
import { rootLogger } from '../utils/logger';
import { SELECTORS } from '../config/selectors';

type CategoryLabel = 'Popular' | 'Trend' | 'Newest' | 'Top rated';

/**
 * Reusable navigation bar component — category tab links + search input.
 */
export class NavbarComponent {
  readonly searchInput: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page.locator(SELECTORS.navbar.searchInput).first();
  }

  link(name: CategoryLabel): Locator {
    return this.page.getByRole('link', { name });
  }

  async selectCategory(name: CategoryLabel): Promise<void> {
    await this.link(name).click();
    rootLogger.info(`Category → ${name}`);
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    rootLogger.info(`Search → "${query}"`);
  }
}
