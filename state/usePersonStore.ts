import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
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
  setIdentitetsnummer: (identitetsnummer: string) => void;
  setInnsenderTelefon: (identitetsnummer: string) => void;
  initPerson: (
    navn: string | null,
    identitetsnummer: string,
    orgnrUnderenhet: string,
    orgNavn: string | null,
    innsenderNavn?: string,
    innsenderTelefonNr?: string
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
  initPerson: (navn, identitetsnummer, orgnrUnderenhet, orgNavn, innsenderNavn, innsenderTelefonNr) => {
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
        }
      }))
    );
  }
});

export default usePersonStore;
