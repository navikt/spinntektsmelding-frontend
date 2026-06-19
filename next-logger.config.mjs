import { backendLogger } from '@navikt/next-logger';

export const logger = backendLogger;

const nextLoggerConfig = {
  logger
};

export default nextLoggerConfig;