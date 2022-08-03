import create from 'zustand';
import produce from 'immer';
import { Organisasjon } from '@navikt/bedriftsmeny/lib/organisasjon';

interface PersonState {
  navn?: string;
  identitetsnummer?: string;
  orgnrUnderenhet?: string;
  virksomhetsnavn?: string;
  setOrgUnderenhet: (organisasjon: Organisasjon) => void;
  initPerson: (navn: string, identitetsnummer: string, orgnrUnderenhet: string) => void;
}

const usePersonStore = create<PersonState>()((set) => ({
  navn: undefined,
  identitetsnummer: undefined,
  orgnrUnderenhet: undefined,
  virksomhetsnavn: undefined,
  setNavn: (navn: string) => {
    set(
      produce((state) => {
        state.navn = navn;
      })
    );
  },
  setIdentitetsnummer: (identitetsnummer: string) => {
    set(
      produce((state) => {
        state.identitetsnummer = identitetsnummer;
      })
    );
  },
  setOrgUnderenhet: (organisasjon: Organisasjon) => {
    set(
      produce((state) => {
        state.orgnrUnderenhet = organisasjon.OrganizationNumber;
        state.virksomhetsnavn = organisasjon.Name;
      })
    );
  },
  initPerson: (navn: string, identitetsnummer: string, orgnrUnderenhet: string) => {
    set(
      produce((state) => {
        state.navn = navn;
        state.identitetsnummer = identitetsnummer;
        state.orgnrUnderenhet = orgnrUnderenhet;

        return state;
      })
    );
  }
}));

export default usePersonStore;
