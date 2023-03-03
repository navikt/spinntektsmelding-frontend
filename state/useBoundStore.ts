import { create } from 'zustand';
import useBehandlingsdagerStore, { BehandlingsdagerState } from './useBehandlingsdagerStore';
import useBruttoinntektStore, { BruttoinntektState } from './useBruttoinntektStore';
import useEgenmeldingStore, { EgenmeldingState } from './useEgenmeldingStore';
import useFeilmeldingerStore, { FeilmeldingerState } from './useFeilmeldingerStore';
import useFravaersperiodeStore, { FravaersperiodeState } from './useFravaersperiodeStore';
import useNaturalytelserStore, { NaturalytelserState } from './useNaturalytelserStore';
import usePersonStore, { PersonState } from './usePersonStore';
import useRefusjonArbeidsgiverStore, { RefusjonArbeidsgiverState } from './useRefusjonArbeidsgiverStore';
import useArbeidsgiverperioderStore, { ArbeidsgiverperiodeState } from './useArbeidsgiverperiodeStore';
import useSkjemadataStore, { SkjemadataState } from './useSkjemadataStore';

export interface CompleteState
  extends RefusjonArbeidsgiverState,
    FravaersperiodeState,
    PersonState,
    NaturalytelserState,
    FeilmeldingerState,
    BehandlingsdagerState,
    BruttoinntektState,
    ArbeidsgiverperiodeState,
    SkjemadataState,
    EgenmeldingState {}

const useBoundStore = create<CompleteState>()((...a) => ({
  ...useBehandlingsdagerStore(...a),
  ...useBruttoinntektStore(...a),
  ...useEgenmeldingStore(...a),
  ...useFeilmeldingerStore(...a),
  ...useNaturalytelserStore(...a),
  ...usePersonStore(...a),
  ...useFravaersperiodeStore(...a),
  ...useRefusjonArbeidsgiverStore(...a),
  ...useArbeidsgiverperioderStore(...a),
  ...useSkjemadataStore(...a)
}));

export default useBoundStore;
