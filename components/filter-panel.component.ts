import type { Locator, Page } from '@playwright/test';
import { rootLogger } from '../utils/logger';
import { SELECTORS } from '../config/selectors';

/**
 * Filter panel component encapsulates Type, Genre, Year and Rating controls.
 */
export class FilterPanelComponent {
  private readonly panel: Locator;

  constructor(private readonly page: Page) {
    this.panel = page.locator(SELECTORS.filterPanel.container);
  }

  async selectType(type: 'Movie' | 'TV Shows'): Promise<void> {
    await this.openReactSelect(0);
    await this.pickOption(type);
    rootLogger.info(`Filter type selected: ${type}`);
  }

  async selectGenre(genre: string): Promise<void> {
    await this.openReactSelect(1);
    await this.pickOption(genre);
    rootLogger.info(`Filter genre selected: ${genre}`);
  }

  async selectYearRange(fromYear: number, toYear: number): Promise<void> {
    await this.openReactSelect(2);
    await this.input(2).fill(String(fromYear));
    await this.pickOption(String(fromYear));

    await this.openReactSelect(3);
    await this.input(3).fill(String(toYear));
    await this.pickOption(String(toYear));
    rootLogger.info(`Filter year range selected: ${fromYear}-${toYear}`);
  }

  async selectRating(minStars: number): Promise<void> {
    const starButtons = this.panel.locator(SELECTORS.filterPanel.ratingOption);
    const totalStars = await starButtons.count();
    if (totalStars > 0) {
      await starButtons.nth(Math.min(minStars, totalStars) - 1).click();
    }
    rootLogger.info(`Filter minimum rating selected: ${minStars} stars`);
  }

  private input(index: number): Locator {
    return this.panel.locator(SELECTORS.filterPanel.genericInput).nth(index);
  }

  private async openReactSelect(index: number): Promise<void> {
    await this.input(index).click({ force: true });
    await this.page
      .locator(SELECTORS.filterPanel.menu)
      .first()
      .waitFor({ state: 'visible', timeout: 3_000 })
      .catch(() => {});
  }

  private async pickOption(text: string): Promise<void> {
    await this.page.locator(SELECTORS.filterPanel.option).filter({ hasText: text }).first().click();
  }
}
