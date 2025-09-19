import { MottattKvitteringSchema } from '../schema/MottattKvitteringSchema';
import NetworkError from './NetworkError';
import isValidUUID from './isValidUUID';
import { z } from 'zod';

type MottattKvittering = z.infer<typeof MottattKvitteringSchema>;

const fetchKvitteringsdata = (
  url: string,
  forespoerselId: string
): Promise<{ status: number; data: MottattKvittering | undefined }> => {
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

      return res.json().then((data: MottattKvittering) => {
        return { status: res.status, data };
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
