import { logger } from '@navikt/next-logger';
import { teamLogger } from '@navikt/next-logger/team-log';

class SafeTeamLogger {
  info(data: Record<string, unknown>, message: string): void {
    try {
      teamLogger.info(data, message);
    } catch {
      this.logFallback(`${message} ${JSON.stringify(data)}`);
    }
  }

  warn(message: string): void {
    try {
      teamLogger.warn(message);
    } catch {
      this.logFallback(message);
    }
  }

  private logFallback(message: string): void {
    const sanitizedMessage = message.replace(/\b(?:\d{11}|\d{9}|\d{8})\b/g, '[redacted]');
    logger.warn(sanitizedMessage);
  }
}

export const safeTeamLogger = new SafeTeamLogger();
