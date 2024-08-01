import useBoundStore from '../state/useBoundStore';
import logEvent from './logEvent';
import useFyllInnsending, { InnsendingSkjema } from '../state/useFyllInnsending';
import isValidUUID from './isValidUUID';
import environment from '../config/environment';
import useErrorRespons, { ErrorResponse } from './useErrorResponse';
import { useRouter } from 'next/navigation';
import { logger } from '@navikt/next-logger';
import validerInntektsmelding from './validerInntektsmelding';
import fullInnsendingSchema from '../schema/fullInnsendingSchema';
import { z } from 'zod';

export default function useSendInnSkjema(
  innsendingFeiletIngenTilgang: (feilet: boolean) => void,
  amplitudeComponent: string
) {
  const fyllFeilmeldinger = useBoundStore((state) => state.fyllFeilmeldinger);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  const fyllInnsending = useFyllInnsending();
  const setKvitteringInnsendt = useBoundStore((state) => state.setKvitteringInnsendt);
  const state = useBoundStore((state) => state);
  const errorResponse = useErrorRespons();
  const router = useRouter();

  return async (
    opplysningerBekreftet: boolean,
    kunInntektOgRefusjon: boolean,
    pathSlug: string,
    isDirtyForm: boolean
  ) => {
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

    const errorStatus = validerInntektsmelding(state, opplysningerBekreftet, kunInntektOgRefusjon);

    const hasErrors = errorStatus.errorTexts && errorStatus.errorTexts.length > 0;

    if (hasErrors) {
      fyllFeilmeldinger(errorStatus.errorTexts!!);

      logEvent('skjema validering feilet', {
        tittel: 'Validering feilet',
        component: amplitudeComponent
      });
    } else {
      type FullInnsending = z.infer<typeof fullInnsendingSchema>;

      const skjemaData: FullInnsending = fyllInnsending(opplysningerBekreftet, pathSlug);

      const validerteData = fullInnsendingSchema.safeParse(skjemaData);

      if (validerteData.success === false) {
        console.log(validerteData);
      }

      fyllFeilmeldinger([]);

      if (!isValidUUID(pathSlug)) {
        const errors: Array<ErrorResponse> = [
          {
            value: 'Innsending av skjema feilet',
            error: 'Innsending av skjema feilet. Ugyldig identifikator',
            property: 'server'
          }
        ];

        logEvent('skjema validering feilet', {
          tittel: 'Ugyldig UUID ved innsending',
          component: amplitudeComponent
        });
        errorResponse(errors);

        return false;
      }

      return fetch(`${environment.innsendingUrl}/${pathSlug}`, {
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
