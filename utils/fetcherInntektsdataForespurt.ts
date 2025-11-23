import NetworkError from './NetworkError';
import formatIsoDate from './formatIsoDate';

export default function fetcherInntektsdataSelvbestemt(
  url: string | null,
  forespoerselId?: string,
  inntektsdato?: Date
) {
  if (!url) return Promise.resolve([]);
  if (!forespoerselId) return Promise.resolve([]);
  const formatertInntektsdatoIso = formatIsoDate(inntektsdato);
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      forespoerselId: forespoerselId,
      inntektsdato: formatertInntektsdatoIso
    })
  })
    .then((res) => {
      if (!res.ok) {
        const error = new NetworkError('Kunne ikke hente arbeidsforhold, vennligst prøv igjen senere');
        error.status = res.status;
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
