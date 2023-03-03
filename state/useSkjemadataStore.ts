import { StateCreator } from 'zustand';
import produce from 'immer';
import { CompleteState } from './useBoundStore';

export interface SkjemadataState {
  nyInnsending: boolean;
  setNyInnsending: (endring: boolean) => void;
}

const useSkjemadataStore: StateCreator<CompleteState, [], [], SkjemadataState> = (set) => ({
  nyInnsending: true,
  setNyInnsending: (endring: boolean) => {
    set(
      produce((state: SkjemadataState) => {
        state.nyInnsending = endring;
      })
    );
  }
});

export default useSkjemadataStore;
