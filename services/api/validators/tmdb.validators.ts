import type { TmdbGenreList, TmdbPageResponse } from '../models/tmdb.models';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function assertTmdbPageResponse(payload: unknown, context: string): asserts payload is TmdbPageResponse {
  if (!isObject(payload)) {
    throw new Error(`[schema:${context}] response is not an object`);
  }

  const { page, total_pages, total_results, results } = payload;
  if (typeof page !== 'number' || typeof total_pages !== 'number' || typeof total_results !== 'number') {
    throw new Error(`[schema:${context}] invalid pagination fields`);
  }

  if (!Array.isArray(results)) {
    throw new Error(`[schema:${context}] results is not an array`);
  }
}

export function assertTmdbGenreList(payload: unknown, context: string): asserts payload is TmdbGenreList {
  if (!isObject(payload) || !Array.isArray(payload.genres)) {
    throw new Error(`[schema:${context}] genres is missing or invalid`);
  }
}
