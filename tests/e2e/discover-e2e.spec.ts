import { test, expect } from '../../core/driver/base.fixture';
import { API_PATTERNS, TMDB_MAX_PAGES } from '../../config/constants';
import { waitForTmdbResponse, waitForTmdbResponseByQuery } from '../../utils/network.interceptor';

test.describe('End-to-end business journeys @e2e', () => {
  test('E2E01 – Category + filter + pagination flow is consistent', async ({ app, page }) => {
    // Arrange
    await expect(page).toHaveURL(/popular/);

    // Act
    const trendApi = waitForTmdbResponse(page, API_PATTERNS.paginatedPage(1));
    await app.selectCategory('Trend');
    await trendApi;

    await app.selectType('TV Shows');
    await app.selectGenre('Drama');

    const nextPageApi = waitForTmdbResponseByQuery(page, '/discover/tv', { page: '2' });
    await app.goToNextPage();
    const page2Data = await nextPageApi;

    // Assert
    expect(page2Data.page).toBe(2);
    expect(await app.getCurrentPage()).toBe(2);
    expect(await app.cardCount()).toBeGreaterThan(0);
  });

  test('E2E02 – Invalid pagination boundary is defect-guarded', async ({ app, page }) => {
    // Arrange
    await expect(page).toHaveURL(/popular/);

    // Act
    for (let i = 2; i <= 5; i++) {
      await app.goToNextPage();
    }

    // Assert
    const numericButtons = page.locator('[role="button"]').filter({ hasText: /^\d+$/ });
    const values = await numericButtons.allTextContents();
    const maxShown = Math.max(...values.map((v) => Number(v)).filter((n) => !Number.isNaN(n)));
    expect.soft(maxShown).toBeGreaterThan(TMDB_MAX_PAGES);
    test.info().annotations.push({
      type: 'defect',
      description: `DEF-02: UI shows max page ${maxShown}, beyond API cap ${TMDB_MAX_PAGES}`,
    });
  });
});
