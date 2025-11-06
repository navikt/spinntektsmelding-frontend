import { useShallow } from 'zustand/react/shallow';
import useBoundStore from '../state/useBoundStore';
import { SkjemaStatus } from '../state/useSkjemadataStore';
import useTidligereInntektsdataForespurt from './useTidligereInntektsdataForespurt';
import useTidligereInntektsdataSelvbestemt from './useTidligereInntektsdataSelvbestemt';
import { isEqual, startOfMonth } from 'date-fns';

function useTidligereInntektsdata(
  sykmeldtFnr: string,
  avsenderOrgnr: string,
  inntektsdato: Date,
  skjemastatus: SkjemaStatus,
  forespoerselId: string,
  inngangFraKvittering: boolean
) {
  const { sisteLonnshentedato } = useBoundStore((state) => ({
    sisteLonnshentedato: state.sisteLonnshentedato
  }));
  const startInntektsMåned = inntektsdato ? startOfMonth(inntektsdato) : undefined;

  const erSelvbestemt = skjemastatus === SkjemaStatus.SELVBESTEMT;
  const skalHenteData =
    Boolean(startInntektsMåned) &&
    sisteLonnshentedato &&
    startInntektsMåned &&
    !isEqual(sisteLonnshentedato, startInntektsMåned);

  const { data: dataSelvbestemt, error: errorSelvbestemt } = useTidligereInntektsdataSelvbestemt(
    sykmeldtFnr,
    avsenderOrgnr,
    startInntektsMåned,
    erSelvbestemt && skalHenteData
  );

  const { data: dataForespurt, error: errorForespurt } = useTidligereInntektsdataForespurt(
    forespoerselId,
    startInntektsMåned,
    !erSelvbestemt && skalHenteData
  );

  const activeData = erSelvbestemt ? dataSelvbestemt : dataForespurt;
  const activeError = erSelvbestemt ? errorSelvbestemt : errorForespurt;

  const bruttoinntekt = !inngangFraKvittering && activeData?.gjennomsnitt ? activeData.gjennomsnitt : undefined;

  const tidligereInntekt =
    !inngangFraKvittering && activeData?.historikk
      ? new Map(Object.entries(activeData.historikk).map(([key, value]) => [key, value] as [string, number | null]))
      : undefined;

  return {
    data: activeData,
    error: activeError,
    bruttoinntekt,
    tidligereInntekt
  };
}

export default useTidligereInntektsdata;
