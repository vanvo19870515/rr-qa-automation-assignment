import type { Page, Locator } from '@playwright/test';
import { logger } from '../core/logger/logger';

/**
 * Reusable pagination component for page navigation actions.
 */
export class PaginationComponent {
  readonly container: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly currentIndicator: Locator;

  constructor(private readonly page: Page) {
    this.container = page.locator('#react-paginate');
    this.previousButton = page.getByRole('button', { name: 'Previous page' });
    this.nextButton = page.getByRole('button', { name: 'Next page' });
    this.currentIndicator = page.locator(
      'li.selected a, button[aria-current="page"], [aria-label*="is your current page"]',
    );
  }

  async goToNextPage(): Promise<void> {
    await this.nextButton.click();
    logger.info('Pagination → Next');
  }

  async goToPreviousPage(): Promise<void> {
    await this.previousButton.click();
    logger.info('Pagination → Previous');
  }

  async goToPage(pageNumber: number): Promise<void> {
    await this.page.getByRole('button', { name: `Page ${pageNumber}` }).click();
    logger.info(`Pagination → page ${pageNumber}`);
  }

  async currentPage(): Promise<number> {
    const text = await this.currentIndicator.first().textContent({ timeout: 15_000 });
    return parseInt(text?.match(/\d+/)?.[0] ?? '1', 10);
  }

  async isVisible(): Promise<boolean> {
    return this.container.isVisible({ timeout: 3_000 }).catch(() => false);
  }
}
