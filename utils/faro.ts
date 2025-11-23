import { Faro, getWebInstrumentations, initializeFaro, LogLevel } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

import env from '../config/environment';

let faro: Faro | null = null;
export function initInstrumentation(): void {
  if (typeof window === 'undefined' || faro !== null) return;

  getFaro();
}

export function getFaro(): Faro | null {
  if (faro !== null) return faro;

  if (process.env.NEXT_PUBLIC_DISABLE_DECORATOR || typeof window === 'undefined') {
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
  const levelMap: Record<string, LogLevel> = {
    trace: LogLevel.TRACE,
    debug: LogLevel.DEBUG,
    info: LogLevel.INFO,
    warn: LogLevel.WARN,
    error: LogLevel.ERROR
  };

  const level = levelMap[pinoLevel];
  if (level === undefined) {
    throw new Error(`Unknown level: ${pinoLevel}`);
  }

  return level;
}
