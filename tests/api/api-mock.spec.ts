import { test, expect } from '../../core/driver/base.fixture';
import { ITEMS_PER_PAGE } from '../../config/constants';
import { env } from '../../config/env';
import { MOCK_TWO_MOVIES, MOCK_EMPTY, MOCK_ERROR, MOCK_FULL_PAGE } from '../../data/mocks/movies.mock';

test('TC19 – API mock: UI renders stubbed movie data @regression', async ({
  app,
  page,
  log,
}) => {
  await test.step('Stub TMDB movie/popular with mock payload', async () => {
    await page.route(`${env.tmdb.apiBase}/movie/popular**`, (route) => {
      log.info('MOCK: intercepted movie/popular → returning 2 fake movies');
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TWO_MOVIES) });
    });
  });

  await test.step('Navigate and verify mock titles render', async () => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await app.movieCards.first().waitFor({ state: 'visible', timeout: 15_000 });
    const titles = await app.titles();
    expect(titles).toContain('Mock Movie Alpha');
    expect(titles).toContain('Mock Movie Beta');
    expect(titles.length).toBe(MOCK_TWO_MOVIES.results.length);
    log.info(`rendered ${titles.length} mocked cards`);
  });

  await test.step('Verify card count matches mock data exactly', async () => {
    const count = await app.cardCount();
    expect(count).toBe(2);
  });
});

test('TC20 – API mock: empty response shows "No results" @regression', async ({
  app,
  page,
  log,
}) => {
  await test.step('Stub movie/popular with empty results', async () => {
    await page.route(`${env.tmdb.apiBase}/movie/popular**`, (route) => {
      log.info('MOCK: returning empty');
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_EMPTY) });
    });
  });

  await test.step('Navigate and verify empty state', async () => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(app.noResults).toBeVisible({ timeout: 15_000 });
    log.info('"No results found." displayed for empty mock');
  });
});

test('TC21 – API mock: server error shows error state @regression', async ({
  app,
  page,
  log,
}) => {
  await test.step('Stub movie/popular with 422 error', async () => {
    await page.route(`${env.tmdb.apiBase}/movie/popular**`, (route) => {
      log.info('MOCK: returning 422');
      return route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify(MOCK_ERROR) });
    });
  });

  await test.step('Navigate and verify error state', async () => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(app.errorMessage).toBeVisible({ timeout: 15_000 });
    log.info('error state displayed for 422 mock');
  });
});

test('TC22 – API mock: exactly 20 items renders correct card count @smoke', async ({
  app,
  page,
  log,
}) => {
  await test.step('Stub with exactly 20 items', async () => {
    await page.route(`${env.tmdb.apiBase}/movie/popular**`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_FULL_PAGE) }),
    );
  });

  await test.step('Verify card count equals ITEMS_PER_PAGE', async () => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await app.movieCards.first().waitFor({ state: 'visible', timeout: 15_000 });
    const count = await app.cardCount();
    expect(count).toBe(ITEMS_PER_PAGE);
    log.info(`${count} cards from mock == ITEMS_PER_PAGE`);
  });
});
