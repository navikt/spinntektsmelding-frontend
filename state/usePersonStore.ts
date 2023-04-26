import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { Organisasjon } from '@navikt/bedriftsmeny/lib/organisasjon';
import { CompleteState } from './useBoundStore';

export interface PersonState {
  navn?: string;
  identitetsnummer?: string;
  orgnrUnderenhet?: string;
  virksomhetsnavn?: string;
  innsenderNavn?: string;
  innsenderTelefonNr?: string;
  setNavn: (navn: string) => void;
  setIdentitetsnummer: (identitetsnummer: string) => void;
  setInnsenderNavn: (navn: string) => void;
  setInnsenderTelefon: (identitetsnummer: string) => void;
  setOrgUnderenhet: (organisasjon: Organisasjon) => void;
  initPerson: (
    navn: string,
    identitetsnummer: string,
    orgnrUnderenhet: string,
    orgNavn: string,
    innsenderNavn?: string,
    innsenderTelefonNr?: string
  ) => void;
}

const usePersonStore: StateCreator<CompleteState, [], [], PersonState> = (set) => ({
  navn: undefined,
  identitetsnummer: undefined,
  orgnrUnderenhet: undefined,
  virksomhetsnavn: undefined,
  innsenderNavn: undefined,
  innsenderTelefonNr: undefined,
  setNavn: (navn: string) => {
    set(
      produce((state: PersonState) => {
        state.navn = navn;
      })
    );
  },
  setIdentitetsnummer: (identitetsnummer: string) => {
    set(
      produce((state: PersonState) => {
        state.identitetsnummer = identitetsnummer;
      })
    );
  },
  setOrgUnderenhet: (organisasjon: Organisasjon) => {
    set(
      produce((state: PersonState) => {
        state.orgnrUnderenhet = organisasjon.OrganizationNumber;
        state.virksomhetsnavn = organisasjon.Name;
      })
    );
  },
  setInnsenderNavn: (innsenderNavn: string) => {
    set(
      produce((state: PersonState) => {
        state.innsenderNavn = innsenderNavn;
      })
    );
  },
  setInnsenderTelefon: (innsenderTelefonNr: string) => {
    set(
      produce((state: PersonState) => {
        state.innsenderTelefonNr = innsenderTelefonNr;
      })
    );
  },
  initPerson: (
    navn: string,
    identitetsnummer: string,
    orgnrUnderenhet: string,
    orgNavn: string,
    innsenderNavn?: string,
    innsenderTelefonNr?: string
  ) => {
    set(
      produce((state: PersonState) => ({
        navn,
        identitetsnummer,
        orgnrUnderenhet,
        virksomhetsnavn: orgNavn,
        innsenderNavn,
        innsenderTelefonNr
      }))
    );
  }
});

export default usePersonStore;
