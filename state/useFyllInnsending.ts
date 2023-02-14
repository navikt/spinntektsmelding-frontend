import begrunnelseEndringBruttoinntekt from '../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import formatIsoDate from '../utils/formatIsoDate';
import { Periode } from './state';
import useBoundStore from './useBoundStore';
import { EndringsBelop } from '/Users/kent/git/spinntektsmelding-frontend/components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';

interface SendtPeriode {
  fom: string;
  tom: string;
}

interface FullLonnIArbeidsgiverPerioden {
  utbetalerFullLønn: boolean;
  begrunnelse?: string;
  utbetalt?: number;
}

export interface RefusjonEndring {
  dato: string;
  beløp: number;
}

interface Refusjon {
  utbetalerHeleEllerDeler: boolean;
  refusjonPrMnd?: number;
  refusjonOpphører?: string;
  refusjonEndringer?: Array<RefusjonEndring>;
}

interface SendtNaturalytelse {
  naturalytelse: string;
  bortfallsdato: string;
  beløp: number;
}

interface AArsakType {
  type: string;
}

interface Tariffendring extends AArsakType {
  gjelderFra: string;
  bleKjent: string;
}

interface PeriodeListe extends AArsakType {
  liste: Array<SendtPeriode>;
}

interface StillingsEndring extends AArsakType {
  gjelderFra: string;
}

interface Bruttoinntekt {
  bekreftet: boolean;
  beregnetInntekt: number;
  endringÅrsak?: AArsakType | Tariffendring | PeriodeListe | StillingsEndring;
  manueltKorrigert: boolean;
}

export interface InnsendingSkjema {
  identitetsnummer: string;
  orgnrUnderenhet: string;
  egenmeldingsperioder?: Array<SendtPeriode>;
  arbeidsgiverperioder: Array<SendtPeriode>;
  bestemmendeFraværsdag: string;
  fraværsperioder: Array<SendtPeriode>;
  inntekt: Bruttoinntekt;
  fullLønnIArbeidsgiverPerioden: FullLonnIArbeidsgiverPerioden;
  refusjon: Refusjon;
  naturalytelser?: Array<SendtNaturalytelse>;
  bekreftOpplysninger: boolean;
  behandlingsdager?: Array<string>;
  årsakInnsending: string;
}

export default function useFyllInnsending() {
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);

  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const [identitetsnummer, orgnrUnderenhet] = useBoundStore((state) => [state.identitetsnummer, state.orgnrUnderenhet]);
  const [fullLonnIArbeidsgiverPerioden, lonnISykefravaeret, refusjonskravetOpphoerer] = useBoundStore((state) => [
    state.fullLonnIArbeidsgiverPerioden,
    state.lonnISykefravaeret,
    state.refusjonskravetOpphoerer
  ]);
  const naturalytelser = useBoundStore((state) => state.naturalytelser);
  const [tariffendringsdato, tariffkjentdato] = useBoundStore((state) => [
    state.tariffendringsdato,
    state.tariffkjentdato
  ]);
  const ferie = useBoundStore((state) => state.ferie);
  const lonnsendringsdato = useBoundStore((state) => state.lonnsendringsdato);
  const permisjon = useBoundStore((state) => state.permisjon);
  const permitering = useBoundStore((state) => state.permitering);
  const nystillingdato = useBoundStore((state) => state.nystillingdato);
  const nystillingsprosentdato = useBoundStore((state) => state.nystillingsprosentdato);

  const behandlingsdager = useBoundStore((state) => state.behandlingsdager);

  const bestemmendeFravaersdag = useBoundStore((state) => state.bestemmendeFravaersdag);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const endretArbeidsgiverperiode = useBoundStore((state) => state.endretArbeidsgiverperiode);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);

  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);

  return (opplysningerBekreftet: boolean): InnsendingSkjema => {
    const endringAarsak = (): AArsakType | Tariffendring | PeriodeListe | StillingsEndring | undefined => {
      if (!bruttoinntekt.endringsaarsak) return undefined;
      switch (bruttoinntekt.endringsaarsak) {
        case begrunnelseEndringBruttoinntekt.Tariffendring:
          return {
            type: begrunnelseEndringBruttoinntekt.Tariffendring,
            gjelderFra: formatIsoDate(tariffendringsdato),
            bleKjent: formatIsoDate(tariffkjentdato)
          };

        case begrunnelseEndringBruttoinntekt.Ferie:
          return {
            type: begrunnelseEndringBruttoinntekt.Ferie,
            liste: ferie!.map((periode) => ({
              fom: formatIsoDate(periode.fom),
              tom: formatIsoDate(periode.tom)
            }))
          };

        case begrunnelseEndringBruttoinntekt.VarigLonnsendring:
          return {
            type: begrunnelseEndringBruttoinntekt.VarigLonnsendring,
            gjelderFra: formatIsoDate(lonnsendringsdato)
          };

        case begrunnelseEndringBruttoinntekt.Permisjon:
          return {
            type: begrunnelseEndringBruttoinntekt.Permisjon,
            liste: permisjon!.map((periode) => ({
              fom: formatIsoDate(periode.fom),
              tom: formatIsoDate(periode.tom)
            }))
          };

        case begrunnelseEndringBruttoinntekt.Permitering:
          return {
            type: begrunnelseEndringBruttoinntekt.Permitering,
            liste: permitering!.map((periode) => ({
              fom: formatIsoDate(periode.fom),
              tom: formatIsoDate(periode.tom)
            }))
          };

        case begrunnelseEndringBruttoinntekt.NyStilling:
          return {
            type: begrunnelseEndringBruttoinntekt.NyStilling,
            gjelderFra: formatIsoDate(nystillingdato)
          };

        case begrunnelseEndringBruttoinntekt.NyStillingsprosent:
          return {
            type: begrunnelseEndringBruttoinntekt.NyStillingsprosent,
            gjelderFra: formatIsoDate(nystillingsprosentdato)
          };

        default:
          return {
            type: bruttoinntekt.endringsaarsak
          };
      }
    };

    const harEgenmeldingsdager = sjekkOmViHarEgenmeldingsdager(egenmeldingsperioder);

    const innsendingRefusjonEndringer: Array<RefusjonEndring> | undefined = konverterRefusjonsendringer(
      harRefusjonEndringer,
      refusjonEndringer
    );

    setSkalViseFeilmeldinger(true);
    let perioder;
    if (fravaersperioder) {
      perioder = fravaersperioder.concat(egenmeldingsperioder);
    } else {
      perioder = egenmeldingsperioder;
    }

    const beregningsperioder = endretArbeidsgiverperiode ? arbeidsgiverperioder : perioder;

    const bestemmendeFraværsdag = bestemmendeFravaersdag
      ? formatIsoDate(bestemmendeFravaersdag)
      : finnBestemmendeFravaersdag(perioder);

    const aktiveArbeidsgiverperioder =
      arbeidsgiverperioder?.find((periode) => !periode.fom || !periode.tom) !== undefined
        ? arbeidsgiverperioder
        : finnArbeidsgiverperiode(beregningsperioder as Array<Periode>);

    const skjemaData: InnsendingSkjema = {
      orgnrUnderenhet: orgnrUnderenhet!,
      identitetsnummer: identitetsnummer!,
      egenmeldingsperioder: harEgenmeldingsdager
        ? egenmeldingsperioder.map((periode) => ({
            fom: formatIsoDate(periode.fom),
            tom: formatIsoDate(periode.tom)
          }))
        : [],
      fraværsperioder: fravaersperioder!.map((periode) => ({
        fom: formatIsoDate(periode.fom),
        tom: formatIsoDate(periode.tom)
      })),
      arbeidsgiverperioder: aktiveArbeidsgiverperioder.map((periode) => ({
        fom: formatIsoDate(periode.fom),
        tom: formatIsoDate(periode.tom)
      })),
      inntekt: {
        bekreftet: bruttoinntekt.bekreftet || false,
        beregnetInntekt: bruttoinntekt.bruttoInntekt!,
        manueltKorrigert: bruttoinntekt.manueltKorrigert || false,
        endringÅrsak: endringAarsak()
      },
      bestemmendeFraværsdag: bestemmendeFraværsdag!,
      fullLønnIArbeidsgiverPerioden: {
        utbetalerFullLønn: fullLonnIArbeidsgiverPerioden?.status === 'Ja',
        begrunnelse: fullLonnIArbeidsgiverPerioden?.begrunnelse,
        utbetalt: fullLonnIArbeidsgiverPerioden?.utbetalt
      },
      refusjon: {
        utbetalerHeleEllerDeler: lonnISykefravaeret?.status === 'Ja',
        refusjonPrMnd: lonnISykefravaeret?.belop,
        refusjonOpphører: refusjonskravetOpphoerer?.opphorsdato
          ? formatIsoDate(refusjonskravetOpphoerer?.opphorsdato)
          : undefined,
        refusjonEndringer: innsendingRefusjonEndringer
      },
      naturalytelser: naturalytelser?.map((ytelse) => ({
        naturalytelse: ytelse.type || '',
        bortfallsdato: formatIsoDate(ytelse.bortfallsdato),
        beløp: ytelse.verdi || 0
      })),
      bekreftOpplysninger: opplysningerBekreftet,
      behandlingsdager: behandlingsdager ? behandlingsdager.map((dag) => formatIsoDate(dag)) : [],
      årsakInnsending: 'Ny' // Kan også være Endring
    };

    return skjemaData;
  };
}
function konverterRefusjonsendringer(
  harRefusjonEndringer: boolean | undefined,
  refusjonEndringer: Array<EndringsBelop> | undefined
): RefusjonEndring[] | undefined {
  return harRefusjonEndringer && refusjonEndringer
    ? refusjonEndringer.map((endring) => ({
        beløp: endring.belop!,
        dato: formatIsoDate(endring.dato)!
      }))
    : undefined;
}

function sjekkOmViHarEgenmeldingsdager(egenmeldingsperioder: Array<Periode>) {
  return (
    egenmeldingsperioder &&
    (egenmeldingsperioder.length > 1 || (egenmeldingsperioder[0].fom && egenmeldingsperioder[0].tom))
  );
}
