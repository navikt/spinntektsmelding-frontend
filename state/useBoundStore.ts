import create from 'zustand';
import useArbeidsforholdStore, { ArbeidsforholdState } from './useArbeidsforholdStore';
import useBehandlingsdagerStore, { BehandlingsdagerState } from './useBehandlingsdagerStore';
import useBruttoinntektStore, { BruttoinntektState } from './useBruttoinntektStore';
import useEgenmeldingStore, { EgenmeldingState } from './useEgenmeldingStore';
import useFeilmeldingerStore, { FeilmeldingerState } from './useFeilmeldingerStore';
import useFravaersperiodeStore, { FravaersperiodeState } from './useFravaersperiodeStore';
import useNaturalytelserStore, { NaturalytelserState } from './useNaturalytelserStore';
import usePersonStore, { PersonState } from './usePersonStore';
import useRefusjonArbeidsgiverStore, { RefusjonArbeidsgiverState } from './useRefusjonArbeidsgiverStore';
import useGrunnbeloepStore, { GrunnpeloepState } from './useGrunnbeloepStore';

export interface CompleteState
  extends RefusjonArbeidsgiverState,
    FravaersperiodeState,
    PersonState,
    NaturalytelserState,
    FeilmeldingerState,
    ArbeidsforholdState,
    BehandlingsdagerState,
    BruttoinntektState,
    GrunnpeloepState,
    EgenmeldingState {}

const useBoundStore = create<CompleteState>()((...a) => ({
  ...useArbeidsforholdStore(...a),
  ...useBehandlingsdagerStore(...a),
  ...useBruttoinntektStore(...a),
  ...useEgenmeldingStore(...a),
  ...useFeilmeldingerStore(...a),
  ...useNaturalytelserStore(...a),
  ...usePersonStore(...a),
  ...useFravaersperiodeStore(...a),
  ...useRefusjonArbeidsgiverStore(...a),
  ...useGrunnbeloepStore(...a)
}));

export default useBoundStore;
