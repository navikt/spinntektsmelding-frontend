import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { FeilReportElement } from './useStateInit';
import validerTelefon from '../validators/validerTelefon';

export interface PersonState {
  sykmeldt: {
    navn?: string;
    fnr?: string;
  };
  avsender: {
    orgnr?: string;
    orgNavn?: string;
    navn?: string;
    tlf?: string;
  };
  feilHentingAvPersondata?: Array<FeilReportElement>;
  feilHentingAvArbeidsgiverdata?: Array<FeilReportElement>;
  setIdentitetsnummer: (identitetsnummer: string) => void;
  setInnsenderTelefon: (identitetsnummer: string) => void;
  initPerson: (
    navn: string,
    identitetsnummer: string,
    orgnrUnderenhet: string,
    orgNavn: string,
    innsenderNavn?: string,
    innsenderTelefonNr?: string,
    feilVedLasting?: {
      persondata?: Array<FeilReportElement>;
      arbeidsgiverdata?: Array<FeilReportElement>;
    }
  ) => void;
}

const usePersonStore: StateCreator<CompleteState, [], [], PersonState> = (set, get) => ({
  sykmeldt: {
    navn: undefined,
    fnr: undefined
  },
  avsender: {
    orgnr: undefined,
    orgNavn: undefined,
    navn: undefined,
    tlf: undefined
  },
  setIdentitetsnummer: (identitetsnummer: string) => {
    set(
      produce((state: PersonState) => {
        state.sykmeldt.fnr = identitetsnummer;
      })
    );
  },
  setInnsenderTelefon: (innsenderTelefonNr: string) => {
    const slettFeilmelding = get().slettFeilmelding;

    const feilmeldinger = validerTelefon(innsenderTelefonNr);
    if (feilmeldinger.length === 0) {
      slettFeilmelding('innsender-telefon');
    }

    set(
      produce((state: PersonState) => {
        state.avsender.tlf = innsenderTelefonNr;
      })
    );
  },
  initPerson: (navn, identitetsnummer, orgnrUnderenhet, orgNavn, innsenderNavn, innsenderTelefonNr, feilVedLasting) => {
    set(
      produce((state: PersonState) => ({
        sykmeldt: {
          navn,
          fnr: identitetsnummer
        },
        avsender: {
          orgnr: orgnrUnderenhet,
          orgNavn,
          navn: innsenderNavn,
          tlf: innsenderTelefonNr
        },
        feilHentingAvPersondata: feilVedLasting?.persondata,
        feilHentingAvArbeidsgiverdata: feilVedLasting?.arbeidsgiverdata
      }))
    );
  }
});

export default usePersonStore;
