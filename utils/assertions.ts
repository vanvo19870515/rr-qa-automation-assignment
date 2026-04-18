import { expect } from '@playwright/test';

export function expectWithinRange(value: number, min: number, max: number, context: string): void {
  expect(
    value,
    `${context}: expected ${value} to be between ${min} and ${max}`,
  ).toBeGreaterThanOrEqual(min);
  expect(
    value,
    `${context}: expected ${value} to be between ${min} and ${max}`,
  ).toBeLessThanOrEqual(max);
}

export function assertNoDuplicateTitles(titles: string[]): void {
  const normalized = titles.map((title) => title.trim()).filter((title) => title.length > 0);
  const unique = new Set(normalized);
  expect(
    unique.size,
    `Expected unique visible titles, got duplicates in: ${normalized.join(', ')}`,
  ).toBe(normalized.length);
}
