import create from 'zustand';
import produce from 'immer';
import { HistoriskInntekt, Inntekt } from './state';
import stringishToNumber from '../utils/stringishToNumber';
import { nanoid } from 'nanoid';
import { MottattHistoriskInntekt } from './MottattData';

interface BruttoinntektState {
  bruttoinntekt: Inntekt;
  tidligereInntekt?: Array<HistoriskInntekt>;
  setNyMaanedsinntekt: (belop: string) => void;
  selectEndringsaarsak: (aarsak: string) => void;
  tilbakestillMaanedsinntekt: () => void;
  bekreftKorrektInntekt: (bekreftet: boolean) => void;
  initBruttioinntekt: (bruttoInntekt: number, tidligereInntekt: Array<MottattHistoriskInntekt>) => void;
}

const useBruttoinntektStore = create<BruttoinntektState>((set) => ({
  bruttoinntekt: {
    bruttoInntekt: 0,
    bekreftet: false,
    manueltKorrigert: false,
    endringsaarsak: undefined
  },
  opprinneligbruttoinntekt: {
    bruttoInntekt: 0,
    bekreftet: false,
    manueltKorrigert: false,
    endringsaarsak: undefined
  },
  tidligereInntekt: undefined,
  setNyMaanedsinntekt: (belop: string) =>
    set(
      produce((state) => {
        state.bruttoinntekt.bruttoInntekt = stringishToNumber(belop);
        state.bruttoinntekt.manueltKorrigert = true;

        return state;
      })
    ),
  selectEndringsaarsak: (aarsak: string) =>
    set(
      produce((state) => {
        state.bruttoinntekt.endringsaarsak = aarsak;
        state.bruttoinntekt.manueltKorrigert = true;
        return state;
      })
    ),
  tilbakestillMaanedsinntekt: () =>
    set(
      produce((state) => {
        state.bruttoInntekt = { ...state.opprinneligbruttoinntekt };
        return state;
      })
    ),
  bekreftKorrektInntekt: (bekreftet: boolean) =>
    set(
      produce((state) => {
        state.bruttoinntekt!.bekreftet = bekreftet;
        return state;
      })
    ),
  initBruttioinntekt: (bruttoInntekt: number, tidligereInntekt: Array<MottattHistoriskInntekt>) =>
    set(
      produce((state) => {
        state.bruttoinntekt = {
          bruttoInntekt: bruttoInntekt,
          bekreftet: false,
          manueltKorrigert: false,
          endringsaarsak: ''
        };
        state.opprinneligbruttoinntekt = structuredClone(state.bruttoinntekt);

        if (tidligereInntekt) {
          state.tidligereInntekt = tidligereInntekt.map((inntekt) => ({
            maanedsnavn: inntekt.maanedsnavn,
            inntekt: inntekt.inntekt,
            id: nanoid()
          }));
        }
      })
    )
}));

export default useBruttoinntektStore;
