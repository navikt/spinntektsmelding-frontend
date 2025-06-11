import NetworkError from './NetworkError';

export default function fetcherArbeidsgiverListe(url: string | null) {
  if (!url) return Promise.resolve([]);

  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
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
