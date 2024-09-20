import NetworkError from './NetworkError';
import isValidUUID from './isValidUUID';

export default function fetcherInntektsdataSelvbestemt(url: string | null, forespoerselId?: string) {
  if (!url) return Promise.resolve([]);
  if (!forespoerselId || !isValidUUID(forespoerselId)) return Promise.resolve([]);
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
        const error = new NetworkError('Kunne ikke hente data, vennligst prøv igjen senere');
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
