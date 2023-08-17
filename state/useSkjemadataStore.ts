import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { nanoid } from 'nanoid';
import skjemaType from 'config/skjematype';

export interface SkjemadataState {
  nyInnsending: boolean;
  setNyInnsending: (endring: boolean) => void;
  setHenterInnsending: (henter: boolean) => void;
  setSlug: (slug: string | Array<string>) => void;
  setKvitteringInnsendt: (tidspunkt: string) => void;
  slettKvitteringInnsendt: () => void;
  setSkjemaFeilet: () => void;
  setSkjematype: (type: (typeof skjemaType)[keyof typeof skjemaType]) => void;
  tracker: string;
  henterInntektsdata: boolean;
  slug?: string | Array<string>;
  kvitteringInnsendt?: Date;
  skjemaFeilet: boolean;
  skjemaType?: (typeof skjemaType)[keyof typeof skjemaType];
}

const useSkjemadataStore: StateCreator<CompleteState, [], [], SkjemadataState> = (set) => ({
  tracker: nanoid(),
  nyInnsending: true,
  henterInntektsdata: false,
  slug: '',
  skjemaFeilet: false,
  setSkjematype(type) {
    set(
      produce((state: SkjemadataState) => {
        state.skjemaType = type;
      })
    );
  },
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
  setSlug: (slug?: string | Array<string>) => {
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
  },
  setSkjemaFeilet: () => {
    set(
      produce((state: SkjemadataState) => {
        state.skjemaFeilet = true;
      })
    );
  }
});

export default useSkjemadataStore;
