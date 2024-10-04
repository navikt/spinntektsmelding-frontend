import { createWithEqualityFn } from 'zustand/traditional';
import useBruttoinntektStore, { BruttoinntektState } from './useBruttoinntektStore';
import useEgenmeldingStore, { EgenmeldingState } from './useEgenmeldingStore';
import useFeilmeldingerStore, { FeilmeldingerState } from './useFeilmeldingerStore';
import useFravaersperiodeStore, { FravaersperiodeState } from './useFravaersperiodeStore';
import useNaturalytelserStore, { NaturalytelserState } from './useNaturalytelserStore';
import usePersonStore, { PersonState } from './usePersonStore';
import useRefusjonArbeidsgiverStore, { RefusjonArbeidsgiverState } from './useRefusjonArbeidsgiverStore';
import useArbeidsgiverperioderStore, { ArbeidsgiverperiodeState } from './useArbeidsgiverperiodeStore';
import useSkjemadataStore, { SkjemadataState } from './useSkjemadataStore';
import useForespurtDataStore, { ForespurtDataState } from './useForespurtDataStore';

export interface CompleteState
  extends RefusjonArbeidsgiverState,
    FravaersperiodeState,
    PersonState,
    NaturalytelserState,
    FeilmeldingerState,
    BruttoinntektState,
    ArbeidsgiverperiodeState,
    SkjemadataState,
    EgenmeldingState,
    ForespurtDataState {}

const useBoundStore = createWithEqualityFn<CompleteState>()((...a) => ({
  ...useBruttoinntektStore(...a),
  ...useEgenmeldingStore(...a),
  ...useFeilmeldingerStore(...a),
  ...useNaturalytelserStore(...a),
  ...usePersonStore(...a),
  ...useFravaersperiodeStore(...a),
  ...useRefusjonArbeidsgiverStore(...a),
  ...useArbeidsgiverperioderStore(...a),
  ...useSkjemadataStore(...a),
  ...useForespurtDataStore(...a)
}));

export default useBoundStore;
