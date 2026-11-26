import { logger } from '@navikt/next-logger';
import { Unleash } from 'unleash-client';

const FLAGG = 'frontend-inntektsmelding-selvbestemt-alternativer';
const TIDSFRIST_MS = 1500;

async function initialiserUnleash(): Promise<Unleash | undefined> {
  const url = process.env.UNLEASH_SERVER_API_URL;
  const token = process.env.UNLEASH_SERVER_API_TOKEN;
  if (!url || !token) {
    logger.warn('Unleash mangler konfigurasjon - nye selvbestemte alternativer er deaktivert');
    return undefined;
  }

  try {
    const parsedUrl = new URL(url);
    if (!['https:', 'http:'].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password) {
      throw new Error('Ugyldig Unleash-URL');
    }

    const client = new Unleash({
      url,
      appName: 'spinntektsmelding-frontend',
      environment: process.env.UNLEASH_SERVER_API_ENV,
      customHeaders: { Authorization: token },
      timeout: TIDSFRIST_MS,
      disableMetrics: true,
      disableAutoStart: true
    });
    client.on('error', () => logger.warn('Unleash-feil under henting av selvbestemte alternativer'));
    client.on('warn', () => logger.warn('Unleash-advarsel under henting av selvbestemte alternativer'));

    await new Promise<void>((resolve) => {
      const finish = () => {
        clearTimeout(timer);
        client.removeListener('synchronized', finish);
        resolve();
      };
      const timer = setTimeout(() => {
        logger.warn('Unleash svarte ikke innen tidsfristen - nye selvbestemte alternativer er deaktivert');
        finish();
      }, TIDSFRIST_MS);
      client.once('synchronized', finish);
      void client
        .start()
        .then(finish)
        .catch(() => {
          logger.warn('Unleash kunne ikke starte - nye selvbestemte alternativer er deaktivert');
          finish();
        });
    });
    return client;
  } catch {
    logger.warn('Unleash kunne ikke initialiseres - nye selvbestemte alternativer er deaktivert');
    return undefined;
  }
}

export async function hentNyeSelvbestemteAlternativer(): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') return true;

  const client = await initialiserUnleash();
  if (!client) return false;

  try {
    if (!client.isSynchronized()) return false;
    return client.isEnabled(FLAGG, {}, false);
  } catch {
    logger.warn('Unleash-evaluering feilet - nye selvbestemte alternativer er deaktivert');
    return false;
  } finally {
    client.destroy();
  }
}
