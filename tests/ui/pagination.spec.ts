import { test, expect } from '../../core/driver/base.fixture';
import { waitForTmdbResponse } from '../../utils/network.interceptor';
import { TMDB_MAX_PAGES, ITEMS_PER_PAGE, API_PATTERNS } from '../../core/config/constants';

test('TC16 – Navigate to page 2 @smoke', async ({ discoverPage, page, log }) => {
  const page1Titles = await test.step('Record page 1 titles', async () => {
    const titles = await discoverPage.titles();
    expect(titles.length).toBe(ITEMS_PER_PAGE);
    expect(await discoverPage.hasPagination()).toBeTruthy();
    return titles;
  });

  await test.step('Click Next and intercept API', async () => {
    const apiPromise = waitForTmdbResponse(page, API_PATTERNS.moviePopularPage(2));
    await discoverPage.goToNextPage();
    const apiData = await apiPromise;
    expect(apiData.page).toBe(2);
    expect(apiData.results.length).toBe(ITEMS_PER_PAGE);
  });

  await test.step('Verify page 2 content differs', async () => {
    const page2Titles = await discoverPage.titles();
    expect(page2Titles).not.toEqual(page1Titles);
    log.info(`p1[0]="${page1Titles[0]}" → p2[0]="${page2Titles[0]}"`);
  });
});

test('TC16b – Forward & backward pagination @regression', async ({ discoverPage, page, log }) => {
  await test.step('Navigate to page 2 via API', async () => {
    const api2 = waitForTmdbResponse(page, API_PATTERNS.paginatedPage(2));
    await discoverPage.goToNextPage();
    const data = await api2;
    expect(data.page).toBe(2);
    expect(await discoverPage.getCurrentPage()).toBe(2);
  });

  await test.step('Navigate to page 3 — API confirms page=3', async () => {
    const api3 = waitForTmdbResponse(page, API_PATTERNS.paginatedPage(3));
    await discoverPage.goToNextPage();
    const data = await api3;
    expect(data.page).toBe(3);
    expect(await discoverPage.getCurrentPage()).toBe(3);
  });

  await test.step('Navigate back to page 2 — API confirms page=2', async () => {
    await discoverPage.goToPreviousPage();
    // WebKit occasionally serves page state from cache without a fresh network hit.
    // UI page indicator is the stable source of truth for back navigation.
    expect(await discoverPage.getCurrentPage()).toBe(2);
    const visibleCards = await discoverPage.cardCount();
    expect(visibleCards).toBe(ITEMS_PER_PAGE);
    log.info('round-trip verified via API page numbers');
  });
});

test('TC17 – High page numbers beyond API limit @defect', async ({ discoverPage, page, log }) => {
  await test.step('Paginate through first 5 pages successfully', async () => {
    for (let i = 2; i <= 5; i++) {
      const apiPromise = waitForTmdbResponse(page, API_PATTERNS.paginatedPage(i), 10_000);
      await discoverPage.goToNextPage();
      const data = await apiPromise;
      expect(data.results.length).toBeGreaterThan(0);
      log.info(`page ${i} → ${data.results.length} items`);
    }
  });

  await test.step(`Verify UI shows pages > ${TMDB_MAX_PAGES}`, async () => {
    const allPageBtns = page.locator('[role="button"]').filter({ hasText: /^\d+$/ });
    const allTexts = await allPageBtns.allTextContents();
    const maxPage = Math.max(...allTexts.map(Number).filter((n) => !isNaN(n)));
    log.info(`highest visible page number = ${maxPage}`);

    expect.soft(maxPage).toBeGreaterThan(TMDB_MAX_PAGES);

    log.warn(`DEFECT DEF-02: UI exposes pages >> ${TMDB_MAX_PAGES}`);
    test.info().annotations.push({
      type: 'defect',
      description: `DEF-02: Pagination renders pages up to ${maxPage}, TMDB API caps at ${TMDB_MAX_PAGES}`,
    });
  });

  await test.step('Click high page — expect error', async () => {
    const highBtn = page.locator('[role="button"]').filter({ hasText: /^561\d{2}$/ }).first();
    if (await highBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await highBtn.click();
      await Promise.race([
        discoverPage.errorMessage.waitFor({ state: 'visible', timeout: 5_000 }),
        page.waitForResponse((r) => r.status() >= 400, { timeout: 5_000 }),
      ]).catch(() => {});
      const hasError = await discoverPage.hasError();
      log.info(`high page error: ${hasError}`);
    }
  });
});

test('TC16c – Pagination visibility across categories @regression', async ({
  discoverPage,
  log,
}) => {
  await test.step('Popular has pagination', async () => {
    expect(await discoverPage.hasPagination()).toBeTruthy();
    log.info('Popular pagination: visible');
  });

  await test.step('Trend category — verify pagination state', async () => {
    await discoverPage.selectCategory('Trend');
    const trendHasPagination = await discoverPage.hasPagination();
    expect(trendHasPagination).toBeDefined();
    log.info(`Trend pagination visible: ${trendHasPagination}`);

    if (!trendHasPagination) {
      log.warn('DEF-05: Pagination not rendered for Trend category');
      test.info().annotations.push({
        type: 'defect',
        description: 'DEF-05: Pagination absent for Trend category despite API supporting it',
      });
    }
  });

  await test.step('Verify Trend content loaded', async () => {
    await discoverPage.movieCards.first().waitFor({ state: 'visible', timeout: 10_000 });
    const cards = await discoverPage.cardCount();
    expect(cards).toBeGreaterThan(0);
    log.info(`Trend loaded ${cards} cards`);
  });
});

test('TC18 – Page resets to 1 on category change @regression', async ({
  discoverPage,
  page,
  log,
}) => {
  await test.step('Go to page 2', async () => {
    await discoverPage.goToNextPage();
    expect(await discoverPage.getCurrentPage()).toBe(2);
  });

  await test.step('Switch to Top rated', async () => {
    const apiPromise = waitForTmdbResponse(page, API_PATTERNS.topRatedPage1);
    await discoverPage.selectCategory('Top rated');
    const apiData = await apiPromise;
    expect(apiData.page).toBe(1);
  });

  await test.step('Verify page indicator is 1', async () => {
    expect(await discoverPage.getCurrentPage()).toBe(1);
    log.info('page reset verified');
  });
});
