import { StateCreator } from 'zustand';
import produce from 'immer';
import { CompleteState } from './useBoundStore';
import { nanoid } from 'nanoid';

export interface SkjemadataState {
  nyInnsending: boolean;
  setNyInnsending: (endring: boolean) => void;
  tracker: string;
}

const useSkjemadataStore: StateCreator<CompleteState, [], [], SkjemadataState> = (set) => ({
  tracker: nanoid(),
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
