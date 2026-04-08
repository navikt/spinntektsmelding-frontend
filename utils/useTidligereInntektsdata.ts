import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherInntektsdataSelvbestemt from './fetcherInntektsdataSelvbestemt';
import { commonSWRFormOptions } from './commonSWRFormOptions';

function useTidligereInntektsdata(
  identitetsnummer: string,
  orgnrUnderenhet: string,
  inntektsdato?: Date,
  skalHenteInntektsdata?: boolean
) {
  return useSWRImmutable(
    skalHenteInntektsdata
      ? [environment.inntektsdataSelvbestemtUrl, identitetsnummer, orgnrUnderenhet, inntektsdato]
      : null,
    ([url, idToken, orgnr, dato]) => fetcherInntektsdataSelvbestemt(url, idToken, orgnr, dato),
    {
      onError: (err) => {
        console.error('Kunne ikke hente arbeidsforhold', err);
      },
      ...commonSWRFormOptions
    }
  );
}

export default useTidligereInntektsdata;
