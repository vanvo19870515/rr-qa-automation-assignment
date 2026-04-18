import type { APIRequestContext } from '@playwright/test';
import { logger } from '../../core/logger/logger';

/**
 * Generic API client — wraps Playwright's APIRequestContext with
 * logging, error handling, and URL building.
 * Concrete services extend this class and define domain endpoints.
 */
export abstract class BaseApiClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly baseUrl: string,
  ) {}

  protected async get<T>(
    endpoint: string,
    params: Record<string, string | number> = {},
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    logger.info(`API → GET ${this.sanitise(url)}`);

    const res = await this.request.get(url);
    if (!res.ok()) {
      const body = await res.text();
      throw new Error(`API ${res.status()} for ${endpoint}: ${body}`);
    }

    const json = (await res.json()) as T;
    logger.info(`API ← ${res.status()} ${endpoint}`);
    return json;
  }

  protected async post<T>(
    endpoint: string,
    body: Record<string, unknown>,
    params: Record<string, string | number> = {},
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    logger.info(`API → POST ${this.sanitise(url)}`);

    const res = await this.request.post(url, { data: body });
    if (!res.ok()) {
      const text = await res.text();
      throw new Error(`API ${res.status()} for POST ${endpoint}: ${text}`);
    }

    const json = (await res.json()) as T;
    logger.info(`API ← ${res.status()} ${endpoint}`);
    return json;
  }

  private buildUrl(endpoint: string, params: Record<string, string | number>): string {
    const searchParams = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    );
    const qs = searchParams.toString();
    return `${this.baseUrl}/${endpoint}${qs ? `?${qs}` : ''}`;
  }

  private sanitise(url: string): string {
    return url.replace(/api_key=[^&]+/, 'api_key=***');
  }
}
