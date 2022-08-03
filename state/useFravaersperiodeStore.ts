import { nanoid } from 'nanoid';
import create from 'zustand';
import { parseISO } from 'date-fns';
import parseIsoDate from '../utils/parseIsoDate';
import { MottattPeriode } from './MottattData';
import { Periode } from './state';
import produce from 'immer';

interface FravaersperiodeState {
  fravaersperiode?: { [key: string]: Array<Periode> };
  opprinneligFravaersperiode?: { [key: string]: Array<Periode> };
  sammeFravaersperiode: boolean;
  leggTilFravaersperiode: (arbeidsforholdId: string) => void;
  slettFravaersperiode: (arbeidsforholdId: string, periodeId: string) => void;
  setFravaersperiodeFraDato: (arbeidsforholdId: string, periodeId: string, nyFraDato: string) => void;
  setFravaersperiodeTilDato: (arbeidsforholdId: string, periodeId: string, nyTilDato: string) => void;
  tilbakestillFravaersperiode: (arbeidsforholdId: string) => void;
  setSammeFravarePaaArbeidsforhold: (arbeidsforholdId: string, status: boolean) => void;
  endreFravaersperiode: () => void;
  initFravaersperiode: (mottatFravaersperiode: { [key: string]: Array<MottattPeriode> }) => void;
}

const useFravaersperiodeStore = create<FravaersperiodeState>()((set) => ({
  fravaersperiode: undefined,
  opprinneligFravaersperiode: undefined,
  sammeFravaersperiode: false,

  leggTilFravaersperiode: (arbeidsforholdId) =>
    set(
      produce((state) => {
        const nyFravaersperiode: Periode = { id: nanoid() };
        if (state.fravaersperiode) {
          if (!state.fravaersperiode[arbeidsforholdId]) {
            state.fravaersperiode[arbeidsforholdId] = [];
          }
        } else {
          state.fravaersperiode = {};
          state.fravaersperiode[arbeidsforholdId] = [];
        }
        state.fravaersperiode[arbeidsforholdId].push(nyFravaersperiode);

        return state;
      })
    ),

  slettFravaersperiode: (arbeidsforholdId: string, periodeId: string) =>
    set(
      produce((state) => {
        if (state.fravaersperiode) {
          if (state.fravaersperiode && state.fravaersperiode[arbeidsforholdId]) {
            const nyePerioder = state.fravaersperiode[arbeidsforholdId].filter(
              (periode: Periode) => periode.id !== periodeId
            );
            state.fravaersperiode[arbeidsforholdId] = nyePerioder;
          }
        }

        state.sammeFravaersperiode = false;

        return state;
      })
    ),

  setFravaersperiodeFraDato: (arbeidsforholdId: string, periodeId: string, nyFraDato: string) =>
    set(
      produce((state) => {
        if (state.fravaersperiode && state.fravaersperiode[arbeidsforholdId]) {
          state.fravaersperiode[arbeidsforholdId] = state.fravaersperiode[arbeidsforholdId].map((periode: Periode) => {
            if (periode.id === periodeId) {
              periode.fra = parseIsoDate(nyFraDato);
            }
            return periode;
          });
        }
        state.sammeFravaersperiode = false;
        return state;
      })
    ),

  setFravaersperiodeTilDato: (arbeidsforholdId: string, periodeId: string, nyTilDato: string) =>
    set(
      produce((state) => {
        if (state.fravaersperiode && state.fravaersperiode[arbeidsforholdId]) {
          state.fravaersperiode[arbeidsforholdId] = state.fravaersperiode[arbeidsforholdId].map((periode: Periode) => {
            if (periode.id === periodeId) {
              periode.til = parseIsoDate(nyTilDato);
            }
            return periode;
          });
        }
        state.sammeFravaersperiode = false;
        return state;
      })
    ),

  tilbakestillFravaersperiode: (arbeidsforholdId: string) =>
    set(
      produce((state) => {
        if (state.fravaersperiode?.[arbeidsforholdId] && state.opprinneligFravaersperiode?.[arbeidsforholdId]) {
          const clone = state.opprinneligFravaersperiode[arbeidsforholdId].map((periode: Periode) => ({
            til: periode.til,
            fra: periode.fra,
            id: periode.id
          }));
          state.fravaersperiode[arbeidsforholdId] = clone;
        }
        state.sammeFravaersperiode = false;
        return state;
      })
    ),

  setSammeFravarePaaArbeidsforhold: (arbeidsforholdId: string, status: boolean) =>
    set(
      produce((state) => {
        if (status) {
          const fravaersKeys = Object.keys(state.fravaersperiode!);
          if (state.fravaersperiode && fravaersKeys.indexOf(arbeidsforholdId) > -1) {
            state.sammeFravaersperiode = true;
          }

          if (state.fravaersperiode?.[arbeidsforholdId]) {
            const periodeMaster: Periode[] = state.fravaersperiode[arbeidsforholdId];

            const oppdaterbarePerioder = fravaersKeys.filter((key) => key !== arbeidsforholdId);

            oppdaterbarePerioder.forEach((forholdId) => {
              if (forholdId !== arbeidsforholdId) {
                state.fravaersperiode![forholdId] = periodeMaster.map((periode) => {
                  return {
                    ...periode,
                    id: nanoid()
                  };
                });
              }
            });
          }
        }

        state.sammeFravaersperiode = status;

        return state;
      })
    ),

  endreFravaersperiode: () =>
    set(
      produce((state) => {
        state.sammeFravaersperiode = false;

        return state;
      })
    ),

  initFravaersperiode: (mottatFravaersperioder: { [key: string]: Array<MottattPeriode> }) =>
    set(
      produce((state) => {
        const fravaersKeys = Object.keys(mottatFravaersperioder) || [];

        if (fravaersKeys.length > 0) {
          state.fravaersperiode = {};
          fravaersKeys.forEach((fKey: string) => {
            const tmpPeriode: Array<Periode> = mottatFravaersperioder[fKey].map((periode: MottattPeriode) => ({
              fra: parseISO(periode.fra),
              til: parseISO(periode.til),
              id: nanoid()
            }));
            state.fravaersperiode![fKey] = tmpPeriode;
          });
        }

        state.opprinneligFravaersperiode = structuredClone({ ...state.fravaersperiode });

        return state;
      })
    )
}));

export default useFravaersperiodeStore;
