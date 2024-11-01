import { z } from 'zod';
import NetworkError from './NetworkError';
import isValidUUID from './isValidUUID';
import mottattKvitteringSchema from '../schema/mottattKvitteringSchema';

type MottattKvitteringSchema = z.infer<typeof mottattKvitteringSchema>;

export default function fetcherKvitteringdata(
  url: string | null,
  forespoerselId: string
): Promise<MottattKvitteringSchema | []> {
  if (!url) return Promise.resolve([]);
  if (!isValidUUID(forespoerselId)) return Promise.resolve([]);
  const getUrl = url + '/' + forespoerselId;
  return fetch(getUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      if (!res.ok) {
        const error = new NetworkError('Kunne ikke hente forespurte data, vennligst prøv igjen senere');
        error.status = res.status;
        // error.info = res.json();
        return Promise.reject(error);
      }
      return res.json();
    })
    .catch((error) => {
      const newError = new NetworkError('Kunne ikke tolke resultatet fra serveren');
      newError.status = error.status;
      newError.info = error.info;
      return Promise.reject(newError);
    });
}
