import type { Page } from '@playwright/test';
import { BasePage } from '../core/driver/base.page';
import { FilterPanelComponent } from '../components/filter-panel.component';

export class FilterPanelPage extends BasePage {
  readonly panel: FilterPanelComponent;

  constructor(page: Page) {
    super(page);
    this.panel = new FilterPanelComponent(page);
  }

  protected readyLocator() {
    return this.page.locator('aside');
  }

  async chooseType(type: 'Movie' | 'TV Shows'): Promise<this> {
    await this.panel.selectType(type);
    return this;
  }

  async selectType(type: 'Movie' | 'TV Shows'): Promise<this> {
    return this.chooseType(type);
  }

  async chooseGenre(genre: string): Promise<this> {
    await this.panel.selectGenre(genre);
    return this;
  }

  async selectGenre(genre: string): Promise<this> {
    return this.chooseGenre(genre);
  }

  async chooseYearRange(from: number, to: number): Promise<this> {
    await this.panel.selectYearRange(from, to);
    return this;
  }

  async selectYearRange(from: number, to: number): Promise<this> {
    return this.chooseYearRange(from, to);
  }

  async chooseRating(stars: number): Promise<this> {
    await this.panel.selectRating(stars);
    return this;
  }

  async selectRating(stars: number): Promise<this> {
    return this.chooseRating(stars);
  }
}
