import mottattKvitteringSchema from '../schema/mottattKvitteringSchema';
import NetworkError from './NetworkError';
import isValidUUID from './isValidUUID';
import { z } from 'zod';

type MottattKvitteringSchema = z.infer<typeof mottattKvitteringSchema>;

const fetchKvitteringsdata = (
  url: string,
  forespoerselId: string
): Promise<{ status: number; data: MottattKvitteringSchema | undefined }> => {
  if (isValidUUID(forespoerselId) === false) {
    return Promise.resolve({ status: 404, data: undefined });
  }
  return fetch(`${url}/${forespoerselId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      if (!res.ok) {
        const error = new NetworkError('An error occurred while fetching the data.');
        // Attach extra info to the error object.
        try {
          error.info = res;
        } catch (errorStatus) {
          error.info = { errorStatus };
        }
        error.status = res.status;
        throw error;
      }

      return res
        .json()
        .then((data: MottattKvitteringSchema) => {
          return { status: res.status, data };
        })
        .catch((res) => {
          const jsonError = new NetworkError('An error occurred while decoding the data.');
          // Attach extra info to the error object.

          jsonError.status = res.status;
          throw jsonError;
        });
    })
    .catch((errorRes) => {
      const error = new NetworkError('An error occurred while fetching the data.');
      error.status = errorRes.status;
      error.info = errorRes;
      throw error;
    });
};

export default fetchKvitteringsdata;
