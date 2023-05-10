import { nanoid } from 'nanoid';
import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { Periode } from './state';
import parseIsoDate from '../utils/parseIsoDate';
import { MottattPeriode } from './MottattData';
import { CompleteState } from './useBoundStore';
import { PeriodeParam } from '../components/Bruttoinntekt/Periodevelger';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import { finnAktuelleInntekter } from './useBruttoinntektStore';

export interface EgenmeldingState {
  egenmeldingsperioder?: Array<Periode>;
  opprinneligEgenmeldingsperiode?: Array<Periode>;
  endreEgenmeldingsperiode: boolean;
  setEgenmeldingDato: (dateValue: PeriodeParam | undefined, periodeId: string) => void;
  slettEgenmeldingsperiode: (periodeId: string) => void;
  leggTilEgenmeldingsperiode: () => void;
  setEndreEgenmelding: (status: boolean) => void;
  tilbakestillEgenmelding: () => void;
  initEgenmeldingsperiode: (egenmeldingsperioder: Array<MottattPeriode>) => void;
}

const useEgenmeldingStore: StateCreator<CompleteState, [], [], EgenmeldingState> = (set, get) => ({
  egenmeldingsperioder: undefined,
  endreEgenmeldingsperiode: false,
  setEgenmeldingDato: (dateValue: PeriodeParam | undefined, periodeId: string) =>
    set(
      produce((state) => {
        if (periodeId === 'nyperiode') {
          if (dateValue && (dateValue.fom || dateValue?.tom)) {
            state.egenmeldingsperioder = [{ ...dateValue, id: nanoid() }];
          }
        } else {
          state.egenmeldingsperioder = state.egenmeldingsperioder.map((periode: Periode) => {
            if (periode.id === periodeId) {
              periode.tom = dateValue?.tom;
              periode.fom = dateValue?.fom;
              return periode;
            }
            return state;
          });

          const fPerioder = finnFravaersperioder(state.fravaersperioder, state.egenmeldingsperioder);
          if (fPerioder) {
            const agp = finnArbeidsgiverperiode(fPerioder);
            state.arbeidsgiverperioder = agp;
            const bestemmende = finnBestemmendeFravaersdag(fPerioder);
            if (bestemmende) {
              state.rekalkulerBruttioinntekt(parseIsoDate(bestemmende));
              state.bestemmendeFravaersdag = parseIsoDate(bestemmende);
              state.tidligereInntekt = finnAktuelleInntekter(state.opprinneligeInntekt, parseIsoDate(bestemmende));
            }
          }
        }
        return state;
      })
    ),
  slettEgenmeldingsperiode: (periodeId: string) =>
    set(
      produce((state) => {
        const nyePerioder = state.egenmeldingsperioder.filter((periode: Periode) => periode.id !== periodeId);
        state.egenmeldingsperioder = nyePerioder.length === 0 ? [{ id: nanoid() }] : nyePerioder;

        return state;
      })
    ),
  leggTilEgenmeldingsperiode: () =>
    set(
      produce((state) => {
        const nyEgenmeldingsperiode: Periode = { id: nanoid() };

        if (state.egenmeldingsperioder) {
          state.egenmeldingsperioder.push(nyEgenmeldingsperiode);
        } else {
          state.egenmeldingsperioder = [nyEgenmeldingsperiode];
        }

        return state;
      })
    ),

  setEndreEgenmelding: (status: boolean) => {
    set(
      produce((state) => {
        state.endreEgenmeldingsperiode = status;

        return state;
      })
    );
  },
  tilbakestillEgenmelding: () => {
    const clonedEgenmelding = structuredClone(get().opprinneligEgenmeldingsperiode);

    set(
      produce((state) => {
        state.egenmeldingsperioder = clonedEgenmelding;

        if (clonedEgenmelding && clonedEgenmelding.length > 0 && clonedEgenmelding[0].fom) {
          state.endreEgenmeldingsperiode = false;
        }

        return state;
      })
    );
  },
  initEgenmeldingsperiode: (egenmeldingsperioder: Array<MottattPeriode>) => {
    set(
      produce((state) => {
        state.egenmeldingsperioder = [];

        if (egenmeldingsperioder && egenmeldingsperioder.length > 0) {
          state.endreEgenmeldingsperiode = false;
          state.egenmeldingsperioder = egenmeldingsperioder.map((periode) => ({
            fom: parseIsoDate(periode.fom),
            tom: parseIsoDate(periode.tom),
            id: nanoid()
          }));
        } else {
          // state.egenmeldingsperioder = [{ id: nanoid() }];
          state.endreEgenmeldingsperiode = true;
        }

        state.opprinneligEgenmeldingsperiode = structuredClone(state.egenmeldingsperioder);
        return state;
      })
    );
  }
});

export default useEgenmeldingStore;

function finnFravaersperioder(fravaersperioder: Array<Periode>, egenmeldingsperioder: Array<Periode>) {
  const perioder =
    fravaersperioder && egenmeldingsperioder ? fravaersperioder.concat(egenmeldingsperioder) : fravaersperioder;

  const fPerioder = perioder?.filter((periode) => periode.fom && periode.tom);
  return fPerioder;
}
