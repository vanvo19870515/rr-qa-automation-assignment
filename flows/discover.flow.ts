import type { DiscoverPage } from '../pages/discover.page';

interface FilterOptions {
  type?: 'Movie' | 'TV Shows';
  genre?: string;
  yearFrom?: number;
  yearTo?: number;
  rating?: number;
}

/**
 * Business flow — orchestrates multi-step user journeys on DiscoverPage.
 * Tests call flows instead of chaining page actions directly.
 */
export class DiscoverFlow {
  constructor(private readonly page: DiscoverPage) {}

  async applyFilters(options: FilterOptions): Promise<void> {
    if (options.type) await this.page.selectType(options.type);
    if (options.genre) await this.page.selectGenre(options.genre);
    if (options.yearFrom && options.yearTo) {
      await this.page.selectYearRange(options.yearFrom, options.yearTo);
    }
    if (options.rating) await this.page.selectRating(options.rating);
  }

  async navigateToPageAndBack(targetPage: number): Promise<{ startTitles: string[]; endTitles: string[] }> {
    const startTitles = await this.page.titles();
    for (let i = 1; i < targetPage; i++) {
      await this.page.goToNextPage();
    }
    for (let i = targetPage; i > 1; i--) {
      await this.page.goToPreviousPage();
    }
    const endTitles = await this.page.titles();
    return { startTitles, endTitles };
  }

  async switchCategoryAndVerify(category: 'Popular' | 'Trend' | 'Newest' | 'Top rated'): Promise<{
    previousTitles: string[];
    newTitles: string[];
  }> {
    const previousTitles = await this.page.titles();
    await this.page.selectCategory(category);
    const newTitles = await this.page.titles();
    return { previousTitles, newTitles };
  }
}
