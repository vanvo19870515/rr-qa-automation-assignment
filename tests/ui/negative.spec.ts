import { test, expect } from '../../core/driver/base.fixture';
import { waitForTmdbResponseByQuery } from '../../utils/network.interceptor';
import { assertNoDuplicateTitles } from '../../utils/assertions';
import { assertContentLoaded, assertSearchHasVisibleMatch } from './steps/discover.steps';

test.describe('Negative and boundary scenarios @regression', () => {
  test('NEG01 – Search with special characters keeps app stable', async ({ homePage }) => {
    const query = '@@@###$$$';

    // Arrange
    await homePage.searchByTitle(query);

    // Act + Assert
    await assertContentLoaded(homePage);
  });

  test('NEG02 – Excessively long search does not crash UI', async ({ homePage }) => {
    // Arrange
    const longQuery = 'a'.repeat(200);

    // Act
    await homePage.searchByTitle(longQuery);

    // Assert
    const hasGrid = await homePage.results.movieCards
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmpty = await homePage.results.noResults.isVisible().catch(() => false);
    expect(hasGrid || hasEmpty).toBeTruthy();
  });

  test('NEG03 – Invalid year range is handled gracefully', async ({ homePage }) => {
    // Arrange + Act
    await homePage.filters.selectYearRange(2026, 2020);

    // Assert
    const hasGrid = await homePage.results.movieCards
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmpty = await homePage.results.noResults.isVisible().catch(() => false);
    const hasError = await homePage.results.errorMessage.isVisible().catch(() => false);
    expect(hasGrid || hasEmpty || hasError).toBeTruthy();
  });

  test('BVA01 – Pagination next/prev preserves deterministic page state', async ({
    homePage,
    page,
  }) => {
    // Arrange
    const page2Api = waitForTmdbResponseByQuery(page, '/movie/popular', { page: '2' });

    // Act
    await homePage.results.goToNextPage();
    const page2Data = await page2Api;

    // Assert
    expect(page2Data.page).toBe(2);
    expect(await homePage.results.getCurrentPage()).toBe(2);

    await homePage.results.goToPreviousPage();
    expect(await homePage.results.getCurrentPage()).toBe(1);
  });

  test('BVA02 – Search results should not contain duplicate visible titles in first page', async ({
    homePage,
  }) => {
    // Arrange + Act
    await homePage.searchByTitle('Batman');
    const titles = await homePage.results.titles();

    // Assert
    assertSearchHasVisibleMatch(titles, 'batman');
    assertNoDuplicateTitles(titles);
  });
});
