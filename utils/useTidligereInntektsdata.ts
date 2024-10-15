import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherInntektsdataSelvbestemt from './fetcherInntektsdataSelvbestemt';

function useTidligereInntektsdata(
  identitetsnummer: string,
  orgnrUnderenhet: string,
  inntektsdato: Date,
  forespoerselId: string,
  skalHenteInntektsdata: boolean
) {
  return useSWRImmutable(
    [finnRiktigUrl(forespoerselId), identitetsnummer, orgnrUnderenhet, inntektsdato],
    ([url, idToken, orgnrUnderenhet, inntektsdato]) =>
      fetcherInntektsdataSelvbestemt(
        skalHenteInntektsdata ? url : null,
        idToken,
        orgnrUnderenhet,
        inntektsdato,
        forespoerselId
      ),
    {
      onError: (err) => {
        console.error('Kunne ikke hente tidligere inntektsdata', err);
        // if (err.status === 401) {
        //   const ingress = window.location.hostname + environment.baseUrl;
        //   const currentPath = window.location.href;

        //   window.location.replace(`https://${ingress}/oauth2/login?redirect=${currentPath}`);
        // }

        // if (err.status !== 200) {
        //   backendFeil.current.push({
        //     felt: 'Backend',
        //     text: 'Kunne ikke hente arbeidsforhold'
        //   });
        // }
      },
      refreshInterval: 0,
      shouldRetryOnError: false
    }
  );
}

const finnRiktigUrl = (forespoerselId: string) => {
  if (forespoerselId === 'arbeidsgiverInitiertInnsending') {
    return environment.inntektsdataSelvbestemtUrl;
  } else {
    return environment.inntektsdataUrl;
  }
};

export default useTidligereInntektsdata;
