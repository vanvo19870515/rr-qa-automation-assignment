import { expect, test, type Page } from '@playwright/test';
import type { HomePage } from '../../../pages/home.page';
import type { TestLogger } from '../../../utils/logger';
import {
  waitForTmdbResponse,
  waitForTmdbResponseByQuery,
} from '../../../utils/network.interceptor';

interface CategorySwitchInput {
  app: HomePage;
  page: Page;
  category: 'Popular' | 'Trend' | 'Newest' | 'Top rated';
  categorySlug: string;
  apiPattern: RegExp;
  log?: TestLogger;
}

interface SearchWithApiInput {
  app: HomePage;
  page: Page;
  query: string;
  matchPattern: string;
  log?: TestLogger;
}

export async function assertCardsRenderedAndFirstTitleVisible(
  app: HomePage,
  log?: TestLogger,
  expectedCount?: number,
): Promise<void> {
  await testStep('Arrange: cards are rendered', async () => {
    const count = await app.cardCount();
    if (typeof expectedCount === 'number') {
      expect(count).toBe(expectedCount);
    } else {
      expect(count).toBeGreaterThan(0);
    }

    const titles = await app.titles();
    expect(titles.length).toBeGreaterThan(0);
    expect(titles[0]?.trim().length ?? 0).toBeGreaterThan(0);
    log?.info(`Cards rendered: ${count}, first title: "${titles[0] ?? ''}"`);
  });
}

export async function assertUiApiCountConsistency(
  app: HomePage,
  expectedCount: number,
  log?: TestLogger,
): Promise<void> {
  await testStep('Assert: UI and API counts are consistent', async () => {
    const uiCount = await app.cardCount();
    expect(uiCount).toBe(expectedCount);
    log?.info(`UI count (${uiCount}) equals API count (${expectedCount})`);
  });
}

export async function assertCategorySwitchChangesContent({
  app,
  page,
  category,
  categorySlug,
  apiPattern,
  log,
}: CategorySwitchInput): Promise<void> {
  const oldTitles = await app.titles();

  await testStep(`Act: switch category to ${category}`, async () => {
    const apiPromise = waitForTmdbResponse(page, apiPattern);
    await app.selectCategory(category);
    const data = await apiPromise;
    expect(data.results.length).toBeGreaterThan(0);
  });

  await testStep('Assert: URL and content changed', async () => {
    await expect(page).toHaveURL(new RegExp(categorySlug));
    const newTitles = await app.titles();
    expect(newTitles.length).toBeGreaterThan(0);
    expect(newTitles).not.toEqual(oldTitles);
    log?.info(`${category} changed listing content`);
  });
}

export async function assertSearchContainsExpectedMatch({
  app,
  page,
  query,
  matchPattern,
  log,
}: SearchWithApiInput): Promise<void> {
  await testStep(`Act: search for "${query}"`, async () => {
    const apiPromise = waitForTmdbResponseByQuery(page, '/search/movie', { query });
    await app.searchByTitle(query);
    const apiData = await apiPromise;
    expect(apiData.results.length).toBeGreaterThan(0);
  });

  await testStep('Assert: UI titles contain expected pattern', async () => {
    const titles = await app.titles();
    assertSearchHasVisibleMatch(titles, matchPattern);
    log?.info(`Search assertion passed for pattern "${matchPattern}"`);
  });
}

export async function assertContentLoaded(app: HomePage): Promise<void> {
  const hasGrid = await app.results.movieCards
    .first()
    .isVisible()
    .catch(() => false);
  const hasEmpty = await app.results.noResults.isVisible().catch(() => false);
  const hasError = await app.results.errorMessage.isVisible().catch(() => false);
  expect(hasGrid || hasEmpty || hasError).toBeTruthy();
}

export async function assertResultsLoaded(app: HomePage, expectedMin = 1): Promise<number> {
  const visibleCards = await app.results.cardCount();
  expect(visibleCards).toBeGreaterThanOrEqual(expectedMin);
  return visibleCards;
}

export function assertSearchHasVisibleMatch(titles: string[], matchPattern: string): void {
  const regex = new RegExp(matchPattern, 'i');
  const hasMatch = titles.some((title) => regex.test(title));
  expect(hasMatch).toBeTruthy();
}

async function testStep(label: string, action: () => Promise<void>): Promise<void> {
  await test.step(label, action);
}
