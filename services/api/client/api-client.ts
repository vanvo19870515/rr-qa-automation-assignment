import type { APIRequestContext } from '@playwright/test';
import { rootLogger } from '../../../utils/logger';

export type QueryParams = Record<string, string | number>;

export abstract class ApiClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly baseUrl: string,
  ) {}

  protected async get<T>(
    endpoint: string,
    params: QueryParams = {},
    validate?: (value: unknown) => T,
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    rootLogger.info(`API GET ${this.sanitize(url)}`);

    const response = await this.request.get(url);
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`API ${response.status()} for ${endpoint}: ${body}`);
    }

    const payload: unknown = await response.json();
    return validate ? validate(payload) : (payload as T);
  }

  private buildUrl(endpoint: string, params: QueryParams): string {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
    ).toString();
    return `${this.baseUrl}/${endpoint}${query ? `?${query}` : ''}`;
  }

  private sanitize(url: string): string {
    return url.replace(/api_key=[^&]+/, 'api_key=***');
  }
}
