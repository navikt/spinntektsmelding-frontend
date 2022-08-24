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

import { devtools } from 'zustand/middleware';

const useBoundStore = create<
  RefusjonArbeidsgiverState &
    FravaersperiodeState &
    PersonState &
    NaturalytelserState &
    FeilmeldingerState &
    ArbeidsforholdState &
    BehandlingsdagerState &
    BruttoinntektState &
    EgenmeldingState
>()(
  devtools((...a) => ({
    ...useArbeidsforholdStore(...a),
    ...useBehandlingsdagerStore(...a),
    ...useBruttoinntektStore(...a),
    ...useEgenmeldingStore(...a),
    ...useFeilmeldingerStore(...a),
    ...useNaturalytelserStore(...a),
    ...usePersonStore(...a),
    ...useFravaersperiodeStore(...a),
    ...useRefusjonArbeidsgiverStore(...a)
  }))
);

export default useBoundStore;
