import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { nanoid } from 'nanoid';

export interface SkjemadataState {
  nyInnsending: boolean;
  setNyInnsending: (endring: boolean) => void;
  setHenterInnsending: (henter: boolean) => void;
  setSlug: (slug: string) => void;
  setKvitteringInnsendt: (tidspunkt: string) => void;
  slettKvitteringInnsendt: () => void;
  tracker: string;
  henterInntektsdata: boolean;
  slug: string;
  kvitteringInnsendt?: Date;
}

const useSkjemadataStore: StateCreator<CompleteState, [], [], SkjemadataState> = (set) => ({
  tracker: nanoid(),
  nyInnsending: true,
  henterInntektsdata: false,
  slug: '',
  setNyInnsending: (endring: boolean) => {
    set(
      produce((state: SkjemadataState) => {
        state.nyInnsending = endring;
      })
    );
  },
  setHenterInnsending: (henter: boolean) => {
    set(
      produce((state: SkjemadataState) => {
        state.henterInntektsdata = henter;
      })
    );
  },
  setSlug: (slug: string) => {
    set(
      produce((state: SkjemadataState) => {
        state.slug = slug;
      })
    );
  },
  setKvitteringInnsendt: (tidspunkt: string) => {
    set(
      produce((state: SkjemadataState) => {
        state.kvitteringInnsendt = new Date(tidspunkt);
      })
    );
  },
  slettKvitteringInnsendt: () => {
    set(
      produce((state: SkjemadataState) => {
        state.kvitteringInnsendt = undefined;
      })
    );
  }
});

export default useSkjemadataStore;
