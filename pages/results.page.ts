import type { Locator, Page } from '@playwright/test';
import { PaginationComponent } from '../components/pagination.component';

export class ResultsPage {
  readonly movieCards: Locator;
  readonly movieTitles: Locator;
  readonly movieMeta: Locator;
  readonly noResults: Locator;
  readonly errorMessage: Locator;
  readonly pagination: PaginationComponent;

  constructor(private readonly page: Page) {
    this.movieCards = page.locator('.grid > div');
    this.movieTitles = page.locator('.grid > div .text-blue-500.font-bold');
    this.movieMeta = page.locator('.grid > div .text-gray-500.font-light');
    this.noResults = page.getByText('No results found.');
    this.errorMessage = page.getByText('Something went wrong');
    this.pagination = new PaginationComponent(page);
  }

  async cardCount(): Promise<number> {
    return this.movieCards.count();
  }

  async titles(): Promise<string[]> {
    return this.movieTitles.allTextContents();
  }

  async metaTexts(): Promise<string[]> {
    return this.movieMeta.allTextContents();
  }

  async hasError(): Promise<boolean> {
    return this.errorMessage.isVisible({ timeout: 3_000 }).catch(() => false);
  }

  async hasPagination(): Promise<boolean> {
    return this.pagination.isVisible();
  }

  async goToNextPage(): Promise<void> {
    await this.pagination.goToNextPage();
  }

  async goToPreviousPage(): Promise<void> {
    await this.pagination.goToPreviousPage();
  }

  async getCurrentPage(): Promise<number> {
    return this.pagination.currentPage();
  }
}
