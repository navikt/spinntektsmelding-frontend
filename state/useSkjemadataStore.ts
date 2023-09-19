import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { nanoid } from 'nanoid';
import { Opplysningstype } from './useForespurtDataStore';
import { YesNo } from './state';

export interface SkjemadataState {
  nyInnsending: boolean;
  setNyInnsending: (endring: boolean) => void;
  setHenterInnsending: (henter: boolean) => void;
  setSlug: (slug: string | Array<string>) => void;
  setKvitteringInnsendt: (tidspunkt: string | Date) => void;
  slettKvitteringInnsendt: () => void;
  setSkjemaFeilet: () => void;
  setInngangFraKvittering: () => void;
  setDirekteInngangKvittering: () => void;
  setEndringBruttolonn: (endring: YesNo) => void;
  setEndringerAvRefusjon: (endring: YesNo) => void;
  setSkjemaKvitteringEksterntSystem: (eksterntSystem: SkjemaKvitteringEksterntSystem) => void;
  tracker: string;
  henterInntektsdata: boolean;
  slug?: string | Array<string>;
  kvitteringInnsendt?: Date;
  skjemaFeilet: boolean;
  skjemaType?: Array<Opplysningstype>;
  inngangFraKvittering: boolean;
  direkteInngangKvittering: boolean;
  endringBruttolonn?: YesNo;
  endringerAvRefusjon?: YesNo;
  kvitteringEksterntSystem?: SkjemaKvitteringEksterntSystem;
}

export interface SkjemaKvitteringEksterntSystem {
  avsenderSystem: string;
  referanse: string;
  tidspunkt: string;
}

const useSkjemadataStore: StateCreator<CompleteState, [], [], SkjemadataState> = (set) => ({
  inngangFraKvittering: false,
  direkteInngangKvittering: false,
  tracker: nanoid(),
  nyInnsending: true,
  henterInntektsdata: false,
  slug: '',
  skjemaFeilet: false,
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
  setKvitteringInnsendt: (tidspunkt: string | Date) => {
    set(
      produce((state: SkjemadataState) => {
        if (typeof tidspunkt === 'string') state.kvitteringInnsendt = new Date(tidspunkt);
        else state.kvitteringInnsendt = tidspunkt;
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
  },
  setInngangFraKvittering: () => {
    set(
      produce((state: SkjemadataState) => {
        state.inngangFraKvittering = true;
      })
    );
  },
  setDirekteInngangKvittering: () => {
    set(
      produce((state: SkjemadataState) => {
        state.direkteInngangKvittering = true;
      })
    );
  },
  setEndringBruttolonn: (endring: YesNo) => {
    set(
      produce((state: SkjemadataState) => {
        state.endringBruttolonn = endring;
      })
    );
  },
  setEndringerAvRefusjon: (endring: YesNo) => {
    set(
      produce((state: SkjemadataState) => {
        state.endringerAvRefusjon = endring;
      })
    );
  },
  setSkjemaKvitteringEksterntSystem: (eksterntSystem: SkjemaKvitteringEksterntSystem) => {
    set(
      produce((state: SkjemadataState) => {
        state.kvitteringEksterntSystem = eksterntSystem;
      })
    );
  }
});

export default useSkjemadataStore;
