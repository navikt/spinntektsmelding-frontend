import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { nanoid } from 'nanoid';
import { Opplysningstype } from './useForespurtDataStore';
import { YesNo } from './state';
import { AapenInnsending } from '../validators/validerAapenInnsending';

export enum SkjemaStatus {
  FULL = 'FULL',
  SELVBESTEMT = 'SELVBESTEMT'
}

export interface SkjemadataState {
  nyInnsending: boolean;
  setNyInnsending: (endring: boolean) => void;
  setHenterInnsending: (henter: boolean) => void;
  setKvitteringInnsendt: (tidspunkt: string | Date) => void;
  slettKvitteringInnsendt: () => void;
  setSkjemaFeilet: () => void;
  setInngangFraKvittering: () => void;
  setDirekteInngangKvittering: () => void;
  setEndringerAvRefusjon: (endring: YesNo) => void;
  setSkjemaKvitteringEksterntSystem: (eksterntSystem: SkjemaKvitteringEksterntSystem) => void;
  setSkjemaStatus: (status: SkjemaStatus) => void;
  setKvitteringsdata: (data: any) => void;
  setVedtaksperiodeId: (id: string) => void;
  tracker: string;
  henterInntektsdata: boolean;
  kvitteringInnsendt?: Date;
  skjemaFeilet: boolean;
  skjemaType?: Array<Opplysningstype>;
  inngangFraKvittering: boolean;
  direkteInngangKvittering: boolean;
  endringerAvRefusjon?: YesNo;
  kvitteringEksterntSystem?: SkjemaKvitteringEksterntSystem;
  skjemastatus: SkjemaStatus;
  kvitteringData?: AapenInnsending;
  vedtaksperiodeId?: string;
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
  skjemaFeilet: false,
  skjemastatus: SkjemaStatus.FULL,
  kvitteringData: undefined,
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
  },
  setSkjemaStatus: (status: SkjemaStatus) => {
    set(
      produce((state: SkjemadataState) => {
        state.skjemastatus = status;
      })
    );
  },
  setKvitteringsdata: (data: any) => {
    set(
      produce((state: SkjemadataState) => {
        state.kvitteringData = data;
      })
    );
  },
  setVedtaksperiodeId: (id: string) => {
    set(
      produce((state: SkjemadataState) => {
        state.vedtaksperiodeId = id;
      })
    );
  }
});

export default useSkjemadataStore;
