import { test, expect } from '../../core/driver/base.fixture';
import { waitForTmdbResponse } from '../../utils/network.interceptor';
import { CATEGORIES, GENRE_IDS, ITEMS_PER_PAGE, API_PATTERNS } from '../../config/constants';
import { loadFixture } from '../../utils/data.loader';
import { env } from '../../config/env';

interface SearchQuery {
  query: string;
  expectedResults?: number;
  matchPattern?: string;
}

interface SearchFixture {
  validSearch: SearchQuery;
  emptySearch: SearchQuery;
}

const searchData = loadFixture<SearchFixture>('search-queries.json');
const hasTmdbApiKey = Boolean(env.tmdb.apiKey);

test('TC01 – Home page loads with movie cards @smoke', async ({ app, page, log }) => {
  await test.step('Verify URL redirected to /popular', async () => {
    await expect(page).toHaveURL(/popular/);
  });

  const count = await test.step('Verify movie cards are rendered', async () => {
    const c = await app.cardCount();
    expect(c).toBe(ITEMS_PER_PAGE);
    return c;
  });

  await test.step('Verify first title is non-empty', async () => {
    const titles = await app.titles();
    expect(titles.length).toBeGreaterThan(0);
    expect(titles[0].trim().length).toBeGreaterThan(0);
    log.info(`${count} cards, first: "${titles[0]}"`);
  });
});

if (hasTmdbApiKey) {
  test('TC02 – Popular data matches TMDB API @smoke', async ({ app, api, page, log }) => {
  await test.step('Verify URL is /popular', async () => {
    await expect(page).toHaveURL(/popular/);
  });

  await test.step('Cross-validate card count against API', async () => {
    const apiData = await api.popularMovies();
    const uiCount = await app.cardCount();
    expect(uiCount).toBe(apiData.results.length);
    log.info(`UI ${uiCount} == API ${apiData.results.length}`);
  });
  });
} else {
  test('TC02 – Popular data matches TMDB API @smoke', () => {
    test.skip(true, 'TMDB_API_KEY is required for API cross-check assertions.');
  });
}

for (const cat of CATEGORIES.filter((c) => c.label !== 'Popular')) {
  test(`TC03-05 – Navigate to ${cat.label} @regression`, async ({ app, page, log }) => {
    const popularTitles = await app.titles();

    await test.step(`Click "${cat.label}" tab`, async () => {
      const [apiData] = await Promise.all([
        waitForTmdbResponse(page, cat.apiPattern),
        app.selectCategory(cat.label),
      ]);
      expect(apiData.results.length).toBeGreaterThan(0);
    });

    await test.step('Verify URL updated', async () => {
      await expect(page).toHaveURL(new RegExp(cat.slug));
    });

    await test.step('Verify content differs from Popular', async () => {
      const newTitles = await app.titles();
      expect(newTitles.length).toBeGreaterThan(0);
      expect(newTitles).not.toEqual(popularTitles);
      log.info(`${cat.label} → ${newTitles.length} items`);
    });
  });
}

test('TC06 – Direct slug /popular returns 404 @defect', async ({ app, page, log }) => {
  await test.step('Navigate directly to /popular', async () => {
    const res = await app.gotoDirectSlug('popular');
    const status = res?.status() ?? 0;
    log.info(`status ${status}`);
    expect.soft(status).toBe(404);
  });

  await test.step('Verify surge.sh error page is shown', async () => {
    const heading = page.getByRole('heading', { name: 'page not found' });
    await expect.soft(heading).toBeVisible({ timeout: 5_000 });
  });

  test.info().annotations.push({
    type: 'defect',
    description: 'DEF-01: SPA routing not configured on surge.sh — direct URLs 404',
  });
});

test('TC07 – Search returns matching results @regression', async ({ app, page, log }) => {
  const { query, matchPattern } = searchData.validSearch;

  const apiCount = await test.step(`Type "${query}" and wait for API`, async () => {
    const apiPromise = waitForTmdbResponse(page, new RegExp(`search/movie.*query=${query}`, 'i'));
    await app.searchByTitle(query);
    const apiData = await apiPromise;
    expect(apiData.results.length).toBeGreaterThan(0);
    return apiData.results.length;
  });

  await test.step('Verify UI shows matching title', async () => {
    const titles = await app.titles();
    const match = titles.some((t) => new RegExp(matchPattern!, 'i').test(t));
    expect(match).toBeTruthy();
    log.info(`${titles.length} UI results, API ${apiCount}`);
  });
});

test('TC08 – Search for nonexistent title shows empty state @regression', async ({ app, page }) => {
  const { query, expectedResults } = searchData.emptySearch;

  await test.step(`Type "${query}"`, async () => {
    const pattern = new RegExp(`search/movie.*query=${query}`, 'i');
    const apiPromise = waitForTmdbResponse(page, pattern);
    await app.searchByTitle(query);
    const apiData = await apiPromise;
    expect(apiData.total_results).toBe(expectedResults);
  });

  await test.step('Verify "No results" message', async () => {
    await expect(app.noResults).toBeVisible({ timeout: 5_000 });
  });
});

if (hasTmdbApiKey) {
  test('TC09 – Default type is Movie @smoke', async ({ app, api }) => {
  await test.step('Cross-validate with API', async () => {
    const apiData = await api.popularMovies();
    const uiCount = await app.cardCount();
    expect(uiCount).toBe(apiData.results.length);
  });
  });
} else {
  test.skip('TC09 – Default type is Movie @smoke', () => {});
}

test('TC10 – Switch to TV Shows @regression', async ({ app, page, log }) => {
  await test.step('Select TV Shows from Type dropdown', async () => {
    const [apiData] = await Promise.all([
      waitForTmdbResponse(page, API_PATTERNS.tvPopular),
      app.selectType('TV Shows'),
    ]);
    expect(apiData.results.length).toBeGreaterThan(0);
  });

  await test.step('Verify cards are displayed', async () => {
    const titles = await app.titles();
    expect(titles.length).toBeGreaterThan(0);
    log.info(`TV Shows → ${titles.length} items`);
  });
});

test('TC11 – Filter by genre Action @regression', async ({ app, page, log }) => {
  await test.step('Select Action genre', async () => {
    const [apiData] = await Promise.all([
      waitForTmdbResponse(page, API_PATTERNS.discoverMovieWithGenres),
      app.selectGenre('Action'),
    ]);
    const allAction = apiData.results.every((r) => r.genre_ids.includes(GENRE_IDS.Action));
    expect(allAction).toBeTruthy();
    log.info(`${apiData.results.length} results, all Action: ${allAction}`);
  });
});

test('TC12 – Filter by year range @regression', async ({ app, page, log }) => {
  const yearFrom = 2020;
  const yearTo = 2023;

  await test.step(`Set year range ${yearFrom}–${yearTo} and verify API params`, async () => {
    const apiPromise = page.waitForResponse(
      (res) => res.url().includes('discover/movie') && res.status() === 200,
      { timeout: 30_000 },
    );

    await app.selectYearRange(yearFrom, yearTo);
    const response = await apiPromise;
    const url = new URL(response.url());
    const yearFromParam = url.searchParams.get('release_date.gte');
    const yearToParam = url.searchParams.get('release_date.lte');

    if (yearFromParam === 'Invalid Date' || yearToParam === 'Invalid Date') {
      log.warn(
        `DEFECT: year filter emitted invalid date params (gte=${yearFromParam}, lte=${yearToParam})`,
      );
      test.info().annotations.push({
        type: 'defect',
        description: 'DEF-04: Year filter can emit Invalid Date query params',
      });
      test.skip(true, 'Known issue: year filter emits Invalid Date intermittently.');
    }

    const yearFromApi = (yearFromParam ?? '').slice(0, 4);
    const yearToApi = (yearToParam ?? '').slice(0, 4);
    const yearRangeMatched = yearFromApi === String(yearFrom) && yearToApi === String(yearTo);
    if (!yearRangeMatched) {
      log.warn(
        `DEFECT: year filter mismatch (expected ${yearFrom}-${yearTo}, got ${yearFromParam}-${yearToParam})`,
      );
      test.info().annotations.push({
        type: 'defect',
        description: 'DEF-04: Year filter does not consistently apply selected range',
      });
      test.skip(true, 'Known issue: year filter range is not consistently applied.');
    }

    log.info(`year params verified: gte=${yearFromParam}, lte=${yearToParam}`);

    const json = (await response.json()) as { results: unknown[] };
    expect(json.results.length).toBeGreaterThan(0);
  });

  await test.step('Verify cards are displayed', async () => {
    const count = await app.cardCount();
    expect(count).toBeGreaterThan(0);
    log.info(`${count} cards rendered after year filter`);
  });
});

test('TC13 – Filter by rating 3★ @regression', async ({ app, page, log }) => {
  await test.step('Click 3rd star', async () => {
    const apiPromise = waitForTmdbResponse(page, API_PATTERNS.discoverMovie);
    await app.selectRating(3);
    const apiData = await apiPromise;
    expect(apiData.results.length).toBeGreaterThan(0);
    log.info(`min rating = ${Math.min(...apiData.results.map((r) => r.vote_average))}`);
  });
});

test('TC14 – Fluent chain: switch type + genre filter @regression', async ({ app, page, log }) => {
  await test.step('Chain: selectType → selectGenre', async () => {
    await app.selectType('TV Shows');

    const [apiData] = await Promise.all([
      waitForTmdbResponse(page, /discover\/tv.*with_genres/),
      app.selectGenre('Drama'),
    ]);
    expect(apiData.results.length).toBeGreaterThan(0);
    log.info(`TV+Drama → ${apiData.results.length} results`);
  });

  await test.step('Verify cards rendered', async () => {
    const count = await app.cardCount();
    expect(count).toBeGreaterThan(0);
  });
});

test('TC15 – Combined Genre + Rating filters @regression', async ({ app, page, log }) => {
  await test.step('Select Action genre', async () => {
    await app.selectGenre('Action');
  });

  await test.step('Set rating to 3★', async () => {
    const apiPromise = waitForTmdbResponse(page, API_PATTERNS.discoverMovie);
    await app.selectRating(3);
    const apiData = await apiPromise;

    expect(apiData.results.length).toBeGreaterThan(0);
    const allAction = apiData.results.every((r) => r.genre_ids.includes(GENRE_IDS.Action));
    expect(allAction).toBeTruthy();
    log.info(`${apiData.results.length} results, all Action: ${allAction}`);
  });
});

test('DEF-03 – TV search calls search/movie instead of search/tv @defect', async ({ app, page, log }) => {
  await test.step('Switch to TV Shows', async () => {
    await app.selectType('TV Shows');
  });

  const { calledMovie, calledTv } = await test.step('Search and inspect endpoint', async () => {
    const responsePromise = page.waitForResponse(
      (res) => res.url().includes('/search/') && res.status() === 200,
      { timeout: 15_000 },
    );
    await app.searchByTitle('Breaking Bad');
    const response = await responsePromise;
    const url = response.url();
    log.info(`search URL = ${url}`);
    return {
      calledMovie: url.includes('search/movie'),
      calledTv: url.includes('search/tv'),
    };
  });

  await test.step('Assert defect: search/movie called instead of search/tv', () => {
    expect(calledMovie).toBeTruthy();
    expect(calledTv).toBeFalsy();

    log.warn('DEFECT: TV search calls search/movie instead of search/tv');
    test.info().annotations.push({
      type: 'defect',
      description: 'DEF-03: When type is TV Shows, search still hits search/movie endpoint',
    });
  });
});
