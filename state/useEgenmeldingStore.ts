import { nanoid } from 'nanoid';
import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { Periode } from './state';
import parseIsoDate from '../utils/parseIsoDate';
import { MottattPeriode } from '../schema/ForespurtDataSchema';
import { CompleteState } from './useBoundStore';
import sorterFomStigende from '../utils/sorterFomStigende';
import { TidPeriode } from '../schema/TidPeriodeSchema';
import { ApiPeriodeSchema } from '../schema/ApiPeriodeSchema';
import { logger } from '@navikt/next-logger';

export interface EgenmeldingState {
  egenmeldingsperioder?: Array<Periode>;
  opprinneligEgenmeldingsperiode?: Array<Periode>;
  kanEndreEgenmeldingPeriode: boolean;
  initEgenmeldingsperiode: (egenmeldingsperioder: Array<MottattPeriode>) => void;
}

const useEgenmeldingStore: StateCreator<CompleteState, [], [], EgenmeldingState> = (set, get) => ({
  egenmeldingsperioder: undefined,
  kanEndreEgenmeldingPeriode: false,

  initEgenmeldingsperiode: (egenmeldingsperioder: Array<MottattPeriode>) => {
    set(
      produce((state) => {
        state.egenmeldingsperioder = [];
        const validerte = ApiPeriodeSchema.safeParse(egenmeldingsperioder);
        if (!validerte.success && egenmeldingsperioder.length > 0) {
          logger.error('Feil i initEgenmeldingsperiode', validerte.error);
        }

        const sorterte = egenmeldingsperioder.toSorted((a, b) => new Date(a.fom).getTime() - new Date(b.fom).getTime());
        if (egenmeldingsperioder && egenmeldingsperioder.length > 0) {
          state.kanEndreEgenmeldingPeriode = false;
          state.egenmeldingsperioder = sorterte.map((periode) => ({
            fom: parseIsoDate(periode.fom),
            tom: parseIsoDate(periode.tom),
            id: nanoid()
          }));
        } else {
          state.kanEndreEgenmeldingPeriode = true;
        }

        state.opprinneligEgenmeldingsperiode = structuredClone(state.egenmeldingsperioder);
        return state;
      })
    );
  }
});

export default useEgenmeldingStore;

export function finnFravaersperioder<T extends TidPeriode>(
  sykmeldingsperioder?: Array<T>,
  egenmeldingsperioder?: Array<T>
) {
  const perioder =
    sykmeldingsperioder && egenmeldingsperioder
      ? sykmeldingsperioder.concat(egenmeldingsperioder)
      : sykmeldingsperioder;

  if (!perioder) {
    return [];
  }

  const fPerioder = perioder?.filter((periode) => periode.fom && periode.tom).sort(sorterFomStigende);
  return fPerioder;
}
