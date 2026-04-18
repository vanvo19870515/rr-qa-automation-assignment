import { type Page, type Locator, type Response } from '@playwright/test';
import { env } from '../../config/env';
import { rootLogger } from '../../utils/logger';
import { retry } from '../../utils/retry.helper';

/**
 * Abstract base for every Page Object.
 *
 * Provides:
 *  - Retry-aware navigation with configurable backoff
 *  - Generic smart waits (no fixed sleeps)
 *
 * Concrete pages implement `readyLocator()` to declare
 * what "content loaded" means for that page.
 */
export abstract class BasePage {
  constructor(readonly page: Page) {}

  protected abstract readyLocator(): Locator;

  async navigate(path = '/'): Promise<this> {
    await retry(
      async () => {
        await this.page.goto(path, {
          waitUntil: 'domcontentloaded',
          timeout: env.timeouts.navigation,
        });
        await this.readyLocator().first().waitFor({
          state: 'visible',
          timeout: env.timeouts.contentVisible,
        });
      },
      {
        attempts: env.retries.navigation,
        delay: env.retries.navigationBackoff,
        label: `navigate(${path})`,
      },
    );
    rootLogger.info(`Navigated to ${path}`);
    return this;
  }

  async navigateRaw(path: string): Promise<Response | null> {
    const res = await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    rootLogger.info(`Direct → ${path} | status ${res?.status()}`);
    return res;
  }

  protected async waitForApiResponse(pattern: RegExp): Promise<void> {
    await this.page
      .waitForResponse((res) => pattern.test(res.url()) && res.status() < 500, {
        timeout: env.timeouts.contentSettle,
      })
      .catch(() => {});
  }

  protected async waitForContent(
    contentLocators: Locator[],
    timeout = env.timeouts.contentSettle,
  ): Promise<void> {
    await Promise.race(
      contentLocators.map((loc) => loc.first().waitFor({ state: 'visible', timeout })),
    ).catch(() => {});
  }
}
