import useSWRImmutable from 'swr/immutable';
import environment from '../config/environment';
import fetcherInntektsdataForespurt from './fetcherInntektsdataForespurt';
import { commonSWRFormOptions } from './commonSWRFormOptions';

function useTidligereInntektsdata(forespoerselId: string, inntektsdato?: Date, skalHenteInntektsdata?: boolean) {
  return useSWRImmutable(
    [environment.inntektsdataUrl, forespoerselId, inntektsdato],
    ([url, forespoerselId, inntektsdato]) =>
      fetcherInntektsdataForespurt(skalHenteInntektsdata && inntektsdato ? url : null, forespoerselId, inntektsdato),
    {
      onError: (err) => {
        console.error('Kunne ikke hente arbeidsforhold', err);
      },
      ...commonSWRFormOptions
    }
  );
}

export default useTidligereInntektsdata;
