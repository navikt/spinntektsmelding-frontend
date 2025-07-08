import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { YesNo } from './state';
import { KvitteringEksternSchema } from '../schema/MottattKvitteringSchema';
import z from 'zod';
import FullInnsendingSchema from '../schema/FullInnsendingSchema';
import AapenInnsendingSchema from '../schema/AapenInnsendingSchema';
import { Opplysningstype } from '../schema/ForespurtDataSchema';

export enum SkjemaStatus {
  FULL = 'FULL',
  SELVBESTEMT = 'SELVBESTEMT'
}

type KvitteringEkstern = z.infer<typeof KvitteringEksternSchema>;
type KvitteringFullInnsending = z.infer<typeof FullInnsendingSchema>;
type KvitteringSelvbestemtInnsending = z.infer<typeof AapenInnsendingSchema>;

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
  setSkjemaKvitteringEksterntSystem: (eksterntSystem: KvitteringEkstern) => void;
  setSkjemaStatus: (status: SkjemaStatus) => void;
  setSelvbestemtType: (type: 'MedArbeidsforhold' | 'UtenArbeidsforhold' | 'Fisker') => void;
  setKvitteringData: (data: KvitteringFullInnsending | KvitteringSelvbestemtInnsending) => void;
  setVedtaksperiodeId: (id: string) => void;
  setAarsakSelvbestemtInnsending: (aarsak: string) => void;
  setBehandlingsdager: (behandlingsdager: string[]) => void;
  henterInntektsdata: boolean;
  kvitteringInnsendt?: Date;
  skjemaFeilet: boolean;
  skjemaType?: Array<Opplysningstype>;
  inngangFraKvittering: boolean;
  direkteInngangKvittering: boolean;
  endringerAvRefusjon?: YesNo;
  kvitteringEksterntSystem?: KvitteringEkstern;
  skjemastatus: SkjemaStatus;
  kvitteringData?: KvitteringFullInnsending | KvitteringSelvbestemtInnsending;
  vedtaksperiodeId?: string;
  aarsakSelvbestemtInnsending?: string;
  behandlingsdager?: string[];
  selvbestemtType?: 'MedArbeidsforhold' | 'UtenArbeidsforhold' | 'Fisker';
}

const useSkjemadataStore: StateCreator<CompleteState, [], [], SkjemadataState> = (set) => ({
  inngangFraKvittering: false,
  direkteInngangKvittering: false,
  nyInnsending: true,
  henterInntektsdata: false,
  skjemaFeilet: false,
  skjemastatus: SkjemaStatus.FULL,
  kvitteringData: undefined,
  aarsakSelvbestemtInnsending: undefined,
  behandlingsdager: undefined,
  selvbestemtType: 'MedArbeidsforhold',
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
  setSkjemaKvitteringEksterntSystem: (eksterntSystem: KvitteringEkstern) => {
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
  setKvitteringData: (data: KvitteringFullInnsending | KvitteringSelvbestemtInnsending) => {
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
  },
  setAarsakSelvbestemtInnsending: (aarsak: string) => {
    set(
      produce((state: SkjemadataState) => {
        state.aarsakSelvbestemtInnsending = aarsak;
      })
    );
  },
  setBehandlingsdager: (behandlingsdager: string[]) => {
    set(
      produce((state: SkjemadataState) => {
        state.behandlingsdager = behandlingsdager;
      })
    );
  },
  setSelvbestemtType: (type: 'MedArbeidsforhold' | 'UtenArbeidsforhold' | 'Fisker') => {
    set(
      produce((state: SkjemadataState) => {
        state.selvbestemtType = type;
      })
    );
  }
});

export default useSkjemadataStore;
