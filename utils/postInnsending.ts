import { logger } from '@navikt/next-logger';
import logEvent from './logEvent';
import ResponseBackendErrorSchema from '../schema/ResponseBackendErrorSchema';
import { ErrorResponse } from './useErrorResponse';
import { z } from 'zod/v4';

export type BackendValidationError = z.infer<typeof ResponseBackendErrorSchema>;

interface PostInnsendingOptions<B, S> {
  /** Absolutt eller relativ URL til innsending-endepunkt */
  url: string;
  /** Request body (serialiseres som JSON) */
  body: B;
  /** Amplitude/umami komponentnavn for logging */
  amplitudeComponent: string;
  /** Kalles ved HTTP 401 */
  onUnauthorized: () => void;
  /** Kalles ved 200/201. Får parsede JSON-data eller null dersom parsing feilet / ingen body. */
  onSuccess: (json: S | null) => void | Promise<void>;
  /** Mapper backend-valideringsfeil til ErrorResponse[] */
  mapValidationErrors: (feil: BackendValidationError, errors: ErrorResponse[]) => ErrorResponse[];
  /** Setter feilmeldinger i global/state */
  setErrorResponse: (errors: ErrorResponse[]) => void;
  /** Flagg for å trigge visning av feilliste i UI */
  setShowErrorList: (v: boolean) => void;
}

/**
 * Felles POST innsending med standard feilhåndtering.
 * Returnerer Promise<void> (kan avbrytes tidlig ved 401 der onUnauthorized kalles).
 */
export async function postInnsending<B = unknown, S = unknown>({
  url,
  body,
  amplitudeComponent,
  onUnauthorized,
  onSuccess,
  mapValidationErrors,
  setErrorResponse,
  setShowErrorList
}: PostInnsendingOptions<B, S>): Promise<void> {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(async (data) => {
      switch (data.status) {
        case 200:
        case 201: {
          // Noen endepunkt trenger body (JSON) andre ikke – prøver å parse, men tåler feil.
          let json: S | null = null;
          try {
            json = (await data.json()) as S;
          } catch {
            // Ignorer manglende body
          }
          await onSuccess(json);
          break;
        }
        case 500: {
          const errors: Array<ErrorResponse> = [
            {
              value: 'Innsending av skjema feilet',
              error: 'Det er akkurat nå en feil i systemet hos oss. Vennligst prøv igjen om en stund.',
              property: 'server'
            }
          ];
          setErrorResponse(errors);
          logEvent('skjema innsending feilet', {
            tittel: 'Innsending feilet - serverfeil',
            component: amplitudeComponent
          });
          logger.warn('Feil ved innsending av skjema - 500 ' + JSON.stringify(await safeText(data)));
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
          setErrorResponse(errors);
          logger.warn('Feil ved innsending av skjema - 404 ' + JSON.stringify(data));
          break;
        }
        case 401: {
          logEvent('skjema innsending feilet', {
            tittel: 'Innsending feilet - ingen tilgang',
            component: amplitudeComponent
          });
          onUnauthorized();
          break;
        }
        default: {
          // Forventer backend-valideringsfeil i JSON
          try {
            const resultat = (await data.json()) as unknown;
            logEvent('skjema innsending feilet', {
              tittel: 'Innsending feilet',
              component: amplitudeComponent
            });
            if (typeof resultat === 'object' && resultat !== null && 'error' in (resultat as any)) {
              const feilResultat = ResponseBackendErrorSchema.safeParse(resultat);
              if (feilResultat.success === true) {
                const feil = feilResultat.data;
                let mappedErrors: Array<ErrorResponse> = [];
                mappedErrors = mapValidationErrors(feil, mappedErrors);
                setErrorResponse(mappedErrors);
                setShowErrorList(true);
                logger.warn('Feil ved innsending av skjema - 400 - BadRequest ' + data.statusText);
              }
            }
          } catch (err) {
            logger.warn('Feil ved innsending av skjema - uventet respons ' + err);
          }
        }
      }
    })
    .catch((err) => {
      const errors: Array<ErrorResponse> = [
        {
          value: 'Innsending av skjema feilet',
          error: 'Det oppstod et nettverksproblem ved innsending. Vennligst prøv igjen.',
          property: 'server'
        }
      ];
      setErrorResponse(errors);
      setShowErrorList(true);
      logger.warn('Feil ved innsending av skjema - network error ' + err);
    });
}

async function safeText(resp: Response): Promise<string> {
  try {
    return await resp.text();
  } catch {
    return '';
  }
}
