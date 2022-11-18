import { nanoid } from 'nanoid';
import { StateCreator } from 'zustand';
import produce from 'immer';
import { Periode } from './state';
import parseIsoDate from '../utils/parseIsoDate';
import { MottattArbeidsforhold, MottattPeriode } from './MottattData';
import { DateRange } from 'react-day-picker';
import { CompleteState } from './useBoundStore';

export interface EgenmeldingState {
  egenmeldingsperioder: { [key: string]: Array<Periode> };
  opprinneligEgenmeldingsperiode?: { [key: string]: Array<Periode> };
  sammeEgenmeldingsperiode: boolean;
  endreEgenmeldingsperiode: { [key: string]: boolean };
  setEgenmeldingFraDato: (dateValue: Date | undefined, periodeId: string) => void;
  setEgenmeldingTilDato: (dateValue: Date | undefined, periodeId: string) => void;
  setEgenmeldingDato: (dateValue: DateRange | undefined, periodeId: string) => void;
  slettEgenmeldingsperiode: (periodeId: string) => void;
  leggTilEgenmeldingsperiode: (arbeidsforholdId: string) => void;
  setSammeEgenmeldingsperiodeArbeidsforhold: (arbeidsforholdId: string, status: boolean) => void;
  setEndreEgenmelding: (arbeidsforholdId: string, status: boolean) => void;
  tilbakestillEgenmelding: (arbeidsforholdId: string) => void;
  initEgenmeldingsperiode: (
    arbeidsforhold: Array<MottattArbeidsforhold>,
    egenmeldingsperioder: { [key: string]: Array<MottattPeriode> }
  ) => void;
}

const useEgenmeldingStore: StateCreator<CompleteState, [], [], EgenmeldingState> = (set, get) => ({
  egenmeldingsperioder: { ukjent: [{ id: nanoid() }] },
  sammeEgenmeldingsperiode: false,
  endreEgenmeldingsperiode: {},
  setEgenmeldingFraDato: (dateValue: Date | undefined, periodeId: string) =>
    set(
      produce((state) => {
        const forholdKeys = Object.keys(state.egenmeldingsperioder);

        forholdKeys.forEach((forholdKey) => {
          state.egenmeldingsperioder[forholdKey] = state.egenmeldingsperioder[forholdKey].map((periode: Periode) => {
            if (periode.id === periodeId) {
              periode.fra = dateValue;
              return periode;
            }
            return periode;
          });
        });

        state.sammeEgenmeldingsperiode = false;

        return state;
      })
    ),
  setEgenmeldingTilDato: (dateValue: Date | undefined, periodeId: string) =>
    set(
      produce((state) => {
        const forholdKeys = Object.keys(state.egenmeldingsperioder);

        forholdKeys.forEach((forholdKey) => {
          state.egenmeldingsperioder[forholdKey] = state.egenmeldingsperioder[forholdKey].map((periode: Periode) => {
            if (periode.id === periodeId) {
              periode.til = dateValue;
              return periode;
            }
            return periode;
          });
        });

        state.sammeEgenmeldingsperiode = false;

        return state;
      })
    ),
  setEgenmeldingDato: (dateValue: DateRange | undefined, periodeId: string) =>
    set(
      produce((state) => {
        const forholdKeys = Object.keys(state.egenmeldingsperioder);

        forholdKeys.forEach((forholdKey) => {
          state.egenmeldingsperioder[forholdKey] = state.egenmeldingsperioder[forholdKey].map((periode: Periode) => {
            if (periode.id === periodeId) {
              if (periode.til !== dateValue?.to || periode.fra !== dateValue?.from) {
                state.sammeEgenmeldingsperiode = false;
              }
              periode.til = dateValue?.to;
              periode.fra = dateValue?.from;
              return periode;
            }
            return periode;
          });
        });

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
  setEndreEgenmelding: (arbeidsforholdId: string, status: boolean) => {
    set(
      produce((state) => {
        state.endreEgenmeldingsperiode[arbeidsforholdId] = status;

        return state;
      })
    );
  },
  tilbakestillEgenmelding: (arbeidsforholdId) => {
    const clonedEgenmelding = structuredClone(get().opprinneligEgenmeldingsperiode);

    set(
      produce((state) => {
        if (clonedEgenmelding?.[arbeidsforholdId]) {
          state.egenmeldingsperioder[arbeidsforholdId] = structuredClone(clonedEgenmelding[arbeidsforholdId]);
        }

        state.sammeEgenmeldingsperiode = false;

        return state;
      })
    );
  },
  initEgenmeldingsperiode: (
    arbeidsforhold: Array<MottattArbeidsforhold>,
    egenmeldingsperioder: { [key: string]: Array<MottattPeriode> }
  ) =>
    set(
      produce((state) => {
        state.egenmeldingsperioder = {};
        if (arbeidsforhold && arbeidsforhold.length > 0) {
          arbeidsforhold.forEach((forhold) => {
            state.endreEgenmeldingsperiode[forhold.arbeidsforholdId] = false;
            if (egenmeldingsperioder && egenmeldingsperioder[forhold.arbeidsforholdId]) {
              state.egenmeldingsperioder[forhold.arbeidsforholdId] = egenmeldingsperioder[forhold.arbeidsforholdId].map(
                (periode) => ({ fra: parseIsoDate(periode.fra), til: parseIsoDate(periode.til), id: nanoid() })
              );
            } else {
              state.egenmeldingsperioder[forhold.arbeidsforholdId] = [{ id: nanoid() }];
              state.endreEgenmeldingsperiode[forhold.arbeidsforholdId] = true;
            }
          });
        }
        state.opprinneligEgenmeldingsperiode = structuredClone({ ...state.egenmeldingsperioder });
        return state;
      })
    )
});

export default useEgenmeldingStore;
