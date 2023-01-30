import { StateCreator } from 'zustand';
import produce from 'immer';
import { Organisasjon } from '@navikt/bedriftsmeny/lib/organisasjon';
import { CompleteState } from './useBoundStore';

export interface PersonState {
  navn?: string;
  identitetsnummer?: string;
  orgnrUnderenhet?: string;
  virksomhetsnavn?: string;
  setNavn: (navn: string) => void;
  setIdentitetsnummer: (identitetsnummer: string) => void;
  setOrgUnderenhet: (organisasjon: Organisasjon) => void;
  initPerson: (navn: string, identitetsnummer: string, orgnrUnderenhet: string, orgNavn: string) => void;
}

const usePersonStore: StateCreator<CompleteState, [], [], PersonState> = (set) => ({
  navn: undefined,
  identitetsnummer: undefined,
  orgnrUnderenhet: undefined,
  virksomhetsnavn: undefined,
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
  initPerson: (navn: string, identitetsnummer: string, orgnrUnderenhet: string, orgNavn: string) => {
    set(
      produce((state: PersonState) => ({
        navn,
        identitetsnummer,
        orgnrUnderenhet,
        virksomhetsnavn: orgNavn
      }))
    );
  }
});

export default usePersonStore;
