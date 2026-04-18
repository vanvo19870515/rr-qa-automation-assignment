import fs from 'fs';
import path from 'path';

const FIXTURE_DIRS = [
  path.join(process.cwd(), 'fixtures'),
  path.join(process.cwd(), 'data', 'fixtures'),
];

function resolveFixturePath(filename: string): string {
  for (const dir of FIXTURE_DIRS) {
    const candidate = path.join(dir, filename);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Fixture "${filename}" not found. Checked: ${FIXTURE_DIRS.join(', ')}`);
}

export function loadFixture<T>(filename: string, parse?: (raw: unknown) => T): T {
  const fullPath = resolveFixturePath(filename);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const parsed = JSON.parse(content) as unknown;
  if (parse) {
    return parse(parsed);
  }
  return parsed as T;
}
