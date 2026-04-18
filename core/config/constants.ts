/**
 * Shared constants — category mappings, genre IDs, API patterns, selector tokens.
 * Centralised so a single UI change is fixed in one place.
 */

// ── Category tab definitions ──

export interface CategoryDef {
  label: 'Popular' | 'Trend' | 'Newest' | 'Top rated';
  slug: string;
  movieEndpoint: string;
  tvEndpoint: string;
  apiPattern: RegExp;
}

export const CATEGORIES: CategoryDef[] = [
  {
    label: 'Popular',
    slug: 'popular',
    movieEndpoint: 'movie/popular',
    tvEndpoint: 'tv/popular',
    apiPattern: /movie\/popular/,
  },
  {
    label: 'Trend',
    slug: 'trend',
    movieEndpoint: 'trending/movie/week',
    tvEndpoint: 'trending/tv/week',
    apiPattern: /trending\/movie\/week/,
  },
  {
    label: 'Newest',
    slug: 'new',
    movieEndpoint: 'movie/now_playing',
    tvEndpoint: 'tv/on_the_air',
    apiPattern: /movie\/now_playing/,
  },
  {
    label: 'Top rated',
    slug: 'top',
    movieEndpoint: 'movie/top_rated',
    tvEndpoint: 'tv/top_rated',
    apiPattern: /movie\/top_rated/,
  },
];

/** Build a page-specific regex from a category for API interception */
export function apiPatternForPage(cat: CategoryDef, page: number): RegExp {
  const escaped = cat.movieEndpoint.replace(/\//g, '\\/');
  return new RegExp(`${escaped}\\?page=${page}`);
}

// ── TMDB genre IDs (movie) ──

export const GENRE_IDS = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  'Science Fiction': 878,
  'TV Movie': 10770,
  Thriller: 53,
  War: 10752,
  Western: 37,
} as const;

export type GenreName = keyof typeof GENRE_IDS;

// ── API endpoint patterns for interception ──

export const API_PATTERNS = {
  discoverMovie: /discover\/movie/,
  discoverMovieWithGenres: /discover\/movie.*with_genres/,
  searchMovie: /search\/movie/,
  searchTv: /search\/tv/,
  tvPopular: /tv\/popular/,
  moviePopularPage: (n: number) => new RegExp(`movie\\/popular\\?page=${n}`),
  topRatedPage1: /movie\/top_rated\?page=1/,
  paginatedPage: (n: number) => new RegExp(`page=${n}`),
} as const;

// ── Items per page (TMDB default) ──

export const ITEMS_PER_PAGE = 20;

// ── TMDB API hard page cap ──

export const TMDB_MAX_PAGES = 500;

// ── Type filter options ──

export const TYPE_OPTIONS = ['Movie', 'TV Shows'] as const;
export type TypeOption = (typeof TYPE_OPTIONS)[number];
