import type { APIRequestContext } from '@playwright/test';
import { env } from '../../config/env';
import { ApiClient } from './client/api-client';
import type { TmdbGenreList, TmdbPageResponse } from './models/tmdb.models';
import { assertTmdbGenreList, assertTmdbPageResponse } from './validators/tmdb.validators';

export class TmdbService extends ApiClient {
  constructor(request: APIRequestContext) {
    super(request, env.tmdb.apiBase);
  }

  private withKey(params: Record<string, string | number> = {}): Record<string, string | number> {
    if (env.tmdb.apiKey) {
      return { api_key: env.tmdb.apiKey, ...params };
    }

    return params;
  }

  async popularMovies(page = 1): Promise<TmdbPageResponse> {
    const data = await this.get<TmdbPageResponse>('movie/popular', this.withKey({ page }));
    assertTmdbPageResponse(data, 'popularMovies');
    return data;
  }

  async trendingMovies(page = 1): Promise<TmdbPageResponse> {
    const data = await this.get<TmdbPageResponse>('trending/movie/week', this.withKey({ page }));
    assertTmdbPageResponse(data, 'trendingMovies');
    return data;
  }

  async nowPlayingMovies(page = 1): Promise<TmdbPageResponse> {
    const data = await this.get<TmdbPageResponse>('movie/now_playing', this.withKey({ page }));
    assertTmdbPageResponse(data, 'nowPlayingMovies');
    return data;
  }

  async topRatedMovies(page = 1): Promise<TmdbPageResponse> {
    const data = await this.get<TmdbPageResponse>('movie/top_rated', this.withKey({ page }));
    assertTmdbPageResponse(data, 'topRatedMovies');
    return data;
  }

  async popularTv(page = 1): Promise<TmdbPageResponse> {
    const data = await this.get<TmdbPageResponse>('tv/popular', this.withKey({ page }));
    assertTmdbPageResponse(data, 'popularTv');
    return data;
  }

  async searchMovies(query: string, page = 1): Promise<TmdbPageResponse> {
    const data = await this.get<TmdbPageResponse>('search/movie', this.withKey({ query, page }));
    assertTmdbPageResponse(data, 'searchMovies');
    return data;
  }

  async searchTv(query: string, page = 1): Promise<TmdbPageResponse> {
    const data = await this.get<TmdbPageResponse>('search/tv', this.withKey({ query, page }));
    assertTmdbPageResponse(data, 'searchTv');
    return data;
  }

  async discoverMovies(params: Record<string, string | number> = {}): Promise<TmdbPageResponse> {
    const data = await this.get<TmdbPageResponse>('discover/movie', this.withKey(params));
    assertTmdbPageResponse(data, 'discoverMovies');
    return data;
  }

  async discoverTv(params: Record<string, string | number> = {}): Promise<TmdbPageResponse> {
    const data = await this.get<TmdbPageResponse>('discover/tv', this.withKey(params));
    assertTmdbPageResponse(data, 'discoverTv');
    return data;
  }

  async movieGenres(): Promise<TmdbGenreList> {
    const data = await this.get<TmdbGenreList>('genre/movie/list', this.withKey());
    assertTmdbGenreList(data, 'movieGenres');
    return data;
  }
}
