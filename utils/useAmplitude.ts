import { logAmplitudeEvent } from '@navikt/nav-dekoratoren-moduler';
import { logger } from '@navikt/next-logger';

import env from '../config/environment';
import useBoundStore from '../state/useBoundStore';

type validEventNames =
  | 'readmore lukket'
  | 'readmore åpnet'
  | 'navigere'
  | 'skjema validering feilet'
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

export default function useAmplitude() {
  const tracker = useBoundStore((state) => state.tracker);

  return (eventName: validEventNames, eventData: Record<string, string | boolean>) => {
    eventData['tracker'] = tracker;

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
  };
}
