import NetworkError from './NetworkError';

export default function fetcherArbeidsforhold(url: string | null, identitetsnummer?: string) {
  if (!url || !identitetsnummer) return Promise.resolve([]);

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sykmeldtFnr: identitetsnummer })
  })
    .then((res) => {
      if (!res.ok) {
        const error = new NetworkError('Kunne ikke hente arbeidsforhold, vennligst prøv igjen senere');
        error.status = res.status;
        error.info = res.json();
        throw error;
      }
      return res.json();
    })
    .catch((error) => {
      const newError = new NetworkError('Kunne ikke tolke resultatet fra serveren');
      newError.status = error.status;
      newError.info = error.info;
      throw newError;
    });
}
