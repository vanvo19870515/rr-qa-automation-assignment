import type { Page, Locator } from '@playwright/test';
import { SELECTORS } from '../config/selectors';

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
    this.cards = page.locator(SELECTORS.results.cards);
    this.titles = page.locator(SELECTORS.results.titles);
    this.meta = page.locator(SELECTORS.results.meta);
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
