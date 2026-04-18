import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'testdata', 'fixtures');

export function loadFixture(filename: string): unknown {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as unknown;
}
