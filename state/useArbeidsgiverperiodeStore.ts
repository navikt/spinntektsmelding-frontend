import { StateCreator } from 'zustand';
import produce from 'immer';
import { CompleteState } from './useBoundStore';
import { FravaersPeriode } from '../utils/finnBestemmendeFravaersdag';

export interface ArbeidsgiverperiodeState {
  bestemmendeFravaersdag?: Date;
  arbeidsgiverperioder?: Array<FravaersPeriode>;
  endringsbegrunnelse?: string;
  setBestemmendeFravaersdag: (bestemmendeFravaersdag: Date | undefined) => void;
  setArbeidsgiverperioder: (arbeidsgiverperioder: Array<FravaersPeriode> | undefined) => void;
  setEndringsbegrunnelse: (begrunnelse: string) => void;
}

const useArbeidsgiverperioderStore: StateCreator<CompleteState, [], [], ArbeidsgiverperiodeState> = (set) => ({
  bestemmendeFravaersdag: undefined,
  arbeidsgiverperioder: undefined,
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

        return state;
      })
    ),
  setEndringsbegrunnelse: (begrunnelse) =>
    set(
      produce((state) => {
        state.endringsbegrunnelse = begrunnelse;

        return state;
      })
    )
});

export default useArbeidsgiverperioderStore;
