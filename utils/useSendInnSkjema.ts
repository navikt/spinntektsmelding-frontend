import useBoundStore from '../state/useBoundStore';
import logEvent from './logEvent';
import useFyllInnsending from '../state/useFyllInnsending';
import isValidUUID from './isValidUUID';
import environment from '../config/environment';
import useErrorRespons, { ErrorResponse } from './useErrorResponse';
import { useRouter } from 'next/navigation';
import { logger } from '@navikt/next-logger';
import validerInntektsmelding from './validerInntektsmelding';
import fullInnsendingSchema from '../schema/fullInnsendingSchema';
import { z } from 'zod';
import responseBackendError from '../schema/responseBackendError';
import { Opplysningstype } from '../state/useForespurtDataStore';
import forespoerselType from '../config/forespoerselType';
import { hovedskjemaSchema } from '../schema/hovedskjemaSchema';

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

  type Skjema = z.infer<typeof hovedskjemaSchema>;

  return async (
    opplysningerBekreftet: boolean,
    forespurteOpplysningstyper: Opplysningstype[],
    pathSlug: string,
    isDirtyForm: boolean,
    formData: Skjema
  ) => {
    logEvent('skjema fullført', {
      tittel: 'Har trykket send',
      component: amplitudeComponent
    });
    const kunInntektOgRefusjon = !forespurteOpplysningstyper.includes(forespoerselType.arbeidsgiverperiode);
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

    const errorStatus = validerInntektsmelding(state, opplysningerBekreftet, kunInntektOgRefusjon, formData);

    const hasErrors = errorStatus.errorTexts && errorStatus.errorTexts.length > 0;

    if (hasErrors) {
      fyllFeilmeldinger(errorStatus.errorTexts!);

      logEvent('skjema validering feilet', {
        tittel: 'Validering feilet',
        component: amplitudeComponent
      });
    } else {
      type FullInnsending = z.infer<typeof fullInnsendingSchema>;

      const skjemaData: FullInnsending = fyllInnsending(
        opplysningerBekreftet,
        pathSlug,
        forespurteOpplysningstyper,
        formData
      );

      const validerteData = fullInnsendingSchema.safeParse(skjemaData);

      if (validerteData.success === false) {
        logger.error('Feil ved validering ved innsending av skjema med id ', pathSlug);
        logger.error(validerteData.error);
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

      return fetch(`${environment.innsendingUrl}`, {
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

              if (resultat.error) {
                const feilResultat = responseBackendError.safeParse(resultat);
                if (feilResultat.success === true) {
                  const feil = feilResultat.data;
                  let errors: Array<ErrorResponse> = [];

                  errors = mapValidationErrors(feil, errors, resultat);

                  errorResponse(errors);
                  setSkalViseFeilmeldinger(true);

                  logger.error('Feil ved innsending av skjema - 400 - BadRequest', data);
                  logger.error(data);
                }
              }
            });
        }
      });
    }
  };
}

function mapValidationErrors(
  feil: { error: string; valideringsfeil: string[] },
  errors: ErrorResponse[],
  resultat: any
) {
  if (feil.valideringsfeil) {
    errors = resultat.valideringsfeil.map((error: any) => ({
      error: error
    }));
  } else {
    errors = [
      {
        value: 'Innsending av skjema feilet',
        error: 'Det er akkurat nå en feil i systemet hos oss. Vennligst prøv igjen om en stund.',
        property: 'server'
      }
    ];
  }
  return errors;
}
