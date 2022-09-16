import { nanoid } from 'nanoid';
import { StateCreator } from 'zustand';
import produce from 'immer';
import { Periode } from './state';
import parseIsoDate from '../utils/parseIsoDate';
import { MottattArbeidsforhold, MottattPeriode } from './MottattData';
import { BruttoinntektState } from './useBruttoinntektStore';
import { ArbeidsforholdState } from './useArbeidsforholdStore';
import { BehandlingsdagerState } from './useBehandlingsdagerStore';
import { FeilmeldingerState } from './useFeilmeldingerStore';
import { PersonState } from './usePersonStore';
import { FravaersperiodeState } from './useFravaersperiodeStore';
import { RefusjonArbeidsgiverState } from './useRefusjonArbeidsgiverStore';

export interface EgenmeldingState {
  egenmeldingsperioder: { [key: string]: Array<Periode> };
  sammeEgenmeldingsperiode: boolean;
  setEgenmeldingFraDato: (dateValue: string, periodeId: string) => void;
  setEgenmeldingTilDato: (dateValue: string, periodeId: string) => void;
  slettEgenmeldingsperiode: (periodeId: string) => void;
  leggTilEgenmeldingsperiode: (arbeidsforholdId: string) => void;
  setSammeEgenmeldingsperiodeArbeidsforhold: (arbeidsforholdId: string, status: boolean) => void;
  initEgenmeldingsperiode: (
    arbeidsforhold: Array<MottattArbeidsforhold>,
    egenmeldingsperioder: { [key: string]: Array<MottattPeriode> }
  ) => void;
}

const useEgenmeldingStore: StateCreator<
  RefusjonArbeidsgiverState &
    FravaersperiodeState &
    PersonState &
    FeilmeldingerState &
    EgenmeldingState &
    BruttoinntektState &
    ArbeidsforholdState &
    BehandlingsdagerState,
  [],
  [],
  EgenmeldingState
> = (set) => ({
  egenmeldingsperioder: { ukjent: [{ id: nanoid() }] },
  sammeEgenmeldingsperiode: false,
  setEgenmeldingFraDato: (dateValue: string, periodeId: string) =>
    set(
      produce((state) => {
        const forholdKeys = Object.keys(state.egenmeldingsperioder);

        forholdKeys.forEach((forholdKey) => {
          state.egenmeldingsperioder[forholdKey] = state.egenmeldingsperioder[forholdKey].map((periode: Periode) => {
            if (periode.id === periodeId) {
              periode.fra = parseIsoDate(dateValue);
              return periode;
            }
            return periode;
          });
        });

        state.sammeEgenmeldingsperiode = false;

        return state;
      })
    ),
  setEgenmeldingTilDato: (dateValue: string, periodeId: string) =>
    set(
      produce((state) => {
        const forholdKeys = Object.keys(state.egenmeldingsperioder);

        forholdKeys.forEach((forholdKey) => {
          state.egenmeldingsperioder[forholdKey] = state.egenmeldingsperioder[forholdKey].map((periode: Periode) => {
            if (periode.id === periodeId) {
              periode.til = parseIsoDate(dateValue);
              return periode;
            }
            return periode;
          });
        });

        state.sammeEgenmeldingsperiode = false;

        return state;
      })
    ),
  slettEgenmeldingsperiode: (periodeId: string) =>
    set(
      produce((state) => {
        const forholdKeys = Object.keys(state.egenmeldingsperioder);

        forholdKeys.forEach((forholdKey) => {
          const nyePerioder = state.egenmeldingsperioder[forholdKey].filter(
            (periode: Periode) => periode.id !== periodeId
          );
          state.egenmeldingsperioder[forholdKey] = nyePerioder.length === 0 ? [{ id: nanoid() }] : nyePerioder;
        });

        state.sammeEgenmeldingsperiode = false;

        return state;
      })
    ),
  leggTilEgenmeldingsperiode: (arbeidsforholdId: string) =>
    set(
      produce((state) => {
        const nyEgenmeldingsperiode: Periode = { id: nanoid() };

        if (state.egenmeldingsperioder[arbeidsforholdId]) {
          state.egenmeldingsperioder[arbeidsforholdId].push(nyEgenmeldingsperiode);
        } else {
          state.egenmeldingsperioder[arbeidsforholdId] = [nyEgenmeldingsperiode];
        }

        state.sammeEgenmeldingsperiode = false;

        return state;
      })
    ),
  setSammeEgenmeldingsperiodeArbeidsforhold: (arbeidsforholdId, status) =>
    set(
      produce((state) => {
        if (status) {
          const fravaersKeys = Object.keys(state.egenmeldingsperioder!);
          if (state.egenmeldingsperioder && fravaersKeys.indexOf(arbeidsforholdId) > -1) {
            state.sammeEgenmeldingsperiode = true;
          }

          if (state.egenmeldingsperioder?.[arbeidsforholdId]) {
            const periodeMaster: Periode[] = state.egenmeldingsperioder[arbeidsforholdId];

            const oppdaterbarePerioder = fravaersKeys.filter((key) => key !== arbeidsforholdId);

            oppdaterbarePerioder.forEach((forholdId) => {
              if (forholdId !== arbeidsforholdId) {
                state.egenmeldingsperioder![forholdId] = periodeMaster.map((periode) => {
                  return {
                    ...periode,
                    id: nanoid()
                  };
                });
              }
            });
          }
        }

        state.sammeEgenmeldingsperiode = status;

        return state;
      })
    ),
  initEgenmeldingsperiode: (
    arbeidsforhold: Array<MottattArbeidsforhold>,
    egenmeldingsperioder: { [key: string]: Array<MottattPeriode> }
  ) =>
    set(
      produce((state) => {
        state.egenmeldingsperioder = {};
        if (arbeidsforhold && arbeidsforhold.length > 0) {
          arbeidsforhold.forEach((forhold) => {
            if (egenmeldingsperioder && egenmeldingsperioder[forhold.arbeidsforholdId]) {
              state.egenmeldingsperioder[forhold.arbeidsforholdId] = egenmeldingsperioder[forhold.arbeidsforholdId].map(
                (periode) => ({ fra: parseIsoDate(periode.fra), til: parseIsoDate(periode.til), id: nanoid() })
              );
            } else {
              state.egenmeldingsperioder[forhold.arbeidsforholdId] = [{ id: nanoid() }];
            }
          });
        }

        return state;
      })
    )
});

export default useEgenmeldingStore;
