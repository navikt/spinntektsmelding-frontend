import { StateCreator } from 'zustand';
import produce from 'immer';
import { Organisasjon } from '@navikt/bedriftsmeny/lib/organisasjon';
import { NaturalytelserState } from './useNaturalytelserStore';
import { FeilmeldingerState } from './useFeilmeldingerStore';
import { EgenmeldingState } from './useEgenmeldingStore';
import { BruttoinntektState } from './useBruttoinntektStore';
import { ArbeidsforholdState } from './useArbeidsforholdStore';
import { BehandlingsdagerState } from './useBehandlingsdagerStore';
import { FravaersperiodeState } from './useFravaersperiodeStore';
import { RefusjonArbeidsgiverState } from './useRefusjonArbeidsgiverStore';

export interface PersonState {
  navn?: string;
  identitetsnummer?: string;
  orgnrUnderenhet?: string;
  virksomhetsnavn?: string;
  setNavn: (navn: string) => void;
  setIdentitetsnummer: (identitetsnummer: string) => void;
  setOrgUnderenhet: (organisasjon: Organisasjon) => void;
  initPerson: (navn: string, identitetsnummer: string, orgnrUnderenhet: string) => void;
}

const usePersonStore: StateCreator<
  RefusjonArbeidsgiverState &
    FravaersperiodeState &
    PersonState &
    NaturalytelserState &
    FeilmeldingerState &
    EgenmeldingState &
    BruttoinntektState &
    ArbeidsforholdState &
    BehandlingsdagerState,
  [],
  [],
  PersonState
> = (set) => ({
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
});

export default usePersonStore;
