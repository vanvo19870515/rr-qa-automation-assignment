import { rootLogger } from './logger';

interface RetryOptions {
  attempts?: number;
  delay?: number;
  label?: string;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { attempts = 3, delay = 1_000, label = 'operation' } = options;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (attempt === attempts) {
        rootLogger.error(`${label} failed after ${attempts} attempts: ${message}`);
        throw error;
      }
      rootLogger.warn(`${label} attempt ${attempt}/${attempts} failed — retrying in ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error(`${label} exhausted all ${attempts} attempts`);
}
