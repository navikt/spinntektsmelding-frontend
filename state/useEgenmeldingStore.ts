import { nanoid } from 'nanoid';
import create from 'zustand';
import produce from 'immer';
import { Periode } from './state';
import parseIsoDate from '../utils/parseIsoDate';
import { MottattArbeidsforhold, MottattPeriode } from './MottattData';

interface EgenmeldingState {
  egenmeldingsperioder: { [key: string]: Array<Periode> };
  setEgenmeldingFraDato: (dateValue: string, periodeId: string) => void;
  setEgenmeldingTilDato: (dateValue: string, periodeId: string) => void;
  slettEgenmeldingsperiode: (periodeId: string) => void;
  leggTilEgenmeldingsperiode: (arbeidsforholdId: string) => void;
  initEgenmeldingsperiode: (
    arbeidsforhold: Array<MottattArbeidsforhold>,
    egenmeldingsperioder: { [key: string]: Array<MottattPeriode> }
  ) => void;
}

const useEgenmeldingStore = create<EgenmeldingState>((set) => ({
  egenmeldingsperioder: { ukjent: [{ id: nanoid() }] },
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

        return state;
      })
    ),
  leggTilEgenmeldingsperiode: (arbeidsforholdId: string) =>
    set(
      produce((state) => {
        const nyEgenmeldingsperiode: Periode = { id: nanoid() };
        if (!state.egenmeldingsperioder) {
          state.egenmeldingsperioder = {};
        }

        if (state.egenmeldingsperioder[arbeidsforholdId]) {
          state.egenmeldingsperioder[arbeidsforholdId].push(nyEgenmeldingsperiode);
        } else {
          state.egenmeldingsperioder[arbeidsforholdId] = [nyEgenmeldingsperiode];
        }

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
        arbeidsforhold.forEach((forhold) => {
          if (egenmeldingsperioder && egenmeldingsperioder[forhold.arbeidsforholdId]) {
            state.egenmeldingsperioder[forhold.arbeidsforholdId] = egenmeldingsperioder[forhold.arbeidsforholdId].map(
              (periode) => ({ ...periode, id: nanoid() })
            );
          } else {
            state.egenmeldingsperioder[forhold.arbeidsforholdId] = [{ id: nanoid() }];
          }
        });

        return state;
      })
    )
}));

export default useEgenmeldingStore;
