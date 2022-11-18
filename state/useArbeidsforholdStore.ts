import { StateCreator } from 'zustand';
import produce from 'immer';
import { IArbeidsforhold } from './state';
import { MottattArbeidsforhold } from './MottattData';
import { CompleteState } from './useBoundStore';

export interface ArbeidsforholdState {
  arbeidsforhold?: Array<IArbeidsforhold>;
  setAktiveArbeidsforhold: (aktiveArbeidsforhold: Array<string>) => void;
  initArbeidsforhold: (motattArbeidsforhold: Array<MottattArbeidsforhold>) => void;
  aktiveArbeidsforhold: () => Array<IArbeidsforhold>;
}

const useArbeidsforholdStore: StateCreator<CompleteState, [], [], ArbeidsforholdState> = (set, get) => ({
  arbeidsforhold: undefined,
  setAktiveArbeidsforhold: (aktiveArbeidsforhold: Array<string>) => {
    set(
      produce((state) => {
        if (!aktiveArbeidsforhold) {
          aktiveArbeidsforhold = [];
        }
        const oppdaterteForhold = state.arbeidsforhold?.map((forhold: IArbeidsforhold) => {
          const aktiv = Boolean(aktiveArbeidsforhold && aktiveArbeidsforhold.indexOf(forhold.arbeidsforholdId) > -1);
          forhold.aktiv = aktiv;
          return forhold;
        });

        state.arbeidsforhold = oppdaterteForhold;
        return state;
      })
    );
  },
  initArbeidsforhold: (motattArbeidsforhold: Array<MottattArbeidsforhold>) => {
    set(
      produce((state) => {
        if (motattArbeidsforhold) {
          state.arbeidsforhold = motattArbeidsforhold.map((forhold) => ({
            arbeidsforholdId: forhold.arbeidsforholdId,
            arbeidsforhold: forhold.arbeidsforhold,
            stillingsprosent: forhold.stillingsprosent,
            aktiv: true
          }));
        } else {
          state.arbeidsforhold = [
            {
              arbeidsforholdId: 'arbeidsforholdId',
              arbeidsforhold: 'arbeidsforhold',
              stillingsprosent: 100,
              aktiv: true
            }
          ];
        }
        return state;
      })
    );
  },
  aktiveArbeidsforhold: () => {
    const arbeidsforhold: Array<IArbeidsforhold> | undefined = get().arbeidsforhold;

    if (!arbeidsforhold) {
      return [];
    }

    return arbeidsforhold.filter((forhold) => forhold.aktiv);
  }
});

export default useArbeidsforholdStore;
