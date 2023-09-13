import useBoundStore from 'state/useBoundStore';
import useAmplitude from './useAmplitude';
import useValiderInntektsmelding from './useValiderInntektsmelding';
import useFyllInnsending, { InnsendingSkjema } from '../state/useFyllInnsending';
import isValidUUID from './isValidUUID';
import environment from '../config/environment';
import useErrorRespons, { ErrorResponse } from './useErrorResponse';
import { useRouter } from 'next/router';

export default function useSendInnSkjema(innsendingFeiletIngenTilgang) {
  const logEvent = useAmplitude();
  const validerInntektsmelding = useValiderInntektsmelding();
  const fyllFeilmeldinger = useBoundStore((state) => state.fyllFeilmeldinger);
  const fyllInnsending = useFyllInnsending();
  const setKvitteringInnsendt = useBoundStore((state) => state.setKvitteringInnsendt);
  const errorResponse = useErrorRespons();
  const router = useRouter();

  return async (
    opplysningerBekreftet: boolean,
    kunInntektOgRefusjon: boolean,
    pathSlug: string,
    amplitudeComponent: string
  ) => {
    logEvent('skjema fullført', {
      tittel: 'Har trykket send',
      component: amplitudeComponent
    });

    const errorStatus = validerInntektsmelding(opplysningerBekreftet, kunInntektOgRefusjon);

    const hasErrors = errorStatus.errorTexts && errorStatus.errorTexts.length > 0;

    if (hasErrors) {
      fyllFeilmeldinger(errorStatus.errorTexts!);

      logEvent('skjema validering feilet', {
        tittel: 'Validering feilet',
        component: amplitudeComponent
      });
    } else {
      const skjemaData: InnsendingSkjema = fyllInnsending(opplysningerBekreftet);

      fyllFeilmeldinger([]);

      const postData = async () => {
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

        const data = await fetch(`${environment.innsendingUrl}/${pathSlug}`, {
          method: 'POST',
          body: JSON.stringify(skjemaData),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        switch (data.status) {
          case 201:
            setKvitteringInnsendt(new Date());
            router.push(`/kvittering/${pathSlug}`, undefined, { shallow: true });
            break;

          case 500: {
            const errors: Array<ErrorResponse> = [
              {
                value: 'Innsending av skjema feilet',
                error: 'Innsending av skjema feilet',
                property: 'server'
              }
            ];
            errorResponse(errors);

            logEvent('skjema innsending feilet', {
              tittel: 'Innsending feilet - serverfeil',
              component: amplitudeComponent
            });

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
            const resultat = await data.json();

            logEvent('skjema innsending feilet', {
              tittel: 'Innsending feilet',
              component: amplitudeComponent
            });

            if (resultat.errors) {
              const errors: Array<ErrorResponse> = resultat.errors;
              errorResponse(errors);
            }
        }
      };
      postData();
    }
  };
}