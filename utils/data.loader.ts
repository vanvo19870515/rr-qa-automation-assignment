import fs from 'fs';
import path from 'path';

const FIXTURE_DIR = path.join(process.cwd(), 'data', 'fixtures');

export function loadFixture<T>(
  filename: string,
  parse?: (raw: unknown) => T,
): T {
  const fullPath = path.join(FIXTURE_DIR, filename);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const parsed = JSON.parse(content) as unknown;
  if (parse) {
    return parse(parsed);
  }
  return parsed as T;
}
