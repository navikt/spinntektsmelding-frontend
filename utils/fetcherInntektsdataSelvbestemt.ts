import NetworkError from './NetworkError';

import formatIsoDate from './formatIsoDate';

export default function fetcherInntektsdataSelvbestemt(
  url: string | null,
  identitetsnummer?: string,
  orgnrUnderenhet?: string,
  inntektsdato?: Date
) {
  if (!url) return Promise.resolve([]);
  if (!identitetsnummer) return Promise.resolve([]);
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sykmeldtFnr: identitetsnummer,
      orgnr: orgnrUnderenhet,
      inntektsdato: formatIsoDate(inntektsdato)
    })
  })
    .then((res) => {
      if (!res.ok) {
        const error = new NetworkError('Kunne ikke hente arbeidsforhold, vennligst prøv igjen senere');
        error.status = res.status;
        // error.info = res.json();
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
