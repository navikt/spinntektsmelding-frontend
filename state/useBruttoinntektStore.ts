import { StateCreator } from 'zustand';
import produce from 'immer';
import { HistoriskInntekt, Inntekt } from './state';
import stringishToNumber from '../utils/stringishToNumber';
import { MottattHistoriskInntekt } from './MottattData';
import feiltekster from '../utils/feiltekster';
import { leggTilFeilmelding, slettFeilmelding } from './useFeilmeldingerStore';
import { CompleteState } from './useBoundStore';

const sorterInntekter = (a: HistoriskInntekt, b: HistoriskInntekt) => {
  if (a.maanedsnavn < b.maanedsnavn) {
    return 1;
  } else {
    return -1;
  }
};

export interface BruttoinntektState {
  bruttoinntekt: Inntekt;
  tidligereInntekt?: Array<HistoriskInntekt>;
  opprinneligeInntekt?: Array<HistoriskInntekt>;
  setNyMaanedsinntekt: (belop: string) => void;
  setNyMaanedsinntektBlanktSkjema: (belop: string) => void;
  setEndringsaarsak: (aarsak: string) => void;
  tilbakestillMaanedsinntekt: () => void;
  bekreftKorrektInntekt: (bekreftet: boolean) => void;
  initBruttioinntekt: (
    bruttoInntekt: number,
    tidligereInntekt: Array<MottattHistoriskInntekt>,
    bestemmendeFravaersdag: Date
  ) => void;
  rekalkulerBruttioinntekt: (bestemmendeFravaersdag: Date) => void;
}

const useBruttoinntektStore: StateCreator<CompleteState, [], [], BruttoinntektState> = (set, get) => ({
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
        if (state.bruttoinntekt.bruttoInntekt && state.bruttoinntekt.bruttoInntekt > 0) {
          state = slettFeilmelding(state, 'bruttoinntekt-endringsbelop');
        } else {
          state = leggTilFeilmelding(state, 'bruttoinntekt-endringsbelop', feiltekster.BRUTTOINNTEKT_MANGLER);
        }

        return state;
      })
    ),
  setNyMaanedsinntektBlanktSkjema: (belop: string) =>
    set(
      produce((state) => {
        state.bruttoinntekt.bruttoInntekt = stringishToNumber(belop);
        state.bruttoinntekt.manueltKorrigert = false;
        state.bruttoinntekt.bekreftet = true;
        if (state.bruttoinntekt.bruttoInntekt && state.bruttoinntekt.bruttoInntekt > 0) {
          state = slettFeilmelding(state, 'bruttoinntekt-endringsbelop');
          state = slettFeilmelding(state, 'bruttoinntektbekreft');
        } else {
          state = leggTilFeilmelding(state, 'bruttoinntekt-endringsbelop', feiltekster.BRUTTOINNTEKT_MANGLER);
        }

        return state;
      })
    ),

  setEndringsaarsak: (aarsak: string) =>
    set(
      produce((state) => {
        state.bruttoinntekt.endringsaarsak = aarsak;
        state.bruttoinntekt.manueltKorrigert = true;

        if (aarsak && aarsak !== '') {
          state = slettFeilmelding(state, 'bruttoinntekt-endringsaarsak');
        } else {
          state = leggTilFeilmelding(state, 'bruttoinntekt-endringsaarsak', feiltekster.ENDRINGSAARSAK_MANGLER);
        }

        return state;
      })
    ),
  tilbakestillMaanedsinntekt: () =>
    set(
      produce((state) => {
        state.bruttoinntekt = { ...state.opprinneligbruttoinntekt };
        return state;
      })
    ),
  bekreftKorrektInntekt: (bekreftet: boolean) =>
    set(
      produce((state) => {
        state.bruttoinntekt!.bekreftet = bekreftet;
        if (bekreftet === true) {
          state = slettFeilmelding(state, 'bruttoinntektbekreft');
        } else {
          state = leggTilFeilmelding(state, 'bruttoinntektbekreft', feiltekster.IKKE_BEKREFTET);
        }

        return state;
      })
    ),
  initBruttioinntekt: (
    bruttoInntekt: number,
    tidligereInntekt: Array<MottattHistoriskInntekt>,
    bestemmendeFravaersdag: Date
  ) => {
    const bestMnd = `00${bestemmendeFravaersdag.getMonth() + 1}`.slice(-2);
    const bestemmendeMaaned = `${bestemmendeFravaersdag.getFullYear()}-${bestMnd}`;

    const aktuelleInntekter = tidligereInntekt
      .filter((inntekt) => inntekt.maanedsnavn < bestemmendeMaaned)
      .sort(sorterInntekter)
      .slice(0, 3);
    console.log(aktuelleInntekter);

    const sumInntekter = aktuelleInntekter.reduce(
      (prev, cur) => {
        prev.inntekt += cur.inntekt;
        return prev;
      },
      { inntekt: 0, maanedsnavn: '' }
    );

    const snittInntekter = sumInntekter.inntekt / aktuelleInntekter.length;

    set(
      produce((state) => {
        state.bruttoinntekt = {
          bruttoInntekt: snittInntekter,
          bekreftet: false,
          manueltKorrigert: false,
          endringsaarsak: ''
        };
        state.opprinneligbruttoinntekt = {
          bruttoInntekt: snittInntekter,
          bekreftet: false,
          manueltKorrigert: false,
          endringsaarsak: ''
        };

        state.opprinneligeInntekt = tidligereInntekt;

        if (aktuelleInntekter) {
          state.tidligereInntekt = aktuelleInntekter.map((inntekt) => ({
            maanedsnavn: inntekt.maanedsnavn,
            inntekt: inntekt.inntekt
          }));
        }

        return state;
      })
    );
  },
  rekalkulerBruttioinntekt: (bestemmendeFravaersdag: Date) => {
    const bestMnd = `00${bestemmendeFravaersdag.getMonth() + 1}`.slice(-2);
    const bestemmendeMaaned = `${bestemmendeFravaersdag.getFullYear()}-${bestMnd}`;
    const tidligereInntekt = get().opprinneligeInntekt;
    const bruttoinntekt = get().bruttoinntekt;

    const aktuelleInntekter = tidligereInntekt!
      .filter((inntekt) => inntekt.maanedsnavn < bestemmendeMaaned)
      .sort(sorterInntekter)
      .slice(0, 3);
    console.log(aktuelleInntekter);

    const sumInntekter = aktuelleInntekter.reduce(
      (prev, cur) => {
        prev.inntekt += cur.inntekt;
        return prev;
      },
      { inntekt: 0, maanedsnavn: '' }
    );

    const snittInntekter = sumInntekter.inntekt / aktuelleInntekter.length;

    set(
      produce((state) => {
        if (!bruttoinntekt.bekreftet && !bruttoinntekt.manueltKorrigert) {
          state.bruttoinntekt = {
            bruttoInntekt: snittInntekter,
            bekreftet: false,
            manueltKorrigert: false,
            endringsaarsak: ''
          };
        }

        if (aktuelleInntekter) {
          state.tidligereInntekt = aktuelleInntekter.map((inntekt) => ({
            maanedsnavn: inntekt.maanedsnavn,
            inntekt: inntekt.inntekt
          }));
        }

        return state;
      })
    );
  }
});

export default useBruttoinntektStore;
