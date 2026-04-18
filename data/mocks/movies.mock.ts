import { ITEMS_PER_PAGE } from '../../config/constants';
import type { TmdbPageResponse, TmdbErrorResponse } from '../../services/api/models/tmdb.models';

export const MOCK_TWO_MOVIES: TmdbPageResponse = {
  page: 1,
  total_pages: 1,
  total_results: 2,
  results: [
    {
      id: 99901,
      title: 'Mock Movie Alpha',
      vote_average: 8.5,
      release_date: '2024-06-15',
      genre_ids: [28, 12],
      poster_path: null,
    },
    {
      id: 99902,
      title: 'Mock Movie Beta',
      vote_average: 7.2,
      release_date: '2024-01-01',
      genre_ids: [35],
      poster_path: null,
    },
  ],
};

export const MOCK_EMPTY: TmdbPageResponse = {
  page: 1,
  total_pages: 1,
  total_results: 0,
  results: [],
};

export const MOCK_ERROR: TmdbErrorResponse = {
  status_message: 'Invalid page.',
  status_code: 22,
};

export const MOCK_FULL_PAGE: TmdbPageResponse = {
  page: 1,
  total_pages: 3,
  total_results: 60,
  results: Array.from({ length: ITEMS_PER_PAGE }, (_, i) => ({
    id: 80_000 + i,
    title: `Generated Movie ${i + 1}`,
    vote_average: 6 + (i % 4),
    release_date: '2025-01-01',
    genre_ids: [28],
    poster_path: null,
  })),
};
