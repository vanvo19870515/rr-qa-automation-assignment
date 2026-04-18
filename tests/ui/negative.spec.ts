import { test, expect } from '../../core/driver/base.fixture';
import { waitForTmdbResponse } from '../../utils/network.interceptor';
import { assertNoDuplicateTitles } from '../../utils/assertions';

test.describe('Negative and boundary scenarios @regression', () => {
  test('NEG01 – Search with special characters keeps app stable', async ({ homePage, page }) => {
    const query = '@@@###$$$';
    await homePage.searchByTitle(query);
    await page.waitForLoadState('networkidle');
    await expect(homePage.results.movieCards.first()).toBeVisible({ timeout: 15_000 });
  });

  test('NEG02 – Excessively long search does not crash UI', async ({ homePage, page }) => {
    const longQuery = 'a'.repeat(200);
    await homePage.searchByTitle(longQuery);
    await page.waitForLoadState('networkidle');
    const hasGrid = await homePage.results.movieCards.first().isVisible().catch(() => false);
    const hasEmpty = await homePage.results.noResults.isVisible().catch(() => false);
    expect(hasGrid || hasEmpty).toBeTruthy();
  });

  test('NEG03 – Invalid year range is handled gracefully', async ({ homePage, page }) => {
    await homePage.filters.selectYearRange(2026, 2020);
    await page.waitForLoadState('networkidle');
    const hasGrid = await homePage.results.movieCards.first().isVisible().catch(() => false);
    const hasEmpty = await homePage.results.noResults.isVisible().catch(() => false);
    const hasError = await homePage.results.errorMessage.isVisible().catch(() => false);
    expect(hasGrid || hasEmpty || hasError).toBeTruthy();
  });

  test('BVA01 – Pagination next/prev preserves deterministic page state', async ({ homePage, page }) => {
    const page2Api = waitForTmdbResponse(page, /movie\/popular\?page=2/);
    await homePage.results.goToNextPage();
    const page2Data = await page2Api;
    expect(page2Data.page).toBe(2);
    expect(await homePage.results.getCurrentPage()).toBe(2);

    await homePage.results.goToPreviousPage();
    expect(await homePage.results.getCurrentPage()).toBe(1);
  });

  test('BVA02 – Search results should not contain duplicate visible titles in first page', async ({
    homePage,
  }) => {
    await homePage.searchByTitle('Batman');
    const titles = await homePage.results.titles();
    assertNoDuplicateTitles(titles);
  });
});
