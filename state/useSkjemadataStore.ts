import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { nanoid } from 'nanoid';
import { Opplysningstype } from './useForespurtDataStore';
import { YesNo } from './state';
import { AapenInnsending } from '../validators/validerAapenInnsending';
import parseIsoDate from '../utils/parseIsoDate';
import { kvitteringEksternSchema } from '../schema/mottattKvitteringSchema';

export enum SkjemaStatus {
  FULL = 'FULL',
  SELVBESTEMT = 'SELVBESTEMT'
}

type KvitteringEksternSchema = z.infer<typeof kvitteringEksternSchema>;

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
  setSkjemaKvitteringEksterntSystem: (eksterntSystem: KvitteringEksternSchema) => void;
  setSkjemaStatus: (status: SkjemaStatus) => void;
  setKvitteringsdata: (data: any) => void;
  setVedtaksperiodeId: (id: string) => void;
  setForespoerselSistOppdatert: (tidspunkt: string | Date) => void;
  tracker: string;
  henterInntektsdata: boolean;
  kvitteringInnsendt?: Date;
  skjemaFeilet: boolean;
  skjemaType?: Array<Opplysningstype>;
  inngangFraKvittering: boolean;
  direkteInngangKvittering: boolean;
  endringerAvRefusjon?: YesNo;
  kvitteringEksterntSystem?: KvitteringEksternSchema;
  skjemastatus: SkjemaStatus;
  kvitteringData?: AapenInnsending;
  vedtaksperiodeId?: string;
  forespoerselSistOppdatert?: Date;
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
  setSkjemaKvitteringEksterntSystem: (eksterntSystem: KvitteringEksternSchema) => {
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
  },
  setForespoerselSistOppdatert: (tidspunkt: string | Date) => {
    let oppdatert: Date | undefined = undefined;

    if (typeof tidspunkt === 'string') {
      oppdatert = parseIsoDate(tidspunkt);
    } else {
      oppdatert = tidspunkt;
    }

    if (!oppdatert) {
      return;
    }

    set(
      produce((state: SkjemadataState) => {
        if (oppdatert !== undefined) {
          state.forespoerselSistOppdatert = oppdatert;
        }
      })
    );
  }
});

export default useSkjemadataStore;
