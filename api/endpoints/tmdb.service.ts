import type { APIRequestContext } from '@playwright/test';
import { BaseApiClient } from '../clients/api.client';
import type { TmdbPageResponse, TmdbGenreList } from './tmdb.models';
import { env } from '../../core/config/env';
import { logger } from '../../core/logger/logger';

export class TmdbService extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request, env.tmdb.apiBase);
  }

  private withKey(
    params: Record<string, string | number> = {},
  ): Record<string, string | number> {
    if (env.tmdb.apiKey) {
      return { api_key: env.tmdb.apiKey, ...params };
    }

    logger.warn('TMDB_API_KEY is not set. API tests may fail while UI tests still run.');
    return params;
  }

  popularMovies(page = 1): Promise<TmdbPageResponse> {
    return this.get('movie/popular', this.withKey({ page }));
  }

  trendingMovies(page = 1): Promise<TmdbPageResponse> {
    return this.get('trending/movie/week', this.withKey({ page }));
  }

  nowPlayingMovies(page = 1): Promise<TmdbPageResponse> {
    return this.get('movie/now_playing', this.withKey({ page }));
  }

  topRatedMovies(page = 1): Promise<TmdbPageResponse> {
    return this.get('movie/top_rated', this.withKey({ page }));
  }

  popularTv(page = 1): Promise<TmdbPageResponse> {
    return this.get('tv/popular', this.withKey({ page }));
  }

  searchMovies(query: string, page = 1): Promise<TmdbPageResponse> {
    return this.get('search/movie', this.withKey({ query, page }));
  }

  searchTv(query: string, page = 1): Promise<TmdbPageResponse> {
    return this.get('search/tv', this.withKey({ query, page }));
  }

  discoverMovies(params: Record<string, string | number> = {}): Promise<TmdbPageResponse> {
    return this.get('discover/movie', this.withKey(params));
  }

  discoverTv(params: Record<string, string | number> = {}): Promise<TmdbPageResponse> {
    return this.get('discover/tv', this.withKey(params));
  }

  movieGenres(): Promise<TmdbGenreList> {
    return this.get('genre/movie/list', this.withKey());
  }
}
