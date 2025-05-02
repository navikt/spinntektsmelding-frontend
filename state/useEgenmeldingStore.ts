import { nanoid } from 'nanoid';
import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { Periode } from './state';
import parseIsoDate from '../utils/parseIsoDate';
import { MottattPeriode } from '../schema/forespurtData';
import { CompleteState } from './useBoundStore';
import { PeriodeParam } from '../components/Bruttoinntekt/Periodevelger';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import { finnAktuelleInntekter } from './useBruttoinntektStore';
import PeriodeType from '../config/PeriodeType';
import sorterFomStigende from '../utils/sorterFomStigende';
import { tidPeriode } from '../schema/tidPeriode';

export interface EgenmeldingState {
  egenmeldingsperioder?: Array<Periode>;
  opprinneligEgenmeldingsperiode?: Array<Periode>;
  kanEndreEgenmeldingPeriode: boolean;
  setEgenmeldingDato: (dateValue: PeriodeParam | undefined, periodeId: string) => void;
  slettEgenmeldingsperiode: (periodeId: string) => void;
  leggTilEgenmeldingsperiode: () => void;
  setEndreEgenmelding: (status: boolean) => void;
  tilbakestillEgenmelding: () => void;
  initEgenmeldingsperiode: (egenmeldingsperioder: Array<MottattPeriode>) => void;
}

const useEgenmeldingStore: StateCreator<CompleteState, [], [], EgenmeldingState> = (set, get) => ({
  egenmeldingsperioder: undefined,
  kanEndreEgenmeldingPeriode: false,
  setEgenmeldingDato: (dateValue: PeriodeParam | undefined, periodeId: string) => {
    const skjaeringstidspunkt = get().skjaeringstidspunkt;
    const arbeidsgiverKanFlytteSkjæringstidspunkt = get().arbeidsgiverKanFlytteSkjæringstidspunkt;
    const fravaersperioder = get().fravaersperioder;
    const egenmeldingsperioder = get().egenmeldingsperioder;
    set(
      produce((state) => {
        if (periodeId === PeriodeType.NY_PERIODE) {
          const hasSetDateValue = dateValue && (dateValue.fom || dateValue?.tom);

          if (hasSetDateValue) {
            state.egenmeldingsperioder = [{ ...dateValue, id: nanoid() }];
          }
        } else {
          const oppdatertEgenmeldingsperiode = updateDateValue(egenmeldingsperioder, periodeId, dateValue);

          state.egenmeldingsperioder = oppdatertEgenmeldingsperiode;
          oppdaterOgRekalkulerInntekt(
            state,
            skjaeringstidspunkt,
            arbeidsgiverKanFlytteSkjæringstidspunkt,
            fravaersperioder,
            oppdatertEgenmeldingsperiode
          );
        }
        return state;
      })
    );
  },
  slettEgenmeldingsperiode: (periodeId: string) => {
    const skjaeringstidspunkt = get().skjaeringstidspunkt;
    const arbeidsgiverKanFlytteSkjæringstidspunkt = get().arbeidsgiverKanFlytteSkjæringstidspunkt;
    const fravaersperioder = get().fravaersperioder;
    const egenmeldingsperioder = get().egenmeldingsperioder;
    set(
      produce((state) => {
        const tomPeriode = [{ id: nanoid() }];
        const nyePerioder = egenmeldingsperioder
          ? egenmeldingsperioder.filter((periode: Periode) => periode.id !== periodeId)
          : tomPeriode;
        const oppdatertePerioder = nyePerioder.length === 0 ? tomPeriode : nyePerioder;
        state.egenmeldingsperioder = oppdatertePerioder;

        oppdaterOgRekalkulerInntekt(
          state,
          skjaeringstidspunkt,
          arbeidsgiverKanFlytteSkjæringstidspunkt,
          fravaersperioder,
          oppdatertePerioder
        );

        return state;
      })
    );
  },
  leggTilEgenmeldingsperiode: () => {
    set(
      produce((state) => {
        const nyEgenmeldingsperiode: Periode = { id: nanoid() };
        if (state.egenmeldingsperioder && state.egenmeldingsperioder.length > 0) {
          state.egenmeldingsperioder.push(nyEgenmeldingsperiode);
        } else {
          state.egenmeldingsperioder = [nyEgenmeldingsperiode, { id: nanoid() }];
        }
        return state;
      })
    );
  },

  setEndreEgenmelding: (status: boolean) => {
    set(
      produce((state) => {
        state.kanEndreEgenmeldingPeriode = status;

        return state;
      })
    );
  },
  tilbakestillEgenmelding: () => {
    const clonedEgenmelding = structuredClone(get().opprinneligEgenmeldingsperiode);
    const skjaeringstidspunkt = get().skjaeringstidspunkt;
    const arbeidsgiverKanFlytteSkjæringstidspunkt = get().arbeidsgiverKanFlytteSkjæringstidspunkt;
    const fravaersperioder = get().fravaersperioder;
    set(
      produce((state) => {
        state.egenmeldingsperioder = clonedEgenmelding;

        if (clonedEgenmelding && clonedEgenmelding.length > 0 && clonedEgenmelding[0].fom && clonedEgenmelding[0].tom) {
          state.kanEndreEgenmeldingPeriode = false;
        }

        oppdaterOgRekalkulerInntekt(
          state,
          skjaeringstidspunkt,
          arbeidsgiverKanFlytteSkjæringstidspunkt,
          fravaersperioder,
          clonedEgenmelding
        );

        return state;
      })
    );
  },
  initEgenmeldingsperiode: (egenmeldingsperioder: Array<MottattPeriode>) => {
    set(
      produce((state) => {
        state.egenmeldingsperioder = [];

        if (egenmeldingsperioder && egenmeldingsperioder.length > 0) {
          state.kanEndreEgenmeldingPeriode = false;
          state.egenmeldingsperioder = egenmeldingsperioder.map((periode) => ({
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

function oppdaterOgRekalkulerInntekt(
  state: any,
  skjaeringstidspunkt: Date | undefined,
  arbeidsgiverKanFlytteSkjæringstidspunkt: () => boolean,
  fravaersperioder: Array<Periode>,
  egenmeldingsperioder: Array<Periode>
) {
  const fPerioder = finnFravaersperioder(fravaersperioder, egenmeldingsperioder);
  if (fPerioder) {
    const agp = finnArbeidsgiverperiode(fPerioder.toSorted(sorterFomStigende));
    state.arbeidsgiverperioder = agp;
    const bestemmende = finnBestemmendeFravaersdag(
      fPerioder,
      agp,
      skjaeringstidspunkt,
      arbeidsgiverKanFlytteSkjæringstidspunkt()
    );
    if (bestemmende) {
      state.rekalkulerBruttoinntekt(parseIsoDate(bestemmende));
      state.tidligereInntekt = finnAktuelleInntekter(state.opprinneligeInntekt, parseIsoDate(bestemmende)!);
    }
  }
}

function updateDateValue(egenmeldingsperioder?: Periode[], periodeId?: string, dateValue?: PeriodeParam | undefined) {
  if (!egenmeldingsperioder) return [];
  if (!periodeId || !dateValue) return egenmeldingsperioder;
  const oppdatertEgenmeldingPerioder = egenmeldingsperioder.map((periode: Periode) => {
    if (periode.id === periodeId) {
      const nyPeriode = { ...periode };
      nyPeriode.tom = dateValue?.tom;
      nyPeriode.fom = dateValue?.fom;
      return nyPeriode;
    }
    return periode;
  });

  return oppdatertEgenmeldingPerioder;
}

export function finnFravaersperioder<T extends tidPeriode>(
  fravaersperioder?: Array<T>,
  egenmeldingsperioder?: Array<T>
) {
  const perioder =
    fravaersperioder && egenmeldingsperioder ? fravaersperioder.concat(egenmeldingsperioder) : fravaersperioder;

  if (!perioder) {
    return [];
  }

  const fPerioder = perioder?.filter((periode) => periode.fom && periode.tom).toSorted(sorterFomStigende);
  return fPerioder;
}
