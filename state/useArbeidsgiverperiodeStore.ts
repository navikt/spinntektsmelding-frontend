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
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';

export interface ArbeidsgiverperiodeState {
  bestemmendeFravaersdag?: Date;
  arbeidsgiverperioder?: Array<Periode>;
  endringsbegrunnelse?: string;
  endretArbeidsgiverperiode: boolean;
  opprinneligArbeidsgiverperioder?: Array<Periode>;
  setBestemmendeFravaersdag: (bestemmendeFravaersdag: Date | undefined) => void;
  setArbeidsgiverperioder: (arbeidsgiverperioder: Array<Periode> | undefined) => void;
  initArbeidsgiverperioder: (arbeidsgiverperioder: Array<MottattPeriode> | undefined) => void;
  setEndringsbegrunnelse: (begrunnelse: string) => void;
  leggTilArbeidsgiverperiode: () => void;
  slettArbeidsgiverperiode: (periodeId: string) => void;
  setArbeidsgiverperiodeDato: (dateValue: PeriodeParam | undefined, periodeId: string) => void;
  setEndreArbeidsgiverperiode: (endre: boolean) => void;
  tilbakestillArbeidsgiverperiode: () => void;
  harArbeidsgiverperiodenBlittEndret: () => void;
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
          const perioder = arbeidsgiverperioder
            ? arbeidsgiverperioder.map((periode) => ({
                fom: parseIsoDate(periode.fom),
                tom: parseIsoDate(periode.tom),
                id: nanoid()
              }))
            : undefined;

          state.arbeidsgiverperioder = structuredClone(perioder);
          state.opprinneligArbeidsgiverperioder = structuredClone(perioder);
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
      const opprinnelig = get().opprinneligArbeidsgiverperioder;
      const egenmeldingsperioder = get().egenmeldingsperioder;
      const sykmeldingsperioder = get().fravaersperioder;
      set(
        produce((state) => {
          const perioder = sykmeldingsperioder
            ? sykmeldingsperioder.concat(egenmeldingsperioder)
            : egenmeldingsperioder;

          const bestemmendeFravaersdag = finnBestemmendeFravaersdag(perioder);
          if (bestemmendeFravaersdag) state.bestemmendeFravaersdag = parseIsoDate(bestemmendeFravaersdag);

          const arbeidsgiverperiode = finnArbeidsgiverperiode(perioder);

          if (arbeidsgiverperiode) {
            state.arbeidsgiverperioder = arbeidsgiverperiode;
            console.log('utregnet arbeidsgiverperiode', arbeidsgiverperiode);
          } else {
            state.arbeidsgiverperioder = structuredClone(opprinnelig);
            console.log('opprinnelig arbeidsgiverperiode', opprinnelig);
          }

          slettFeilmeldingFraState(state, 'arbeidsgiverperiode-feil');

          state.endretArbeidsgiverperiode = false;
          return state;
        })
      );
    },
    harArbeidsgiverperiodenBlittEndret: () => {
      const opprinnelig = get().opprinneligArbeidsgiverperioder;
      const egenmeldingsperioder = get().egenmeldingsperioder;
      const sykmeldingsperioder = get().fravaersperioder;
      set(
        produce((state) => {
          const perioder = sykmeldingsperioder
            ? sykmeldingsperioder.concat(egenmeldingsperioder)
            : egenmeldingsperioder;

          if (!opprinnelig) {
            return state;
          }
          const uendret = perioder.find((periode) =>
            opprinnelig?.find((opprinneligPeriode) => opprinneligPeriode.fom === periode.fom)
          );

          if (!uendret) {
            state.endretArbeidsgiverperiode = true;
          }

          return state;
        })
      );
    }
  };
};

export default useArbeidsgiverperioderStore;
