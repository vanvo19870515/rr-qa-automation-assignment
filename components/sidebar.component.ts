import type { Page, Locator } from '@playwright/test';
import { logger } from '../core/logger/logger';

/**
 * Reusable sidebar component — Type, Genre, Year range, Rating.
 * Encapsulates react-select interaction and rc-rate star clicks.
 */
export class SidebarComponent {
  private readonly sidebar: Locator;

  constructor(private readonly page: Page) {
    this.sidebar = page.locator('aside');
  }

  async selectType(type: string): Promise<void> {
    await this.openReactSelect(0);
    await this.pickOption(type);
    logger.info(`Type → ${type}`);
  }

  async selectGenre(genre: string): Promise<void> {
    await this.openReactSelect(1);
    await this.pickOption(genre);
    logger.info(`Genre → ${genre}`);
  }

  async selectYearRange(from: number, to: number): Promise<void> {
    await this.openReactSelect(2);
    await this.input(2).fill(String(from));
    await this.pickOption(String(from));

    await this.openReactSelect(3);
    await this.input(3).fill(String(to));
    await this.pickOption(String(to));
    logger.info(`Year → ${from}–${to}`);
  }

  async selectRating(stars: number): Promise<void> {
    const radios = this.sidebar.locator('[role="radio"]');
    const count = await radios.count();
    if (count > 0) {
      await radios.nth(Math.min(stars, count) - 1).click();
    }
    logger.info(`Rating → ${stars}★ & up`);
  }

  private input(index: number): Locator {
    return this.sidebar.locator('input').nth(index);
  }

  private async openReactSelect(index: number): Promise<void> {
    await this.input(index).click({ force: true });
    await this.page
      .locator('[class*="menu"]')
      .first()
      .waitFor({ state: 'visible', timeout: 3_000 })
      .catch(() => {});
  }

  private async pickOption(text: string): Promise<void> {
    await this.page.locator('[class*="option"]').filter({ hasText: text }).first().click();
  }
}
