import { logger } from '@navikt/next-logger';
import NetworkError from './NetworkError';
import isValidUUID from './isValidUUID';

const fetchKvitteringsdataSSR = (url: string, forespoerselId: string, token?: string) => {
  if (isValidUUID(forespoerselId) === false) {
    logger.warn(`Ugyldig forespørselId: ${forespoerselId} - må være en gyldig UUID`);
    return Promise.resolve({ status: 404, data: {} });
  }

  logger.info(`Henter kvitteringsdata for forespørselId: ${forespoerselId} fra url: ${url}`);

  return fetch(`${url}/${forespoerselId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
    .then((res) => {
      if (!res.ok) {
        const fetchError = new NetworkError('An error occurred while fetching the data.');
        // Attach extra info to the error object.
        try {
          fetchError.info = res;
        } catch (error) {
          fetchError.info = { error };
        }
        fetchError.status = res.status;
        throw fetchError;
      }

      return res
        .json()
        .then((data) => {
          return { status: res.status, data };
        })
        .catch((error) => {
          const jsonError = new NetworkError('An error occurred while decoding the data.');
          // Attach extra info to the error object.
          logger.error(`Feil ved dekoding av data for forespørselId: ${forespoerselId} fra url: ${url}`, error);
          jsonError.status = error.status;
          throw jsonError;
        });
    })
    .catch((error) => {
      const networkError = new NetworkError(error.message ?? 'An error occurred while fetching the data...');
      networkError.status = error.status;
      networkError.info = error;
      throw networkError;
    });
};

export default fetchKvitteringsdataSSR;
