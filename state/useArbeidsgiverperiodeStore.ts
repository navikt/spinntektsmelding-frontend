import { StateCreator } from 'zustand';
import produce from 'immer';
import { CompleteState } from './useBoundStore';
import { Periode } from './state';
import { nanoid } from 'nanoid';
import { PeriodeParam } from '../components/Bruttoinntekt/Periodevelger';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../utils/parseIsoDate';
import { finnAktuelleInntekter } from './useBruttoinntektStore';

export interface ArbeidsgiverperiodeState {
  bestemmendeFravaersdag?: Date;
  arbeidsgiverperioder?: Array<Periode>;
  endringsbegrunnelse?: string;
  endretArbeidsgiverperiode: boolean;
  setBestemmendeFravaersdag: (bestemmendeFravaersdag: Date | undefined) => void;
  setArbeidsgiverperioder: (arbeidsgiverperioder: Array<Periode> | undefined) => void;
  setEndringsbegrunnelse: (begrunnelse: string) => void;
  leggTilArbeidsgiverperiode: () => void;
  slettArbeidsgiverperiode: (periodeId: string) => void;
  setArbeidsgiverperiodeDato: (dateValue: PeriodeParam | undefined, periodeId: string) => void;
  setEndreArbeidsgiverperiode: (endre: boolean) => void;
}

const useArbeidsgiverperioderStore: StateCreator<CompleteState, [], [], ArbeidsgiverperiodeState> = (set, get) => ({
  bestemmendeFravaersdag: undefined,
  arbeidsgiverperioder: undefined,
  endretArbeidsgiverperiode: false,
  setBestemmendeFravaersdag: (bestemmendeFravaersdag) =>
    set(
      produce((state) => {
        state.bestemmendeFravaersdag = bestemmendeFravaersdag;

        return state;
      })
    ),
  setArbeidsgiverperioder: (arbeidsgiverperioder) =>
    set(
      produce((state) => {
        state.arbeidsgiverperioder = arbeidsgiverperioder;
        const bestemmende = finnBestemmendeFravaersdag(state.arbeidsgiverperioder);
        if (bestemmende) {
          state.rekalkulerBruttioinntekt(parseIsoDate(bestemmende));
          state.setBestemmendeFravaersdag(parseIsoDate(bestemmende));
        }

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

        const bestemmende = finnBestemmendeFravaersdag(state.arbeidsgiverperioder);
        if (bestemmende) {
          state.rekalkulerBruttioinntekt(parseIsoDate(bestemmende));
          state.bestemmendeFravaersdag = parseIsoDate(bestemmende);
        }
        return state;
      })
    ),
  setArbeidsgiverperiodeDato: (dateValue: PeriodeParam | undefined, periodeId: string) =>
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

        const bestemmende = finnBestemmendeFravaersdag(state.arbeidsgiverperioder);
        if (bestemmende) {
          state.rekalkulerBruttioinntekt(parseIsoDate(bestemmende));
          state.bestemmendeFravaersdag = parseIsoDate(bestemmende);

          state.tidligereInntekt = finnAktuelleInntekter(state.opprinneligeInntekt, parseIsoDate(bestemmende));
        }
        state.endretArbeidsgiverperiode = true;

        return state;
      })
    ),
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
    )
});

export default useArbeidsgiverperioderStore;
