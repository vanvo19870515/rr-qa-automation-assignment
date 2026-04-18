import type { Page, Locator } from '@playwright/test';
import { rootLogger } from '../utils/logger';
import { SELECTORS } from '../config/selectors';

/**
 * Reusable pagination component for page navigation actions.
 */
export class PaginationComponent {
  readonly container: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly currentIndicator: Locator;

  constructor(private readonly page: Page) {
    this.container = page.locator(SELECTORS.pagination.container);
    this.previousButton = page.locator(SELECTORS.pagination.previousButton);
    this.nextButton = page.locator(SELECTORS.pagination.nextButton);
    this.currentIndicator = page.locator(SELECTORS.pagination.currentIndicator);
  }

  async goToNextPage(): Promise<void> {
    await this.nextButton.click();
    rootLogger.info('Pagination → Next');
  }

  async goToPreviousPage(): Promise<void> {
    await this.previousButton.click();
    rootLogger.info('Pagination → Previous');
  }

  async goToPage(pageNumber: number): Promise<void> {
    await this.page.getByRole('button', { name: `Page ${pageNumber}` }).click();
    rootLogger.info(`Pagination → page ${pageNumber}`);
  }

  async currentPage(): Promise<number> {
    const text = await this.currentIndicator.first().textContent({ timeout: 15_000 });
    return parseInt(text?.match(/\d+/)?.[0] ?? '1', 10);
  }

  async isVisible(): Promise<boolean> {
    return this.container.isVisible({ timeout: 3_000 }).catch(() => false);
  }
}
