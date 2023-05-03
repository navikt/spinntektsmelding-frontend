import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { Periode } from './state';
import { nanoid } from 'nanoid';
import { PeriodeParam } from '../components/Bruttoinntekt/Periodevelger';
import parseIsoDate from '../utils/parseIsoDate';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import { isValid } from 'date-fns';
import validerPeriodeEgenmelding from '../validators/validerPeriodeEgenmelding';
import { ValiderResultat } from '../utils/useValiderInntektsmelding';
import { slettFeilmeldingFraState } from './useFeilmeldingerStore';
import { MottattPeriode } from './MottattData';

export interface ArbeidsgiverperiodeState {
  bestemmendeFravaersdag?: Date;
  arbeidsgiverperioder?: Array<Periode>;
  endringsbegrunnelse?: string;
  endretArbeidsgiverperiode: boolean;
  setBestemmendeFravaersdag: (bestemmendeFravaersdag: Date | undefined) => void;
  setArbeidsgiverperioder: (arbeidsgiverperioder: Array<Periode> | undefined) => void;
  initArbeidsgiverperioder: (arbeidsgiverperioder: Array<MottattPeriode> | undefined) => void;
  setEndringsbegrunnelse: (begrunnelse: string) => void;
  leggTilArbeidsgiverperiode: () => void;
  slettArbeidsgiverperiode: (periodeId: string) => void;
  setArbeidsgiverperiodeDato: (dateValue: PeriodeParam | undefined, periodeId: string) => void;
  setEndreArbeidsgiverperiode: (endre: boolean) => void;
  tilbakestillArbeidsgiverperiode: () => void;
}

const useArbeidsgiverperioderStore: StateCreator<CompleteState, [], [], ArbeidsgiverperiodeState> = (set, get) => {
  return {
    bestemmendeFravaersdag: undefined,
    arbeidsgiverperioder: undefined,
    endretArbeidsgiverperiode: false,
    setBestemmendeFravaersdag: (bestemmendeFravaersdag) => {
      set(
        produce((state) => {
          state.bestemmendeFravaersdag = bestemmendeFravaersdag;

          return state;
        })
      );
    },
    setArbeidsgiverperioder: (arbeidsgiverperioder) =>
      set(
        produce((state) => {
          state.arbeidsgiverperioder = arbeidsgiverperioder;

          return state;
        })
      ),
    initArbeidsgiverperioder: (arbeidsgiverperioder) =>
      set(
        produce((state) => {
          state.arbeidsgiverperioder = arbeidsgiverperioder
            ? arbeidsgiverperioder.map((periode) => ({
                fom: parseIsoDate(periode.fom),
                tom: parseIsoDate(periode.tom),
                id: nanoid()
              }))
            : undefined;

          return state;
        })
      ),
    leggTilArbeidsgiverperiode: () =>
      set(
        produce((state) => {
          const nyArbeidsgiverperiode: Periode = { id: nanoid() };
          state.endretArbeidsgiverperiode = true;
          if (state.arbeidsgiverperioder) {
            state.arbeidsgiverperioder.push(nyArbeidsgiverperiode);
          } else {
            state.arbeidsgiverperioder = [nyArbeidsgiverperiode];
          }

          return state;
        })
      ),
    slettArbeidsgiverperiode: (periodeId: string) =>
      set(
        produce((state) => {
          const nyePerioder = state.arbeidsgiverperioder.filter((periode: Periode) => periode.id !== periodeId);
          state.arbeidsgiverperioder = nyePerioder.length === 0 ? [{ id: nanoid() }] : nyePerioder;
          state.endretArbeidsgiverperiode = true;

          const feilkoderArbeidsgiverperioder: Array<ValiderResultat> = validerPeriodeEgenmelding(
            state.arbeidsgiverperioder,
            'arbeidsgiverperioder'
          );

          state.feilmeldinger = state.oppdaterFeilmeldinger(feilkoderArbeidsgiverperioder, 'arbeidsgiverperioder');
          return state;
        })
      ),
    setArbeidsgiverperiodeDato: (dateValue: PeriodeParam | undefined, periodeId: string) => {
      set(
        produce((state) => {
          state.arbeidsgiverperioder = state.arbeidsgiverperioder.map((periode: Periode) => {
            if (periode.id === periodeId) {
              periode.tom = dateValue?.tom;
              periode.fom = dateValue?.fom;
              return periode;
            }
            return periode;
          });

          state.endretArbeidsgiverperiode = true;

          const feilkoderArbeidsgiverperioder: Array<ValiderResultat> = validerPeriodeEgenmelding(
            state.arbeidsgiverperioder,
            'arbeidsgiverperioder'
          );

          state.feilmeldinger = state.oppdaterFeilmeldinger(feilkoderArbeidsgiverperioder, 'arbeidsgiverperioder');

          return state;
        })
      );
    },
    setEndreArbeidsgiverperiode: (endre: boolean) => {
      set(
        produce((state) => {
          state.endretArbeidsgiverperiode = endre;

          return state;
        })
      );
    },
    setEndringsbegrunnelse: (begrunnelse) =>
      set(
        produce((state) => {
          state.endringsbegrunnelse = begrunnelse;

          return state;
        })
      ),
    tilbakestillArbeidsgiverperiode: () => {
      set(
        produce((state) => {
          const periode = state.fravaersperioder
            ? state.fravaersperioder.concat(state.egenmeldingsperioder)
            : [].concat(state.egenmeldingsperioder);

          const aperioder = finnArbeidsgiverperiode(periode);

          state.arbeidsgiverperioder = aperioder.filter(
            (periode) => periode.fom && periode.tom && isValid(periode.fom) && isValid(periode.tom)
          );

          slettFeilmeldingFraState(state, 'arbeidsgiverperiode-feil');

          state.endretArbeidsgiverperiode = false;
          return state;
        })
      );
    }
  };
};

export default useArbeidsgiverperioderStore;
