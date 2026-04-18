import { type Locator, type Response } from '@playwright/test';
import { BasePage } from '../core/driver/base.page';
import { SidebarComponent } from '../components/sidebar.component';
import { PaginationComponent } from '../components/pagination.component';
import { MovieGridComponent } from '../components/movie-grid.component';
import { NavbarComponent } from '../components/navbar.component';

type CategoryLabel = 'Popular' | 'Trend' | 'Newest' | 'Top rated';
type TypeLabel = 'Movie' | 'TV Shows';

/**
 * Page Object for the TMDB Discover SPA.
 * Composes reusable components; contains ONLY actions and state readers.
 */
export class DiscoverPage extends BasePage {
  readonly sidebar: SidebarComponent;
  readonly pagination: PaginationComponent;
  readonly grid: MovieGridComponent;
  readonly navbar: NavbarComponent;

  // Exposed for direct test access
  get searchInput() { return this.navbar.searchInput; }
  get noResults() { return this.grid.noResults; }
  get errorMessage() { return this.grid.errorMessage; }
  get movieCards() { return this.grid.cards; }
  get movieTitles() { return this.grid.titles; }
  get movieMeta() { return this.grid.meta; }
  get paginationPrev() { return this.pagination.previousButton; }
  get paginationNext() { return this.pagination.nextButton; }
  get paginationContainer() { return this.pagination.container; }

  constructor(page: import('@playwright/test').Page) {
    super(page);
    this.sidebar = new SidebarComponent(page);
    this.pagination = new PaginationComponent(page);
    this.grid = new MovieGridComponent(page);
    this.navbar = new NavbarComponent(page);
  }

  protected readyLocator(): Locator {
    return this.grid.cards;
  }

  // ── Navigation ──

  async goto(): Promise<this> {
    return this.navigate('/');
  }

  async gotoDirectSlug(slug: string): Promise<Response | null> {
    return this.navigateRaw(`/${slug}`);
  }

  // ── Category (delegates to navbar + waits) ──

  navLink(name: CategoryLabel): Locator {
    return this.navbar.link(name);
  }

  async selectCategory(name: CategoryLabel): Promise<this> {
    await this.navbar.selectCategory(name);
    await this.waitForContentSettled();
    return this;
  }

  // ── Search (delegates to navbar + waits) ──

  async searchByTitle(query: string): Promise<this> {
    await this.navbar.search(query);
    await this.waitForApiResponse(/\/3\/(search|movie|tv|discover|trending)\//);
    await this.waitForContentSettled();
    return this;
  }

  // ── Sidebar filters (delegates to sidebar + waits) ──

  async selectType(type: TypeLabel): Promise<this> {
    await this.sidebar.selectType(type);
    await this.waitForContentSettled();
    return this;
  }

  async selectGenre(genre: string): Promise<this> {
    await this.sidebar.selectGenre(genre);
    await this.waitForContentSettled();
    return this;
  }

  async selectYearRange(from: number, to: number): Promise<this> {
    await this.sidebar.selectYearRange(from, to);
    await this.waitForContentSettled();
    return this;
  }

  async selectRating(stars: number): Promise<this> {
    await this.sidebar.selectRating(stars);
    await this.waitForContentSettled();
    return this;
  }

  // ── Pagination (delegates to pagination + waits) ──

  async goToNextPage(): Promise<this> {
    await this.pagination.goToNextPage();
    await this.waitForContentSettled();
    return this;
  }

  async goToPreviousPage(): Promise<this> {
    await this.pagination.goToPreviousPage();
    await this.waitForContentSettled();
    return this;
  }

  async goToPage(n: number): Promise<this> {
    await this.pagination.goToPage(n);
    await this.waitForContentSettled();
    return this;
  }

  async getCurrentPage(): Promise<number> {
    return this.pagination.currentPage();
  }

  // ── State readers ──

  async cardCount(): Promise<number> {
    return this.grid.cardCount();
  }

  async titles(): Promise<string[]> {
    return this.grid.allTitles();
  }

  async metaTexts(): Promise<string[]> {
    return this.grid.allMeta();
  }

  async hasResults(): Promise<boolean> {
    return !(await this.grid.noResults.isVisible({ timeout: 3_000 }).catch(() => false));
  }

  async hasError(): Promise<boolean> {
    return this.grid.hasError();
  }

  async hasPagination(): Promise<boolean> {
    return this.pagination.isVisible();
  }

  // ── Private ──

  private async waitForContentSettled(): Promise<void> {
    await this.waitForContent([this.grid.cards, this.grid.noResults, this.grid.errorMessage]);
  }
}
