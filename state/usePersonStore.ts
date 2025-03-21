import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { FeilReportElement } from './useStateInit';
import validerTelefon from '../validators/validerTelefon';

export interface PersonState {
  navn?: string;
  identitetsnummer?: string;
  orgnrUnderenhet?: string;
  virksomhetsnavn?: string;
  innsenderNavn?: string;
  innsenderTelefonNr?: string;
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
  navn: undefined,
  identitetsnummer: undefined,
  orgnrUnderenhet: undefined,
  virksomhetsnavn: undefined,
  innsenderNavn: undefined,
  innsenderTelefonNr: undefined,
  setIdentitetsnummer: (identitetsnummer: string) => {
    set(
      produce((state: PersonState) => {
        state.identitetsnummer = identitetsnummer;
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
        state.innsenderTelefonNr = innsenderTelefonNr;
      })
    );
  },
  initPerson: (navn, identitetsnummer, orgnrUnderenhet, orgNavn, innsenderNavn, innsenderTelefonNr, feilVedLasting) => {
    set(
      produce((state: PersonState) => ({
        navn,
        identitetsnummer,
        orgnrUnderenhet,
        virksomhetsnavn: orgNavn,
        innsenderNavn,
        innsenderTelefonNr,
        feilHentingAvPersondata: feilVedLasting?.persondata,
        feilHentingAvArbeidsgiverdata: feilVedLasting?.arbeidsgiverdata
      }))
    );
  }
});

export default usePersonStore;
