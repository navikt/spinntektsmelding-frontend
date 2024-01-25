import useBoundStore from '../state/useBoundStore';
import logEvent from './logEvent';
import useValiderInntektsmelding, { ValiderTekster } from './useValiderInntektsmelding';
import useFyllInnsending, { InnsendingSkjema } from '../state/useFyllInnsending';
import isValidUUID from './isValidUUID';
import environment from '../config/environment';
import useErrorRespons, { ErrorResponse } from './useErrorResponse';
import { useRouter } from 'next/navigation';
import { logger } from '@navikt/next-logger';
import useFyllAapenInnsending from '../state/useFyllAapenInnsending';

export default function useSendInnArbeidsgiverInitiertSkjema(
  innsendingFeiletIngenTilgang: (feilet: boolean) => void,
  amplitudeComponent: string
) {
  const validerInntektsmelding = useValiderInntektsmelding();
  const fyllFeilmeldinger = useBoundStore((state) => state.fyllFeilmeldinger);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  const fyllInnsending = useFyllInnsending();
  const setKvitteringInnsendt = useBoundStore((state) => state.setKvitteringInnsendt);
  const errorResponse = useErrorRespons();
  const router = useRouter();
  const fyllAapenInnsending = useFyllAapenInnsending();

  return async (opplysningerBekreftet: boolean, pathSlug: string, isDirtyForm: boolean) => {
    logEvent('skjema fullført', {
      tittel: 'Har trykket send',
      component: amplitudeComponent
    });

    if (!isDirtyForm) {
      logEvent('skjema fullført', {
        tittel: 'Innsending uten endringer i skjema',
        component: amplitudeComponent
      });

      logger.info('Innsending uten endringer i skjema');

      const errors: Array<ErrorResponse> = [
        {
          value: 'Innsending av skjema feilet',
          error: 'Innsending feilet, det er ikke gjort endringer i skjema.',
          property: 'knapp-innsending'
        }
      ];
      fyllFeilmeldinger([]);

      errorResponse(errors);
      setSkalViseFeilmeldinger(true);

      return false;
    }

    const validerteData = fyllAapenInnsending();

    const hasErrors = validerteData.success !== true;

    if (hasErrors) {
      const errors: ValiderTekster[] = validerteData.error.issues.map((issue) => {
        return {
          text: issue.message,
          felt: issue.path.join('.')
        };
      });

      fyllFeilmeldinger(errors);

      logEvent('skjema validering feilet', {
        tittel: 'Validering feilet',
        component: amplitudeComponent
      });

      // errorResponse(errors);
      setSkalViseFeilmeldinger(true);
    } else {
      const skjemaData = validerteData.data;

      fyllFeilmeldinger([]);

      return fetch(`${environment.innsendingAGInitiertUrl}`, {
        method: 'POST',
        body: JSON.stringify(skjemaData),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((data) => {
        switch (data.status) {
          case 201:
            setKvitteringInnsendt(new Date());
            router.push(`/kvittering/${pathSlug}`, undefined);
            break;

          case 500: {
            const errors: Array<ErrorResponse> = [
              {
                value: 'Innsending av skjema feilet',
                error: 'Det er akkurat nå en feil i systemet hos oss. Vennligst prøv igjen om en stund.',
                property: 'server'
              }
            ];
            errorResponse(errors);

            logEvent('skjema innsending feilet', {
              tittel: 'Innsending feilet - serverfeil',
              component: amplitudeComponent
            });

            logger.error('Feil ved innsending av skjema - 500', data);
            logger.error(data);

            break;
          }

          case 404: {
            const errors: Array<ErrorResponse> = [
              {
                value: 'Innsending av skjema feilet',
                error: 'Fant ikke endepunktet for innsending',
                property: 'server'
              }
            ];
            errorResponse(errors);

            logger.error('Feil ved innsending av skjema - 404', data);
            logger.error(data);

            break;
          }

          case 401: {
            logEvent('skjema innsending feilet', {
              tittel: 'Innsending feilet - ingen tilgang',
              component: amplitudeComponent
            });

            innsendingFeiletIngenTilgang(true);
            break;
          }

          default:
            return data.json().then((resultat) => {
              logEvent('skjema innsending feilet', {
                tittel: 'Innsending feilet',
                component: amplitudeComponent
              });

              if (resultat.errors) {
                const errors: Array<ErrorResponse> = resultat.errors;
                errorResponse(errors);
              }
            });
        }
      });
    }
  };
}
