import NetworkError from './NetworkError';
import formatIsoDate from './formatIsoDate';

export default function fetcherInntektsdataSelvbestemt(
  url: string | null,
  identitetsnummer: string,
  orgnrUnderenhet: string,
  inntektsdato: Date,
  forespoerselId: string
) {
  if (!url) return Promise.resolve([]);
  if (!identitetsnummer) return Promise.resolve([]);
  let requestBody = {};

  if (forespoerselId === 'arbeidsgiverInitiertInnsending') {
    requestBody = JSON.stringify({
      sykmeldtFnr: identitetsnummer,
      orgnr: orgnrUnderenhet,
      inntektsdato: formatIsoDate(inntektsdato)
    });
  } else {
    requestBody = JSON.stringify({
      forespoerselId: forespoerselId,
      skjaeringstidspunkt: formatIsoDate(inntektsdato)
    });
  }

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: requestBody
  })
    .then((res) => {
      if (!res.ok) {
        const error = new NetworkError('Kunne ikke hente arbeidsforhold, vennligst prøv igjen senere');
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
