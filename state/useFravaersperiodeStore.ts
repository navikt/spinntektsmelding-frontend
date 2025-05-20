import { nanoid } from 'nanoid';
import { StateCreator } from 'zustand';
import { Periode } from './state';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { PeriodeParam } from '../components/Bruttoinntekt/Periodevelger';
import { finnFravaersperioder } from './useEgenmeldingStore';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../utils/parseIsoDate';
import { finnAktuelleInntekter } from './useBruttoinntektStore';
import { ApiPeriodeSchema } from '../schema/ApiPeriodeSchema';
import { TidPeriodeSchema } from '../schema/TidPeriodeSchema';
import { z } from 'zod';

type ApiPeriode = z.infer<typeof ApiPeriodeSchema>;
type TidPeriode = z.infer<typeof TidPeriodeSchema>;

export interface FravaersperiodeState {
  sykmeldingsperioder?: Array<Periode>;
  opprinneligFravaersperiode?: Array<Periode>;
  leggTilFravaersperiode: () => void;
  slettFravaersperiode: (periodeId: string) => void;
  setFravaersperiodeDato: (periodeId: string, oppdatertPeriode: PeriodeParam | undefined) => void;
  tilbakestillFravaersperiode: () => void;
  initFravaersperiode: (mottatFravaersperiode: Array<ApiPeriode>) => void;
}

const useFravaersperiodeStore: StateCreator<CompleteState, [], [], FravaersperiodeState> = (set, get) => ({
  sykmeldingsperioder: undefined,
  opprinneligFravaersperiode: undefined,

  leggTilFravaersperiode: () => {
    let kopiPeriode = structuredClone(get().sykmeldingsperioder);
    set(
      produce((state) => {
        const nyFravaersperiode: Periode = { id: nanoid() };
        kopiPeriode ??= [];

        kopiPeriode.push(nyFravaersperiode);
        state.sykmeldingsperioder = kopiPeriode;

        return state;
      })
    );
  },

  slettFravaersperiode: (periodeId: string) =>
    set(
      produce((state) => {
        const utenValgt = state.sykmeldingsperioder?.filter((periode: Periode) => periode.id !== periodeId) ?? [];
        state.sykmeldingsperioder = utenValgt;
        state.sammeFravaersperiode = false;
        return state;
      })
    ),

  setFravaersperiodeDato: (periodeId: string, oppdatertPeriode: PeriodeParam | undefined) => {
    const skjaeringstidspunkt = get().skjaeringstidspunkt;
    const arbeidsgiverKanFlytteSkjæringstidspunkt = get().arbeidsgiverKanFlytteSkjæringstidspunkt;
    set(
      produce((state) => {
        if (state.sykmeldingsperioder) {
          state.sykmeldingsperioder = state.sykmeldingsperioder.map((periode: Periode) => {
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

        const fravaerPerioder = finnFravaersperioder(state.sykmeldingsperioder, state.egenmeldingsperioder);

        const fPerioder: TidPeriode[] = fravaerPerioder.filter((periode: TidPeriode) => {
          return periode.tom && periode.fom;
        });

        if (fPerioder && fPerioder.length > 0) {
          const agp = finnArbeidsgiverperiode(fPerioder);
          state.arbeidsgiverperioder = agp;
          const bestemmende = finnBestemmendeFravaersdag(
            fPerioder,
            agp,
            skjaeringstidspunkt,
            arbeidsgiverKanFlytteSkjæringstidspunkt()
          );
          if (bestemmende) {
            state.rekalkulerBruttoinntekt(parseIsoDate(bestemmende));
            state.bestemmendeFravaersdag = parseIsoDate(bestemmende);
            state.tidligereInntekt = finnAktuelleInntekter(state.opprinneligeInntekt, parseIsoDate(bestemmende)!);
          }
        }
        return state;
      })
    );
  },

  tilbakestillFravaersperiode: () => {
    const originale = get().opprinneligFravaersperiode;
    return set(
      produce((state) => {
        state.sykmeldingsperioder = structuredClone(originale);
        state.sammeFravaersperiode = false;
        return state;
      })
    );
  },

  initFravaersperiode: (mottatt) => {
    const konverterte = mottatt.map(({ fom, tom }) => ({
      id: nanoid(),
      fom: parseIsoDate(fom),
      tom: parseIsoDate(tom)
    }));
    return set(
      produce((state) => {
        state.sykmeldingsperioder = structuredClone(konverterte);
        state.opprinneligFravaersperiode = structuredClone(konverterte);
        return state;
      })
    );
  }
});

export default useFravaersperiodeStore;
