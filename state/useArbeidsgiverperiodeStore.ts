import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { CompleteState } from './useBoundStore';
import { Periode } from './state';
import { nanoid } from 'nanoid';
import { PeriodeParam } from '../components/Bruttoinntekt/Periodevelger';
import parseIsoDate from '../utils/parseIsoDate';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import validerPeriodeFravaer from '../validators/validerPeriodeFravaer';
import { ValiderResultat } from '../utils/validerInntektsmelding';
import { slettFeilmeldingFraState } from './useFeilmeldingerStore';
import { TDateISODate } from '../schema/ForespurtDataSchema';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import { finnAktuelleInntekter } from './useBruttoinntektStore';
import PeriodeType from '../config/PeriodeType';
import { ApiPeriodeSchema } from '../schema/ApiPeriodeSchema';
import { z } from 'zod';

type ApiPeriodeSchema = z.infer<typeof ApiPeriodeSchema>;

export interface ArbeidsgiverperiodeState {
  skjaeringstidspunkt?: Date;
  foreslaattBestemmendeFravaersdag?: Date;
  arbeidsgiverperioder?: Array<Periode>;
  endringsbegrunnelse?: string;
  endretArbeidsgiverperiode: boolean;
  opprinneligArbeidsgiverperioder?: Array<Periode>;
  arbeidsgiverperiodeDisabled: boolean;
  arbeidsgiverperiodeKort: boolean;
  mottattBestemmendeFravaersdag?: TDateISODate;
  mottattEksternInntektsdato?: TDateISODate;
  setArbeidsgiverperioder: (arbeidsgiverperioder: Array<Periode> | undefined) => void;
  initArbeidsgiverperioder: (arbeidsgiverperioder: Array<ApiPeriodeSchema> | undefined) => void;
  leggTilArbeidsgiverperiode: () => void;
  slettArbeidsgiverperiode: (periodeId: string) => void;
  setArbeidsgiverperiodeDato: (dateValue: PeriodeParam | undefined, periodeId: string) => void;
  setEndreArbeidsgiverperiode: (endre: boolean) => void;
  tilbakestillArbeidsgiverperiode: () => void;
  slettAlleArbeidsgiverperioder: () => void;
  setArbeidsgiverperiodeDisabled: (disabled: boolean) => void;
  setArbeidsgiverperiodeKort: (disabled: boolean) => void;
  setForeslaattBestemmendeFravaersdag: (bestemmendeFravaersdag: Date | undefined) => void;
  arbeidsgiverKanFlytteSkjæringstidspunkt: () => boolean;
  setSkjaeringstidspunkt: (skjaeringstidspunkt: TDateISODate | Date | null | undefined) => void;
  setMottattBestemmendeFravaersdag: (bestemmendeFravaersdag: TDateISODate) => void;
  setMottattEksternInntektsdato: (bestemmendeFravaersdag: TDateISODate | null) => void;
  harArbeidsgiverperiodenBlittEndret: () => void;
}

const useArbeidsgiverperioderStore: StateCreator<CompleteState, [], [], ArbeidsgiverperiodeState> = (set, get) => {
  return {
    foreslaattBestemmendeFravaersdag: undefined,
    arbeidsgiverperiodeDisabled: false,
    bestemmendeFravaersdag: undefined,
    arbeidsgiverperioder: undefined,
    endretArbeidsgiverperiode: false,
    arbeidsgiverperiodeKort: false,
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
          state.arbeidsgiverperioder = [];
          state.endretArbeidsgiverperiode = true;

          return state;
        })
      ),
    setArbeidsgiverperiodeDato: (dateValue: PeriodeParam | undefined, periodeId: string) => {
      const egenmeldingsperioder = get().egenmeldingsperioder;
      const sykmeldingsperioder = get().sykmeldingsperioder;
      const skjaeringstidspunkt = get().skjaeringstidspunkt;
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
            skjaeringstidspunkt,
            arbeidsgiverKanFlytteSkjæringstidspunkt()
          );
          if (bestemmendeFravaersdag) state.bestemmendeFravaersdag = parseIsoDate(bestemmendeFravaersdag);
          if (bestemmendeFravaersdag) {
            state.rekalkulerBruttoinntekt(parseIsoDate(bestemmendeFravaersdag));
            state.bestemmendeFravaersdag = parseIsoDate(bestemmendeFravaersdag);
            state.tidligereInntekt = finnAktuelleInntekter(
              state.opprinneligeInntekt,
              parseIsoDate(bestemmendeFravaersdag)!
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
    tilbakestillArbeidsgiverperiode: () => {
      const opprinnelig = get().opprinneligArbeidsgiverperioder;
      const egenmeldingsperioder = get().egenmeldingsperioder;
      const sykmeldingsperioder = get().sykmeldingsperioder;
      const skjaeringstidspunkt = get().skjaeringstidspunkt;
      const arbeidsgiverKanFlytteSkjæringstidspunkt = get().arbeidsgiverKanFlytteSkjæringstidspunkt;
      set(
        produce((state) => {
          const perioder = sykmeldingsperioder
            ? sykmeldingsperioder.concat(egenmeldingsperioder || [])
            : egenmeldingsperioder;

          const arbeidsgiverperiode = perioder ? finnArbeidsgiverperiode(perioder) : undefined;
          const nyArbeidsgiverperiode = arbeidsgiverperiode || structuredClone(opprinnelig);

          state.arbeidsgiverperioder = nyArbeidsgiverperiode;

          const bestemmendeFravaersdag = finnBestemmendeFravaersdag(
            perioder,
            nyArbeidsgiverperiode,
            skjaeringstidspunkt,
            arbeidsgiverKanFlytteSkjæringstidspunkt()
          );

          if (bestemmendeFravaersdag) {
            state.rekalkulerBruttoinntekt(parseIsoDate(bestemmendeFravaersdag));
            state.bestemmendeFravaersdag = parseIsoDate(bestemmendeFravaersdag);
            state.tidligereInntekt = finnAktuelleInntekter(
              state.opprinneligeInntekt,
              parseIsoDate(bestemmendeFravaersdag)!
            );
          }

          slettFeilmeldingFraState(state, 'arbeidsgiverperioder-feil');

          state.endretArbeidsgiverperiode = false;
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
      const skjaeringstidspunkt = get().skjaeringstidspunkt;
      return !skjaeringstidspunkt;
    },
    setSkjaeringstidspunkt: (skjaeringstidspunkt) => {
      set(
        produce((state) => {
          state.skjaeringstidspunkt = skjaeringstidspunkt ? parseIsoDate(skjaeringstidspunkt) : null;
          return state;
        })
      );
    },
    setMottattBestemmendeFravaersdag: (bestemmendeFravaersdag: TDateISODate) => {
      set(
        produce((state) => {
          state.mottattBestemmendeFravaersdag = bestemmendeFravaersdag;
          return state;
        })
      );
    },
    setMottattEksternInntektsdato: (bestemmendeFravaersdag: TDateISODate | null) => {
      set(
        produce((state) => {
          state.mottattEksternInntektsdato = bestemmendeFravaersdag;
          return state;
        })
      );
    },
    harArbeidsgiverperiodenBlittEndret: () => {
      const fravaersperioder = get().fravaersperioder;
      const egenmeldingsperioder = get().egenmeldingsperioder;
      const arbeidsgiverperioder = get().arbeidsgiverperioder;

      if (!arbeidsgiverperioder) {
        return;
      }

      const beregnetArbeidsgiverperiode = finnArbeidsgiverperiode(
        fravaersperioder,
        egenmeldingsperioder
      ) as unknown as Array<Periode>;

      const lengdePeriode = arbeidsgiverperioder?.length ?? 0;
      const lengdeBeregnet = beregnetArbeidsgiverperiode?.length ?? 0;

      if (lengdePeriode !== lengdeBeregnet) {
        set(
          produce((state) => {
            state.endretArbeidsgiverperiode = true;
            return state;
          })
        );
        return;
      }

      arbeidsgiverperioder?.forEach((periode, index) => {
        const fomMatch = periode.fom?.getTime() === beregnetArbeidsgiverperiode?.[index]?.fom?.getTime();
        const tomMatch = periode.tom?.getTime() === beregnetArbeidsgiverperiode?.[index]?.tom?.getTime();
        if (!fomMatch || !tomMatch) {
          set(
            produce((state) => {
              state.endretArbeidsgiverperiode = true;
              return state;
            })
          );
        }
      });
    }
  };
};

export default useArbeidsgiverperioderStore;
