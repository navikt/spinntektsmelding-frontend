import { isValid, parseISO } from 'date-fns';
import begrunnelseEndringBruttoinntekt from '../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import { EndringsBelop } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import formatIsoDate from '../utils/formatIsoDate';
import { Periode, YesNo } from './state';
import useBoundStore from './useBoundStore';

export interface SendtPeriode {
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
  dato: string;
  beløp: number;
}

export interface AArsakType {
  typpe: string;
}

export interface Tariffendring extends AArsakType {
  gjelderFra: string;
  bleKjent: string;
}

export interface PeriodeListe extends AArsakType {
  liste: Array<SendtPeriode>;
}

export interface StillingsEndring extends AArsakType {
  gjelderFra: string;
}

interface Bruttoinntekt {
  beregnetInntekt: number;
  endringÅrsak?: AArsakType | Tariffendring | PeriodeListe | StillingsEndring;
  manueltKorrigert: boolean;
}

interface Innsender {
  navn: string;
  telefon: string;
}

export interface InnsendingSkjema {
  identitetsnummer: string;
  orgnrUnderenhet: string;
  egenmeldingsperioder?: Array<SendtPeriode>;
  arbeidsgiverperioder: Array<SendtPeriode> | undefined;
  bestemmendeFraværsdag: string;
  fraværsperioder: Array<SendtPeriode>;
  inntekt: Bruttoinntekt;
  fullLønnIArbeidsgiverPerioden: FullLonnIArbeidsgiverPerioden;
  refusjon: Refusjon;
  naturalytelser?: Array<SendtNaturalytelse>;
  bekreftOpplysninger: boolean;
  behandlingsdager?: Array<string>;
  årsakInnsending: string;
  // innsender: Innsender;
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
  const permittering = useBoundStore((state) => state.permittering);
  const nystillingdato = useBoundStore((state) => state.nystillingdato);
  const nystillingsprosentdato = useBoundStore((state) => state.nystillingsprosentdato);

  const behandlingsdager = useBoundStore((state) => state.behandlingsdager);

  const bestemmendeFravaersdag = useBoundStore((state) => state.bestemmendeFravaersdag);
  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  // const innsenderNavn = useBoundStore((state) => state.innsenderNavn);
  // const innsenderTelefonNr = useBoundStore((state) => state.innsenderTelefonNr);
  const nyInnsending = useBoundStore((state) => state.nyInnsending);

  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);

  // const innsender: Innsender = {
  //   navn: innsenderNavn || '',
  //   telefon: innsenderTelefonNr || ''
  // };

  return (opplysningerBekreftet: boolean): InnsendingSkjema => {
    const endringAarsak = (): AArsakType | Tariffendring | PeriodeListe | StillingsEndring | undefined => {
      if (!bruttoinntekt.endringsaarsak) return undefined;
      switch (bruttoinntekt.endringsaarsak) {
        case begrunnelseEndringBruttoinntekt.Tariffendring:
          return {
            typpe: begrunnelseEndringBruttoinntekt.Tariffendring,
            gjelderFra: formatIsoDate(tariffendringsdato),
            bleKjent: formatIsoDate(tariffkjentdato)
          };

        case begrunnelseEndringBruttoinntekt.Ferie:
          return {
            typpe: begrunnelseEndringBruttoinntekt.Ferie,
            liste: ferie!.map((periode) => ({
              fom: formatIsoDate(periode.fom),
              tom: formatIsoDate(periode.tom)
            }))
          };

        case begrunnelseEndringBruttoinntekt.VarigLonnsendring:
          return {
            typpe: begrunnelseEndringBruttoinntekt.VarigLonnsendring,
            gjelderFra: formatIsoDate(lonnsendringsdato)
          };

        case begrunnelseEndringBruttoinntekt.Permisjon:
          return {
            typpe: begrunnelseEndringBruttoinntekt.Permisjon,
            liste: permisjon!.map((periode) => ({
              fom: formatIsoDate(periode.fom),
              tom: formatIsoDate(periode.tom)
            }))
          };

        case begrunnelseEndringBruttoinntekt.Permittering:
          return {
            typpe: begrunnelseEndringBruttoinntekt.Permittering,
            liste: permittering!.map((periode) => ({
              fom: formatIsoDate(periode.fom),
              tom: formatIsoDate(periode.tom)
            }))
          };

        case begrunnelseEndringBruttoinntekt.NyStilling:
          return {
            typpe: begrunnelseEndringBruttoinntekt.NyStilling,
            gjelderFra: formatIsoDate(nystillingdato)
          };

        case begrunnelseEndringBruttoinntekt.NyStillingsprosent:
          return {
            typpe: begrunnelseEndringBruttoinntekt.NyStillingsprosent,
            gjelderFra: formatIsoDate(nystillingsprosentdato)
          };

        default:
          return {
            typpe: bruttoinntekt.endringsaarsak
          };
      }
    };

    const harEgenmeldingsdager = sjekkOmViHarEgenmeldingsdager(egenmeldingsperioder);

    const innsendingRefusjonEndringer: Array<RefusjonEndring> | undefined = konverterRefusjonsendringer(
      harRefusjonEndringer === 'Ja',
      refusjonEndringer
    );

    setSkalViseFeilmeldinger(true);
    let perioder;
    if (fravaersperioder) {
      perioder = fravaersperioder.concat(egenmeldingsperioder ?? []);
    } else {
      perioder = egenmeldingsperioder;
    }

    const innsendbarArbeidsgiverperioder: Array<SendtPeriode> | undefined =
      finnInnsendbareArbeidsgiverperioder(arbeidsgiverperioder);

    const formatertePerioder = innsendbarArbeidsgiverperioder
      ? innsendbarArbeidsgiverperioder?.map((periode) => ({
          fom: parseISO(periode.fom),
          tom: parseISO(periode.tom),
          id: 'id'
        }))
      : undefined;

    const bestemmendeFraværsdag = bestemmendeFravaersdag
      ? formatIsoDate(bestemmendeFravaersdag)
      : finnBestemmendeFravaersdag(perioder, formatertePerioder);

    const aarsakInnsending = nyInnsending ? 'Ny' : 'Endring'; // Kan være Ny eller Endring

    const skjemaData: InnsendingSkjema = {
      orgnrUnderenhet: orgnrUnderenhet!,
      identitetsnummer: identitetsnummer!,
      egenmeldingsperioder: harEgenmeldingsdager
        ? egenmeldingsperioder!.map((periode) => ({
            fom: formatIsoDate(periode.fom),
            tom: formatIsoDate(periode.tom)
          }))
        : [],
      fraværsperioder: fravaersperioder!.map((periode) => ({
        fom: formatIsoDate(periode.fom),
        tom: formatIsoDate(periode.tom)
      })),
      arbeidsgiverperioder:
        innsendbarArbeidsgiverperioder && innsendbarArbeidsgiverperioder.length > 0
          ? innsendbarArbeidsgiverperioder
          : undefined,

      inntekt: {
        beregnetInntekt: bruttoinntekt.bruttoInntekt!,
        manueltKorrigert: verdiEllerFalse(bruttoinntekt.manueltKorrigert),
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
        refusjonPrMnd: jaEllerNei(lonnISykefravaeret?.status, lonnISykefravaeret?.belop),
        refusjonOpphører: jaEllerNei(
          lonnISykefravaeret?.status,
          refusjonskravetOpphoerer?.opphorsdato ? formatIsoDate(refusjonskravetOpphoerer?.opphorsdato) : undefined
        ),
        refusjonEndringer: jaEllerNei(lonnISykefravaeret?.status, innsendingRefusjonEndringer)
      },
      naturalytelser: naturalytelser?.map((ytelse) => ({
        naturalytelse: verdiEllerBlank(ytelse.type),
        dato: formatIsoDate(ytelse.bortfallsdato),
        beløp: verdiEllerNull(ytelse.verdi)
      })),
      bekreftOpplysninger: opplysningerBekreftet,
      behandlingsdager: behandlingsdager ? behandlingsdager.map((dag) => formatIsoDate(dag)) : [],
      årsakInnsending: aarsakInnsending // Kan også være Ny eller Endring
      // innsender  // Kommer snart
    };

    return skjemaData;
  };
}

function jaEllerNei(velger: YesNo | undefined, returverdi: any): any | undefined {
  return velger === 'Ja' ? returverdi : undefined;
}

function finnInnsendbareArbeidsgiverperioder(arbeidsgiverperioder: Periode[] | undefined): SendtPeriode[] | undefined {
  return arbeidsgiverperioder && arbeidsgiverperioder.length > 0
    ? arbeidsgiverperioder
        ?.filter((periode) => (periode.fom && isValid(periode.fom)) || (periode.tom && isValid(periode.tom)))
        .map((periode) => ({ fom: formatIsoDate(periode.fom), tom: formatIsoDate(periode.tom) }))
    : undefined;
}

function verdiEllerFalse(verdi: boolean | undefined): boolean {
  return verdi ?? false;
}

function verdiEllerBlank(verdi: string | undefined): string {
  return verdi ?? '';
}

function verdiEllerNull(verdi: number | undefined): number {
  return verdi ?? 0;
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

function sjekkOmViHarEgenmeldingsdager(egenmeldingsperioder: Array<Periode> | undefined) {
  return (
    egenmeldingsperioder &&
    (egenmeldingsperioder.length > 1 || (egenmeldingsperioder[0]?.fom && egenmeldingsperioder[0]?.tom))
  );
}
