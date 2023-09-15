import { logAmplitudeEvent } from '@navikt/nav-dekoratoren-moduler';
import { logger } from '@navikt/next-logger';

import env from '../config/environment';

type validEventNames =
  | 'readmore lukket'
  | 'readmore åpnet'
  | 'navigere'
  | 'alert vist'
  | 'guidepanel vist'
  | 'accordion åpnet'
  | 'accordion lukket'
  | 'knapp klikket'
  | 'skjema åpnet'
  | 'skjema fullført'
  | 'skjema spørsmål besvart'
  | 'skjema innsending feilet'
  | 'skjema validering feilet'
  | 'modal åpnet'
  | 'modal lukket'
  | 'filtervalg'; //Bruk kun navn fra taksonomien

export default function logEvent(eventName: validEventNames, eventData: Record<string, string | boolean>) {
  if (window) {
    if (env.amplitudeEnabled) {
      logAmplitudeEvent({
        origin: 'spinntektsmelding-frontend',
        eventName,
        eventData
      }).catch((e) => logger.warn(`Feil ved amplitude logging`, e));
    } else {
      // eslint-disable-next-line no-console
      console.log(`Logger ${eventName} - Event properties: ${JSON.stringify(eventData)}!`);
    }
  }
}
