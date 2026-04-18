import fs from 'fs';
import path from 'path';
import type { TestInfo } from '@playwright/test';

const REPORTS_ROOT = path.join(process.cwd(), 'reports');
const REPORT_LOG_DIR = path.join(REPORTS_ROOT, 'logs');
const API_DUMP_DIR = path.join(REPORTS_ROOT, 'api-dumps');

export interface ReportingPaths {
  reportsRoot: string;
  logFile: string;
  apiDumpDir: string;
}

class ReportingConfig {
  private static instance: ReportingConfig | null = null;

  readonly paths: ReportingPaths;

  private constructor() {
    this.paths = {
      reportsRoot: REPORTS_ROOT,
      logFile: path.join(REPORT_LOG_DIR, 'test-run.log'),
      apiDumpDir: API_DUMP_DIR,
    };
    this.ensureDirs();
  }

  static getInstance(): ReportingConfig {
    if (!ReportingConfig.instance) {
      ReportingConfig.instance = new ReportingConfig();
    }
    return ReportingConfig.instance;
  }

  private ensureDirs(): void {
    fs.mkdirSync(this.paths.reportsRoot, { recursive: true });
    fs.mkdirSync(path.dirname(this.paths.logFile), { recursive: true });
    fs.mkdirSync(this.paths.apiDumpDir, { recursive: true });
  }
}

export const reportingConfig = ReportingConfig.getInstance();

export function sanitizeUrl(url: string): string {
  return url.replace(/api_key=[^&]+/g, 'api_key=***');
}

export async function writeConsoleDumpAttachment(
  testInfo: TestInfo,
  logs: string[],
): Promise<void> {
  if (logs.length === 0) {
    return;
  }
  const file = testInfo.outputPath('console.log');
  fs.writeFileSync(file, logs.join('\n'), 'utf-8');
  await testInfo.attach('console-logs', { path: file, contentType: 'text/plain' });
}

export async function writeApiDumpAttachment(
  testInfo: TestInfo,
  responses: string[],
): Promise<void> {
  if (responses.length === 0) {
    return;
  }
  const file = testInfo.outputPath('api-dump.json');
  fs.writeFileSync(file, responses.join('\n'), 'utf-8');
  await testInfo.attach('api-response-dump', { path: file, contentType: 'application/json' });
}
