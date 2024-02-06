import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { Periode } from './state';
import { nanoid } from 'nanoid';
import { PeriodeParam } from '../components/Bruttoinntekt/Periodevelger';
import parseIsoDate from '../utils/parseIsoDate';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import validerPeriodeFravaer from '../validators/validerPeriodeFravaer';
import { ValiderResultat } from '../utils/useValiderInntektsmelding';
import { slettFeilmeldingFraState } from './useFeilmeldingerStore';
import { MottattPeriode, TDateISODate } from './MottattData';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import { finnAktuelleInntekter } from './useBruttoinntektStore';
import PeriodeType from '../config/PeriodeType';

export interface ArbeidsgiverperiodeState {
  bestemmendeFravaersdag?: Date;
  skjaeringstidspunkt?: Date;
  foreslaattBestemmendeFravaersdag?: Date;
  arbeidsgiverperioder?: Array<Periode>;
  endringsbegrunnelse?: string;
  endretArbeidsgiverperiode: boolean;
  opprinneligArbeidsgiverperioder?: Array<Periode>;
  arbeidsgiverperiodeDisabled: boolean;
  arbeidsgiverperiodeKort: boolean;
  setBestemmendeFravaersdag: (bestemmendeFravaersdag: Date | undefined) => void;
  setArbeidsgiverperioder: (arbeidsgiverperioder: Array<Periode> | undefined) => void;
  initArbeidsgiverperioder: (arbeidsgiverperioder: Array<MottattPeriode> | undefined) => void;
  setEndringsbegrunnelse: (begrunnelse: string) => void;
  leggTilArbeidsgiverperiode: () => void;
  slettArbeidsgiverperiode: (periodeId: string) => void;
  setArbeidsgiverperiodeDato: (dateValue: PeriodeParam | undefined, periodeId: string) => void;
  setEndreArbeidsgiverperiode: (endre: boolean) => void;
  tilbakestillArbeidsgiverperiode: () => void;
  harArbeidsgiverperiodenBlittEndret: () => void;
  slettAlleArbeidsgiverperioder: () => void;
  setArbeidsgiverperiodeDisabled: (disabled: boolean) => void;
  setArbeidsgiverperiodeKort: (disabled: boolean) => void;
  setForeslaattBestemmendeFravaersdag: (bestemmendeFravaersdag: Date | undefined) => void;
  arbeidsgiverKanFlytteSkjæringstidspunkt: () => boolean;
  setSkjaeringstidspunkt: (skjaeringstidspunkt: TDateISODate | null) => void;
}

const useArbeidsgiverperioderStore: StateCreator<CompleteState, [], [], ArbeidsgiverperiodeState> = (set, get) => {
  return {
    foreslaattBestemmendeFravaersdag: undefined,
    arbeidsgiverperiodeDisabled: false,
    bestemmendeFravaersdag: undefined,
    arbeidsgiverperioder: undefined,
    endretArbeidsgiverperiode: false,
    arbeidsgiverperiodeKort: false,
    setBestemmendeFravaersdag: (bestemmendeFravaersdag) => {
      set(
        produce((state) => {
          state.bestemmendeFravaersdag = bestemmendeFravaersdag;

          return state;
        })
      );
    },
    setArbeidsgiverperioder: (arbeidsgiverperioder) =>
      set(
        produce((state) => {
          state.arbeidsgiverperioder = arbeidsgiverperioder;

          return state;
        })
      ),
    initArbeidsgiverperioder: (arbeidsgiverperioder) =>
      set(
        produce((state) => {
          const perioder =
            arbeidsgiverperioder && arbeidsgiverperioder.length > 0
              ? arbeidsgiverperioder.map((periode) => ({
                  fom: parseIsoDate(periode.fom),
                  tom: parseIsoDate(periode.tom),
                  id: nanoid()
                }))
              : [{ id: nanoid() }];

          state.arbeidsgiverperioder = structuredClone(perioder);
          state.opprinneligArbeidsgiverperioder = structuredClone(perioder);
          return state;
        })
      ),
    leggTilArbeidsgiverperiode: () =>
      set(
        produce((state) => {
          const nyArbeidsgiverperiode: Periode = { id: nanoid() };
          state.endretArbeidsgiverperiode = true;
          if (state.arbeidsgiverperioder) {
            state.arbeidsgiverperioder.push(nyArbeidsgiverperiode);
          } else {
            state.arbeidsgiverperioder = [nyArbeidsgiverperiode];
          }

          return state;
        })
      ),
    slettArbeidsgiverperiode: (periodeId: string) =>
      set(
        produce((state) => {
          const nyePerioder = state.arbeidsgiverperioder.filter((periode: Periode) => periode.id !== periodeId);
          state.arbeidsgiverperioder = nyePerioder.length === 0 ? [{ id: nanoid() }] : nyePerioder;
          state.endretArbeidsgiverperiode = true;

          const feilkoderArbeidsgiverperioder: Array<ValiderResultat> = validerPeriodeFravaer(
            state.arbeidsgiverperioder,
            'arbeidsgiverperioder'
          );

          state.feilmeldinger = state.oppdaterFeilmeldinger(feilkoderArbeidsgiverperioder, 'arbeidsgiverperioder');
          return state;
        })
      ),
    slettAlleArbeidsgiverperioder: () =>
      set(
        produce((state) => {
          state.arbeidsgiverperioder = [{ id: nanoid() }];
          state.endretArbeidsgiverperiode = true;

          const feilkoderArbeidsgiverperioder: Array<ValiderResultat> = validerPeriodeFravaer(
            state.arbeidsgiverperioder,
            'arbeidsgiverperioder'
          );

          state.feilmeldinger = state.oppdaterFeilmeldinger(feilkoderArbeidsgiverperioder, 'arbeidsgiverperioder');
          return state;
        })
      ),
    setArbeidsgiverperiodeDato: (dateValue: PeriodeParam | undefined, periodeId: string) => {
      const egenmeldingsperioder = get().egenmeldingsperioder;
      const sykmeldingsperioder = get().fravaersperioder;
      const forespurtBestemmendeFraværsdag = get().foreslaattBestemmendeFravaersdag;
      const arbeidsgiverKanFlytteSkjæringstidspunkt = get().arbeidsgiverKanFlytteSkjæringstidspunkt;
      set(
        produce((state) => {
          if (periodeId === PeriodeType.NY_PERIODE) {
            state.arbeidsgiverperioder = [{ ...dateValue, id: nanoid() }];
          } else {
            state.arbeidsgiverperioder = state.arbeidsgiverperioder.map((periode: Periode) => {
              if (periode.id === periodeId) {
                periode.tom = dateValue?.tom;
                periode.fom = dateValue?.fom;
                return periode;
              }
              return periode;
            });
          }

          state.endretArbeidsgiverperiode = true;

          const feilkoderArbeidsgiverperioder: Array<ValiderResultat> = validerPeriodeFravaer(
            state.arbeidsgiverperioder,
            'arbeidsgiverperioder'
          );
          const perioder = sykmeldingsperioder
            ? sykmeldingsperioder.concat(egenmeldingsperioder ?? [])
            : egenmeldingsperioder;

          const bestemmendeFravaersdag = finnBestemmendeFravaersdag(
            perioder,
            state.arbeidsgiverperioder,
            forespurtBestemmendeFraværsdag,
            arbeidsgiverKanFlytteSkjæringstidspunkt()
          );
          if (bestemmendeFravaersdag) state.bestemmendeFravaersdag = parseIsoDate(bestemmendeFravaersdag);
          if (bestemmendeFravaersdag) {
            state.rekalkulerBruttoinntekt(parseIsoDate(bestemmendeFravaersdag));
            state.bestemmendeFravaersdag = parseIsoDate(bestemmendeFravaersdag);
            state.tidligereInntekt = finnAktuelleInntekter(
              state.opprinneligeInntekt,
              parseIsoDate(bestemmendeFravaersdag)
            );
          }

          state.feilmeldinger = state.oppdaterFeilmeldinger(feilkoderArbeidsgiverperioder, 'arbeidsgiverperioder');

          return state;
        })
      );
    },
    setEndreArbeidsgiverperiode: (endre: boolean) => {
      set(
        produce((state) => {
          state.endretArbeidsgiverperiode = endre;

          return state;
        })
      );
    },
    setEndringsbegrunnelse: (begrunnelse) =>
      set(
        produce((state) => {
          state.endringsbegrunnelse = begrunnelse;

          return state;
        })
      ),
    tilbakestillArbeidsgiverperiode: () => {
      const opprinnelig = get().opprinneligArbeidsgiverperioder;
      const egenmeldingsperioder = get().egenmeldingsperioder;
      const sykmeldingsperioder = get().fravaersperioder;
      const forespurtBestemmendeFraværsdag = get().foreslaattBestemmendeFravaersdag;
      const arbeidsgiverKanFlytteSkjæringstidspunkt = get().arbeidsgiverKanFlytteSkjæringstidspunkt;
      set(
        produce((state) => {
          const perioder = sykmeldingsperioder
            ? sykmeldingsperioder.concat(egenmeldingsperioder || [])
            : egenmeldingsperioder;

          const arbeidsgiverperiode = perioder ? finnArbeidsgiverperiode(perioder) : undefined;
          const nyArbeidsgiverperiode = arbeidsgiverperiode ? arbeidsgiverperiode : structuredClone(opprinnelig);

          state.arbeidsgiverperioder = nyArbeidsgiverperiode;

          const bestemmendeFravaersdag = finnBestemmendeFravaersdag(
            perioder,
            nyArbeidsgiverperiode,
            forespurtBestemmendeFraværsdag,
            arbeidsgiverKanFlytteSkjæringstidspunkt()
          );

          if (bestemmendeFravaersdag) {
            state.rekalkulerBruttoinntekt(parseIsoDate(bestemmendeFravaersdag));
            state.bestemmendeFravaersdag = parseIsoDate(bestemmendeFravaersdag);
            state.tidligereInntekt = finnAktuelleInntekter(
              state.opprinneligeInntekt,
              parseIsoDate(bestemmendeFravaersdag)
            );
          }

          slettFeilmeldingFraState(state, 'arbeidsgiverperiode-feil');

          state.endretArbeidsgiverperiode = false;
          return state;
        })
      );
    },
    harArbeidsgiverperiodenBlittEndret: () => {
      const opprinnelig = get().opprinneligArbeidsgiverperioder;
      const egenmeldingsperioder = get().egenmeldingsperioder;
      const sykmeldingsperioder = get().fravaersperioder;
      set(
        produce((state) => {
          if (!opprinnelig) {
            return state;
          }

          const perioder = sykmeldingsperioder
            ? sykmeldingsperioder.concat(egenmeldingsperioder ?? [])
            : egenmeldingsperioder;

          const agp = finnArbeidsgiverperiode(perioder!);

          const opprinneligString = JSON.stringify(
            opprinnelig.map((periode) => ({ fom: periode.fom, tom: periode.tom }))
          );
          const agpString = JSON.stringify(agp.map((periode) => ({ fom: periode.fom, tom: periode.tom })));

          if (opprinneligString !== agpString) {
            state.endretArbeidsgiverperiode = true;
          }

          return state;
        })
      );
    },
    setArbeidsgiverperiodeDisabled: (disabled) =>
      set(
        produce((state) => {
          state.arbeidsgiverperiodeDisabled = disabled;

          return state;
        })
      ),
    setForeslaattBestemmendeFravaersdag: (bestemmendeFravaersdag) => {
      set(
        produce((state) => {
          state.foreslaattBestemmendeFravaersdag = bestemmendeFravaersdag;

          return state;
        })
      );
    },
    setArbeidsgiverperiodeKort: (kort) =>
      set(
        produce((state) => {
          state.arbeidsgiverperiodeKort = kort;

          return state;
        })
      ),
    arbeidsgiverKanFlytteSkjæringstidspunkt: () => {
      const foreslaattBestemmendeFravaersdag = get().foreslaattBestemmendeFravaersdag;
      console.log('foreslaattBestemmendeFravaersdag', foreslaattBestemmendeFravaersdag);
      return !foreslaattBestemmendeFravaersdag;
    },
    setSkjaeringstidspunkt: (skjaeringstidspunkt) => {
      set(
        produce((state) => {
          state.skjaeringstidspunkt = skjaeringstidspunkt ? parseIsoDate(skjaeringstidspunkt) : null;
          return state;
        })
      );
    }
  };
};

export default useArbeidsgiverperioderStore;
