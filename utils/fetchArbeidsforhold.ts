import { Ansettelsesforhold } from '../schema/AnsettelsesforholdSchema';
import formatIsoDate from './formatIsoDate';
import NetworkError from './NetworkError';

type FetchArbeidsforholdParams = {
  orgnr: string;
  sykmeldtFnr: string;
  fom: string;
  tom: string;
};

export default function fetchArbeidsforhold(
  orgnr: string,
  sykmeldtFnr?: string,
  fom?: Date,
  tom?: Date
): Promise<Ansettelsesforhold> {
  if (!sykmeldtFnr || !fom || !tom || !orgnr) {
    const fetchError = new NetworkError('Kunne ikke hente arbeidsforhold, parameter mangler');
    throw fetchError;
  }

  const fullUrl = 'http://' + process.env.NEXT_PUBLIC_IM_API_URI + '/api/v1/arbeidsforhold';

  return fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ orgnr, sykmeldtFnr, fom: formatIsoDate(fom), tom: formatIsoDate(tom) })
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
