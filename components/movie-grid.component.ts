import type { Page, Locator } from '@playwright/test';

/**
 * Reusable movie grid component — cards, titles, meta, empty/error states.
 */
export class MovieGridComponent {
  readonly cards: Locator;
  readonly titles: Locator;
  readonly meta: Locator;
  readonly noResults: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.cards = page.locator('.grid > div');
    this.titles = page.locator('.grid > div .text-blue-500.font-bold');
    this.meta = page.locator('.grid > div .text-gray-500.font-light');
    this.noResults = page.getByText('No results found.');
    this.errorMessage = page.getByText('Something went wrong');
  }

  async cardCount(): Promise<number> {
    return this.cards.count();
  }

  async allTitles(): Promise<string[]> {
    return this.titles.allTextContents();
  }

  async allMeta(): Promise<string[]> {
    return this.meta.allTextContents();
  }

  async hasError(): Promise<boolean> {
    return this.errorMessage.isVisible({ timeout: 3_000 }).catch(() => false);
  }
}
