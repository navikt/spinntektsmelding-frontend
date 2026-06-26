import { logger } from '@navikt/next-logger';
import logEvent from './logEvent';
import ResponseBackendErrorSchema from '../schema/ResponseBackendErrorSchema';
import { ErrorResponse } from './useErrorResponse';
import { z } from 'zod';
import { teamLogger } from '@navikt/next-logger/team-log';

export type BackendValidationError = z.infer<typeof ResponseBackendErrorSchema>;

const badRequestResponse = z.object({
  error: z.string()
});

interface PostInnsendingOptions<B, S> {
  /** Absolutt eller relativ URL til innsending-endepunkt */
  url: string;
  /** Request body (serialiseres som JSON) */
  body: B;
  /** Analytics/umami komponentnavn for logging */
  analyticsComponent: string;
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

interface PostInnsendingRuntimeOptions<S> {
  analyticsComponent: string;
  onUnauthorized: () => void;
  onSuccess: (json: S | null) => void | Promise<void>;
  mapValidationErrors: (feil: BackendValidationError, errors: ErrorResponse[]) => ErrorResponse[];
  setErrorResponse: (errors: ErrorResponse[]) => void;
  setShowErrorList: (v: boolean) => void;
}

/**
 * Felles POST innsending med standard feilhåndtering.
 * Returnerer Promise<void> (kan avbrytes tidlig ved 401 der onUnauthorized kalles).
 */
export async function postInnsending<B = unknown, S = unknown>({
  url,
  body,
  analyticsComponent,
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
    .then((data) =>
      handleResponse<S>(
        data,
        {
          analyticsComponent,
          onUnauthorized,
          onSuccess,
          mapValidationErrors,
          setErrorResponse,
          setShowErrorList
        },
        body
      )
    )
    .catch((err) => handleNetworkError(err, { setErrorResponse, setShowErrorList }));
}

async function handleResponse<S>(
  data: Response,
  options: PostInnsendingRuntimeOptions<S>,
  body: unknown
): Promise<void> {
  switch (data.status) {
    case 200:
    case 201:
      await handleSuccessResponse<S>(data, options.onSuccess);
      return;
    case 500:
      await handle500Response(data, options);
      return;
    case 400:
      await handle400Response(data, options, body);
      return;
    case 404:
      handle404Response(data, options.setErrorResponse);
      return;
    case 401:
      handle401Response(options.analyticsComponent, options.onUnauthorized);
      return;
    default:
      await handleDefaultResponse(data, options, body);
      return;
  }
}

async function handleSuccessResponse<S>(data: Response, onSuccess: (json: S | null) => void | Promise<void>) {
  let json: S | null = null;
  try {
    json = (await data.json()) as S;
  } catch {
    // Ignorer manglende body
  }
  await onSuccess(json);
}

async function handle500Response<S>(data: Response, options: PostInnsendingRuntimeOptions<S>) {
  options.setErrorResponse([
    {
      value: 'Innsending av skjema feilet',
      error: 'Det er akkurat nå en feil i systemet hos oss. Vennligst prøv igjen om en stund.',
      property: 'server'
    }
  ]);
  logEvent('skjema innsending feilet', {
    tittel: 'Innsending feilet - serverfeil',
    component: options.analyticsComponent
  });
  logger.warn('Feil ved innsending av skjema - 500 ' + JSON.stringify(await safeText(data)));
}

async function handle400Response<S>(data: Response, options: PostInnsendingRuntimeOptions<S>, body: unknown) {
  try {
    const resultat = (await data.json()) as unknown;
    logEvent('skjema innsending feilet', {
      tittel: 'Innsending feilet - valideringsfeil',
      component: options.analyticsComponent
    });
    if (typeof resultat === 'object' && resultat !== null && 'error' in (resultat as any)) {
      const feilResultat = badRequestResponse.safeParse(resultat);
      if (feilResultat.success === true) {
        const feil = feilResultat.data;
        const mappedErrors = options.mapValidationErrors({ error: feil.error, valideringsfeil: [feil.error] }, []);
        options.setErrorResponse(mappedErrors);
        options.setShowErrorList(true);
        logger.warn('Feil ved innsending av skjema - 400 - BadRequest ' + data.statusText + ' ' + JSON.stringify(feil));
        safeTeamLoggerWarn(
          'Feil ved innsending av skjema - 400 - BadRequest ' +
            data.statusText +
            ' ' +
            JSON.stringify(feil) +
            ' ' +
            JSON.stringify(body)
        );
      } else {
        const mappedErrors = options.mapValidationErrors(
          { error: 'Validering av skjema feilet', valideringsfeil: ['Validering av skjema feilet'] },
          []
        );
        options.setErrorResponse(mappedErrors);
        options.setShowErrorList(true);
        logger.warn(
          'Feil ved innsending av skjema - 400 - BadRequest, uventet respons ' +
            data.statusText +
            ' ' +
            JSON.stringify(await safeText(data))
        );
        safeTeamLoggerWarn(
          'Feil ved innsending av skjema - 400 - BadRequest, uventet respons ' +
            data.statusText +
            ' ' +
            JSON.stringify((await safeText(data)) + ' ' + JSON.stringify(body))
        );
      }
    } else {
      const mappedErrors = options.mapValidationErrors(
        { error: 'Validering av skjema feilet', valideringsfeil: ['Validering av skjema feilet'] },
        []
      );
      options.setErrorResponse(mappedErrors);
      options.setShowErrorList(true);
      logger.warn(
        'Feil ved innsending av skjema - 400 - BadRequest, uventet respons ' +
          data.statusText +
          ' ' +
          JSON.stringify(await safeText(data))
      );
      safeTeamLoggerWarn(
        'Feil ved innsending av skjema - 400 - BadRequest, uventet respons ' +
          data.statusText +
          ' ' +
          JSON.stringify(await safeText(data)) +
          ' ' +
          JSON.stringify(body)
      );
    }
  } catch (err) {
    const mappedErrors = options.mapValidationErrors(
      { error: 'Validering av skjema feilet', valideringsfeil: ['Validering av skjema feilet'] },
      []
    );
    options.setErrorResponse(mappedErrors);
    options.setShowErrorList(true);
    logger.warn('Feil ved innsending av skjema - 400 - BadRequest, uventet respons ' + err);
    safeTeamLoggerWarn(
      'Feil ved innsending av skjema - 400 - BadRequest, uventet respons ' +
        err +
        ' ' +
        JSON.stringify(await safeText(data)) +
        ' ' +
        JSON.stringify(body)
    );
  }
}

function handle404Response(data: Response, setErrorResponse: (errors: ErrorResponse[]) => void) {
  setErrorResponse([
    {
      value: 'Innsending av skjema feilet',
      error: 'Fant ikke endepunktet for innsending',
      property: 'server'
    }
  ]);
  logger.warn('Feil ved innsending av skjema - 404 ' + JSON.stringify(data));
}

function handle401Response(analyticsComponent: string, onUnauthorized: () => void) {
  logEvent('skjema innsending feilet', {
    tittel: 'Innsending feilet - ingen tilgang',
    component: analyticsComponent
  });
  onUnauthorized();
}

async function handleDefaultResponse<S>(data: Response, options: PostInnsendingRuntimeOptions<S>, body: unknown) {
  try {
    const resultat = (await data.json()) as unknown;
    logEvent('skjema innsending feilet', {
      tittel: 'Innsending feilet',
      component: options.analyticsComponent
    });
    if (typeof resultat === 'object' && resultat !== null && 'error' in (resultat as any)) {
      const feilResultat = ResponseBackendErrorSchema.safeParse(resultat);
      if (feilResultat.success === true) {
        const feil = feilResultat.data;
        const mappedErrors = options.mapValidationErrors(feil, []);
        options.setErrorResponse(mappedErrors);
        options.setShowErrorList(true);
        logger.warn('Feil ved innsending av skjema - 400 - BadRequest ' + data.statusText + ' ' + JSON.stringify(feil));
        safeTeamLoggerWarn(
          'Feil ved innsending av skjema - 400 - BadRequest ' +
            data.statusText +
            ' ' +
            JSON.stringify(feil) +
            ' ' +
            JSON.stringify(body)
        );
      }
    }
  } catch (err) {
    logger.warn('Feil ved innsending av skjema - uventet respons ' + err + ' ' + JSON.stringify(await safeText(data)));
    safeTeamLoggerWarn(
      'Feil ved innsending av skjema - uventet respons ' +
        err +
        ' ' +
        JSON.stringify(await safeText(data)) +
        ' ' +
        JSON.stringify(body)
    );
  }
}

function handleNetworkError(
  err: unknown,
  options: Pick<PostInnsendingRuntimeOptions<unknown>, 'setErrorResponse' | 'setShowErrorList'>
) {
  options.setErrorResponse([
    {
      value: 'Innsending av skjema feilet',
      error: 'Det oppstod et nettverksproblem ved innsending. Vennligst prøv igjen.',
      property: 'server'
    }
  ]);
  options.setShowErrorList(true);
  logger.warn('Feil ved innsending av skjema - network error ' + err);
}

async function safeText(resp: Response): Promise<string> {
  try {
    return await resp.text();
  } catch {
    return '';
  }
}

function safeTeamLoggerWarn(message: string) {
  try {
    teamLogger.warn(message);
  } catch (e) {
    logger.warn({ err: e }, 'teamLogger feilet: ' + (e instanceof Error ? e.message : String(e)));
  }
}
