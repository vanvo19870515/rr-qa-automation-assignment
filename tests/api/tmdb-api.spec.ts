import { test, expect } from '../../core/driver/base.fixture';
import { ITEMS_PER_PAGE } from '../../core/config/constants';
import { env } from '../../core/config/env';
import { loadFixture } from '../../utils/data.loader';

interface SearchQuery { query: string; expectedMinResults?: number; matchPattern?: string; }
const searchData = loadFixture('search-queries.json') as { validSearch: SearchQuery };
const hasTmdbApiKey = Boolean(env.tmdb.apiKey);

test.describe('TMDB API Contract Tests @regression', () => {
  test.skip(!hasTmdbApiKey, 'TMDB_API_KEY is not configured');

  test('Popular movies returns valid paginated response', async ({ api }) => {
    const data = await api.popularMovies();
    expect(data.page).toBe(1);
    expect(data.results.length).toBeGreaterThan(0);
    expect(data.results.length).toBeLessThanOrEqual(ITEMS_PER_PAGE);
    expect(data.total_pages).toBeGreaterThan(1);
    expect(data.total_results).toBeGreaterThan(0);
  });

  test('Popular movies page 2 returns different results than page 1', async ({ api }) => {
    const [page1, page2] = await Promise.all([api.popularMovies(1), api.popularMovies(2)]);
    expect(page1.page).toBe(1);
    expect(page2.page).toBe(2);
    expect(page1.results.map((r) => r.id)).not.toEqual(page2.results.map((r) => r.id));
  });

  test('Search returns results for valid query', async ({ api }) => {
    const { query, matchPattern } = searchData.validSearch;
    const data = await api.searchMovies(query);
    expect(data.results.length).toBeGreaterThan(0);
    const hasMatch = data.results.some((r) => new RegExp(matchPattern!, 'i').test(r.title ?? ''));
    expect(hasMatch).toBeTruthy();
  });

  test('Search returns empty for nonexistent query', async ({ api }) => {
    const data = await api.searchMovies('xyz123nonexistent999');
    expect(data.total_results).toBe(0);
    expect(data.results).toHaveLength(0);
  });

  test('Movie genres returns valid genre list', async ({ api }) => {
    const data = await api.movieGenres();
    expect(data.genres.length).toBeGreaterThan(0);
    const action = data.genres.find((g) => g.name === 'Action');
    expect(action).toBeDefined();
    expect(action!.id).toBe(28);
  });

  test('TV popular returns valid response', async ({ api }) => {
    const data = await api.popularTv();
    expect(data.page).toBe(1);
    expect(data.results.length).toBeGreaterThan(0);
  });

  test('Top rated movies returns sorted results', async ({ api }) => {
    const data = await api.topRatedMovies();
    expect(data.results.length).toBeGreaterThan(0);
    const ratings = data.results.map((r) => r.vote_average);
    expect(Math.min(...ratings)).toBeGreaterThan(0);
  });
});
