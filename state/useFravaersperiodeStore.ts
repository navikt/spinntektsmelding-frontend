import { nanoid } from 'nanoid';
import { StateCreator } from 'zustand';
import { parseISO } from 'date-fns';
import { MottattPeriode } from './MottattData';
import { Periode } from './state';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { PeriodeParam } from '../components/Bruttoinntekt/Periodevelger';
import { finnFravaersperioder } from './useEgenmeldingStore';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../utils/parseIsoDate';
import { finnAktuelleInntekter } from './useBruttoinntektStore';

export interface FravaersperiodeState {
  fravaersperioder?: Array<Periode>;
  opprinneligFravaersperiode?: Array<Periode>;
  leggTilFravaersperiode: () => void;
  slettFravaersperiode: (periodeId: string) => void;
  setFravaersperiodeDato: (periodeId: string, oppdatertPeriode: PeriodeParam | undefined) => void;
  tilbakestillFravaersperiode: () => void;
  initFravaersperiode: (mottatFravaersperiode: Array<MottattPeriode>) => void;
}

const useFravaersperiodeStore: StateCreator<CompleteState, [], [], FravaersperiodeState> = (set, get) => ({
  fravaersperioder: undefined,
  opprinneligFravaersperiode: undefined,

  leggTilFravaersperiode: () => {
    let kopiPeriode = structuredClone(get().fravaersperioder);
    set(
      produce((state) => {
        const nyFravaersperiode: Periode = { id: nanoid() };
        if (!kopiPeriode) {
          kopiPeriode = [];
        }
        kopiPeriode.push(nyFravaersperiode);
        state.fravaersperioder = kopiPeriode;

        return state;
      })
    );
  },

  slettFravaersperiode: (periodeId: string) =>
    set(
      produce((state) => {
        if (state.fravaersperioder) {
          if (state.fravaersperioder) {
            const nyePerioder = state.fravaersperioder.filter((periode: Periode) => periode.id !== periodeId);
            state.fravaersperioder = nyePerioder;
          }
        }

        state.sammeFravaersperiode = false;

        return state;
      })
    ),

  setFravaersperiodeDato: (periodeId: string, oppdatertPeriode: PeriodeParam | undefined) => {
    const forespurtBestemmendeFraværsdag = get().foreslaattBestemmendeFravaersdag;
    const arbeidsgiverKanFlytteSkjæringstidspunkt = get().arbeidsgiverKanFlytteSkjæringstidspunkt;
    set(
      produce((state) => {
        if (state.fravaersperioder) {
          state.fravaersperioder = state.fravaersperioder.map((periode: Periode) => {
            if (periode.id === periodeId) {
              if (periode.tom !== oppdatertPeriode?.tom || periode.fom !== oppdatertPeriode?.fom) {
                state.sammeFravaersperiode = false;
              }
              periode.tom = oppdatertPeriode?.tom;
              periode.fom = oppdatertPeriode?.fom;
            }
            return periode;
          });
        }

        const fravaerPerioder = finnFravaersperioder(state.fravaersperioder, state.egenmeldingsperioder);

        const fPerioder: Periode[] = fravaerPerioder.filter((periode: Periode) => {
          return periode.tom && periode.fom;
        });

        if (fPerioder && fPerioder.length > 0) {
          const agp = finnArbeidsgiverperiode(fPerioder);
          state.arbeidsgiverperioder = agp;
          const bestemmende = finnBestemmendeFravaersdag(
            fPerioder,
            agp,
            forespurtBestemmendeFraværsdag,
            arbeidsgiverKanFlytteSkjæringstidspunkt()
          );
          if (bestemmende) {
            state.rekalkulerBruttoinntekt(parseIsoDate(bestemmende));
            state.bestemmendeFravaersdag = parseIsoDate(bestemmende);
            state.tidligereInntekt = finnAktuelleInntekter(state.opprinneligeInntekt, parseIsoDate(bestemmende));
          }
        }
        return state;
      })
    );
  },

  tilbakestillFravaersperiode: () => {
    const tilbakestiltPeriode = get().opprinneligFravaersperiode;
    const klonetFravaersperiode = structuredClone(tilbakestiltPeriode);
    return set(
      produce((state) => {
        state.fravaersperioder = klonetFravaersperiode;

        state.sammeFravaersperiode = false;
        return state;
      })
    );
  },

  initFravaersperiode: (mottattFravaerPerioder: Array<MottattPeriode>) => {
    const fravaerPerioder: Array<Periode> = mottattFravaerPerioder.map((periode) => ({
      fom: parseISO(periode.fom),
      tom: parseISO(periode.tom),
      id: nanoid()
    }));

    return set(
      produce((state) => {
        state.fravaersperioder = structuredClone(fravaerPerioder);
        state.opprinneligFravaersperiode = structuredClone(fravaerPerioder);

        return state;
      })
    );
  }
});

export default useFravaersperiodeStore;
