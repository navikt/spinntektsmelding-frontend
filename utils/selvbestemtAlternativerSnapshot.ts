import { logger } from '@navikt/next-logger';

const STORAGE_KEY = 'im-dialog:selvbestemt-alternativer:v1';
let laastVerdi: boolean | undefined;
let nyttForloepStartet = false;

export function nullstillSelvbestemtAlternativer(): void {
  laastVerdi = undefined;
  nyttForloepStartet = false;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    logger.warn('Kunne ikke nullstille lagrede selvbestemte alternativer');
  }
}

export function hentLaasteSelvbestemtAlternativer(fraServer: boolean, startNyInntektsmelding = false): boolean {
  if (startNyInntektsmelding && !nyttForloepStartet) {
    nullstillSelvbestemtAlternativer();
    nyttForloepStartet = true;
  } else if (!startNyInntektsmelding) {
    nyttForloepStartet = false;
  }
  if (laastVerdi !== undefined) return laastVerdi;

  laastVerdi = fraServer;
  try {
    const lagret = window.sessionStorage.getItem(STORAGE_KEY);
    if (lagret === 'true' || lagret === 'false') {
      laastVerdi = lagret === 'true';
    } else {
      if (lagret !== null) {
        logger.warn('Ugyldige lagrede selvbestemte alternativer - bruker flaggverdien fra serveren');
      }
      window.sessionStorage.setItem(STORAGE_KEY, String(laastVerdi));
    }
  } catch {
    laastVerdi = false;
    logger.warn('Kunne ikke lagre selvbestemte alternativer - nye alternativer er deaktivert');
  }
  return laastVerdi;
}
