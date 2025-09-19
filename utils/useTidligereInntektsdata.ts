import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherInntektsdataSelvbestemt from './fetcherInntektsdataSelvbestemt';
import { commonSWRFormOptions } from './commonSWRFormOptions';

function useTidligereInntektsdata(
  identitetsnummer: string,
  orgnrUnderenhet: string,
  inntektsdato: Date,
  skalHenteInntektsdata: boolean
) {
  return useSWRImmutable(
    [environment.inntektsdataSelvbestemtUrl, identitetsnummer, orgnrUnderenhet, inntektsdato],
    ([url, idToken, orgnrUnderenhet, inntektsdato]) =>
      fetcherInntektsdataSelvbestemt(skalHenteInntektsdata ? url : null, idToken, orgnrUnderenhet, inntektsdato),
    {
      onError: (err) => {
        console.warn('Kunne ikke hente arbeidsforhold', err);
      },
      ...commonSWRFormOptions
    }
  );
}

export default useTidligereInntektsdata;
