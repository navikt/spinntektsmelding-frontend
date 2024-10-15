import NetworkError from './NetworkError';
import isValidUUID from './isValidUUID';
<<<<<<< HEAD
import { endepunktHentForespoerselSchema } from '../schema/endepunktHentForespoerselSchema';
import { z } from 'zod';

type EndepunktHentForespoerselSchema = z.infer<typeof endepunktHentForespoerselSchema>;

export default function fetcherSkjemadataForespurt(
  url: string | null,
  forespoerselId: string
): Promise<EndepunktHentForespoerselSchema | []> {
=======

export default function fetcherSkjemadataForespurt(url: string | null, forespoerselId: string): Promise<any> {
  // TODO: Fix any med riktig type for mottatte data
>>>>>>> 43a7ae66 (Bruke SWR)
  if (!url) return Promise.resolve([]);
  if (!isValidUUID(forespoerselId)) return Promise.resolve([]);
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uuid: forespoerselId
    })
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
