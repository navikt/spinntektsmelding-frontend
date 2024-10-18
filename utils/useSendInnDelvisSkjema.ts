import useBoundStore from '../state/useBoundStore';
import logEvent from './logEvent';
import isValidUUID from './isValidUUID';
import environment from '../config/environment';
import useErrorRespons, { ErrorResponse } from './useErrorResponse';
import { useRouter } from 'next/navigation';
import { logger } from '@navikt/next-logger';

import useFyllDelvisInnsending from '../state/useFyllDelvisInnsending';
import { UseFormSetError } from 'react-hook-form';
import validerDelvisInntektsmelding from './validerDelvisInntektsmelding';
import { z } from 'zod';
import { delvisInnsendingSchema } from '../schema/delvisInnsendingSchema';
import useSkjemadataForespurt from './useSkjemadataForespurt';
import { ForespurtData } from '../schema/endepunktHentForespoerselSchema';
import valideringDelvisInnsendingSchema from '../schema/valideringDelvisInnsendingSchema';

type Skjema = z.infer<typeof valideringDelvisInnsendingSchema>;

export default function useSendInnDelvisSkjema(
  innsendingFeiletIngenTilgang: (feilet: boolean) => void,
  amplitudeComponent: string,
  setError: UseFormSetError<any>,
  forespoerselId: string
) {
  const fyllFeilmeldinger = useBoundStore((state) => state.fyllFeilmeldinger);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  const fyllInnsending = useFyllDelvisInnsending(forespoerselId);
  const setKvitteringInnsendt = useBoundStore((state) => state.setKvitteringInnsendt);
  const state = useBoundStore((state) => state);
  const errorResponse = useErrorRespons();
  const router = useRouter();
  const setKvitteringsdata = useBoundStore((state) => state.setKvitteringsdata);

  const {
    data: forespurtData,
    error: forespurtDataError,
    isLoading: forespurtDataIsLoading
  } = useSkjemadataForespurt(forespoerselId!, true) as {
    data: ForespurtData;
    error: any;
    isLoading: boolean;
  };

  return async (kunInntektOgRefusjon: boolean, pathSlug: string, isDirtyForm: boolean, form: Skjema) => {
    logEvent('skjema fullført', {
      tittel: 'Har trykket send',
      component: amplitudeComponent
    });
    console.log('useSendInnDelvisSkjema', kunInntektOgRefusjon, pathSlug, isDirtyForm, form);

    if (!isDirtyForm) {
      console.log('useSendInnDelvisSkjema', 'Innsending uten endringer i skjema');
      logEvent('skjema fullført', {
        tittel: 'Innsending uten endringer i skjema',
        component: amplitudeComponent
      });

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

    const errorStatus = validerDelvisInntektsmelding(state, true, kunInntektOgRefusjon, forespurtData, form);

    const hasErrors = errorStatus.errorTexts && errorStatus.errorTexts.length > 0;

    if (hasErrors) {
      fyllFeilmeldinger(errorStatus.errorTexts!!);

      logEvent('skjema validering feilet', {
        tittel: 'Validering feilet',
        component: amplitudeComponent
      });

      return false;
    }

    type DelvisInnsending = z.infer<typeof delvisInnsendingSchema>;
    console.log('useSendInnDelvisSkjema', form, pathSlug);
    const skjemaData: DelvisInnsending = fyllInnsending(form, pathSlug);

    const validerteData = delvisInnsendingSchema.safeParse(skjemaData);

    if (validerteData.success === false) {
      logger.error('Feil ved validering ved innsending av skjema med id ', pathSlug);
      logger.error(validerteData.error);
    } else {
      setKvitteringsdata(validerteData.data);
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

          setError('server', {
            message: 'Det er akkurat nå en feil i systemet hos oss. Vennligst prøv igjen om en stund.'
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
          setError('server', { message: 'Fant ikke endepunktet for innsending' });

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
              const errors: Array<ErrorResponse> = resultat.valideringsfeil.map((error: any) => ({
                error: error
              }));

              errorResponse(errors);
              setSkalViseFeilmeldinger(true);
            }
          });
      }
    });
  };
}
