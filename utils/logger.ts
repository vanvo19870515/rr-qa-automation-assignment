import type { Logger as WinstonLogger } from 'winston';
import type { TestInfo } from '@playwright/test';
import { logger as coreLogger } from '../core/logger/logger';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface TestLogger {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  debug: (message: string) => void;
}

export const rootLogger: WinstonLogger = coreLogger;

function emit(level: LogLevel, scope: string, message: string): void {
  const line = `[${scope}] ${message}`;
  rootLogger.log(level, line);
}

export function createTestLogger(testInfo: TestInfo): TestLogger {
  const scope = `${testInfo.project.name}:${testInfo.title}`;
  return {
    info: (message: string) => {
      emit('info', scope, message);
    },
    warn: (message: string) => {
      emit('warn', scope, message);
    },
    error: (message: string) => {
      emit('error', scope, message);
    },
    debug: (message: string) => {
      emit('debug', scope, message);
    },
  };
}
