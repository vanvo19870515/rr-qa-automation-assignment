import { type Locator, type Response } from '@playwright/test';
import { BasePage } from '../core/driver/base.page';
import { FilterPanelPage } from './filter-panel.page';
import { ResultsPage } from './results.page';

type CategoryLabel = 'Popular' | 'Trend' | 'Newest' | 'Top rated';

export class HomePage extends BasePage {
  readonly filters: FilterPanelPage;
  readonly results: ResultsPage;
  readonly searchInput: Locator;
  readonly filterPanel: FilterPanelPage;
  readonly resultsPage: ResultsPage;

  constructor(page: import('@playwright/test').Page) {
    super(page);
    this.filters = new FilterPanelPage(page);
    this.results = new ResultsPage(page);
    this.filterPanel = this.filters;
    this.resultsPage = this.results;
    this.searchInput = page.getByPlaceholder('SEARCH');
  }

  protected readyLocator(): Locator {
    return this.results.movieCards;
  }

  async goto(): Promise<this> {
    return this.navigate('/');
  }

  async gotoDirectSlug(slug: string): Promise<Response | null> {
    return this.navigateRaw(`/${slug}`);
  }

  async selectCategory(name: CategoryLabel): Promise<this> {
    await this.page.getByRole('link', { name }).click();
    await this.waitForContentSettled();
    return this;
  }

  async searchByTitle(query: string): Promise<this> {
    await this.searchInput.fill(query);
    await this.waitForApiResponse(/\/3\/(search|movie|tv|discover|trending)\//);
    await this.waitForContentSettled();
    return this;
  }

  async selectType(type: 'Movie' | 'TV Shows'): Promise<this> {
    await this.filters.chooseType(type);
    await this.waitForContentSettled();
    return this;
  }

  async selectGenre(genre: string): Promise<this> {
    await this.filters.chooseGenre(genre);
    await this.waitForContentSettled();
    return this;
  }

  async selectYearRange(from: number, to: number): Promise<this> {
    await this.filters.chooseYearRange(from, to);
    await this.waitForContentSettled();
    return this;
  }

  async selectRating(stars: number): Promise<this> {
    await this.filters.chooseRating(stars);
    await this.waitForContentSettled();
    return this;
  }

  async cardCount(): Promise<number> {
    return this.results.cardCount();
  }

  async titles(): Promise<string[]> {
    return this.results.titles();
  }

  async hasPagination(): Promise<boolean> {
    return this.results.hasPagination();
  }

  async goToNextPage(): Promise<this> {
    await this.results.goToNextPage();
    await this.waitForContentSettled();
    return this;
  }

  async goToPreviousPage(): Promise<this> {
    await this.results.goToPreviousPage();
    await this.waitForContentSettled();
    return this;
  }

  async getCurrentPage(): Promise<number> {
    return this.results.getCurrentPage();
  }

  async hasError(): Promise<boolean> {
    return this.results.hasError();
  }

  get movieCards(): Locator {
    return this.results.movieCards;
  }

  get noResults(): Locator {
    return this.results.noResults;
  }

  get errorMessage(): Locator {
    return this.results.errorMessage;
  }

  private async waitForContentSettled(): Promise<void> {
    await this.waitForContent([this.results.movieCards, this.results.noResults, this.results.errorMessage]);
  }
}
