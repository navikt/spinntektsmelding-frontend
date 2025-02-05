import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherInntektsdataSelvbestemt from './fetcherInntektsdataSelvbestemt';

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
        console.error('Kunne ikke hente arbeidsforhold', err);
      },
      refreshInterval: 0,
      shouldRetryOnError: false
    }
  );
}

export default useTidligereInntektsdata;
