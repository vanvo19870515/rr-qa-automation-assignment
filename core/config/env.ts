import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

type Environment = 'dev' | 'staging' | 'prod';

const testEnv = (process.env.TEST_ENV ?? 'prod') as Environment;
const envDir = path.join(process.cwd(), 'testdata', 'environments');
const envFile = path.join(envDir, `${testEnv}.env`);

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
}
dotenv.config();

const REQUIRED_ENV_VARS: string[] = [];

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Copy .env.example → .env and fill in the values.`,
    );
  }
}

export const env = {
  environment: testEnv,
  baseUrl: process.env.BASE_URL ?? 'https://tmdb-discover.surge.sh',

  tmdb: {
    apiBase: process.env.TMDB_API_BASE ?? 'https://api.themoviedb.org/3',
    apiKey: process.env.TMDB_API_KEY!,
    imageBase: 'https://image.tmdb.org/t/p/original',
  },

  timeouts: {
    navigation: 45_000,
    action: 15_000,
    api: 30_000,
    contentVisible: 30_000,
    contentSettle: 10_000,
  },

  retries: {
    navigation: 3,
    navigationBackoff: 3_000,
  },
} as const;
