import { Faro, getWebInstrumentations, initializeFaro, LogLevel } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

import env from '../config/environment';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

let faro: Faro | null = null;
export function initInstrumentation(): void {
  if (typeof window === 'undefined' || faro !== null) return;

  getFaro();
}

export function getFaro(): Faro | null {
  if (faro != null) return faro;

  if (publicRuntimeConfig.loggingDisabled) {
    return null;
  }

  faro = initializeFaro({
    url: env.telemetryUrl,
    app: {
      name: 'spinntektsmelding-frontend',
      version: env.version
    },
    instrumentations: [
      ...getWebInstrumentations({
        captureConsole: false
      }),
      new TracingInstrumentation()
    ]
  });
  return faro;
}

export function pinoLevelToFaroLevel(pinoLevel: string): LogLevel {
  switch (pinoLevel) {
    case 'trace':
      return LogLevel.TRACE;
    case 'debug':
      return LogLevel.DEBUG;
    case 'info':
      return LogLevel.INFO;
    case 'warn':
      return LogLevel.WARN;
    case 'error':
      return LogLevel.ERROR;
    default:
      throw new Error(`Unknown level: ${pinoLevel}`);
  }
}
