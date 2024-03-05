import { isEqual, isValid, parseISO } from 'date-fns';
import begrunnelseEndringBruttoinntekt from '../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import { EndringsBeloep } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import formatIsoDate from '../utils/formatIsoDate';
import { Periode, RefusjonskravetOpphoerer, YesNo } from './state';
import useBoundStore from './useBoundStore';
import skjemaVariant from '../config/skjemavariant';
import { Opplysningstype } from './useForespurtDataStore';
import { TDateISODate } from './MottattData';
import parseIsoDate from '../utils/parseIsoDate';

export interface SendtPeriode {
  fom: TDateISODate;
  tom: TDateISODate;
}

interface FullLonnIArbeidsgiverPerioden {
  utbetalerFullLønn: boolean;
  begrunnelse?: string | null;
  utbetalt?: number | null;
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
  bekreftet: boolean;
  beregnetInntekt: number;
  endringÅrsak?: AArsakType | Tariffendring | PeriodeListe | StillingsEndring;
  manueltKorrigert: boolean;
}

export interface InnsendingSkjema {
  identitetsnummer: string;
  orgnrUnderenhet: string;
  egenmeldingsperioder?: Array<SendtPeriode>;
  arbeidsgiverperioder: Array<SendtPeriode> | undefined;
  bestemmendeFraværsdag: string;
  fraværsperioder: Array<SendtPeriode>;
  inntekt: Bruttoinntekt;
  fullLønnIArbeidsgiverPerioden?: FullLonnIArbeidsgiverPerioden;
  refusjon: Refusjon;
  naturalytelser?: Array<SendtNaturalytelse>;
  bekreftOpplysninger: boolean;
  behandlingsdager?: Array<string>;
  årsakInnsending: string;
  forespurtData: Array<Opplysningstype>;
  telefonnummer: string;
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
  const [tariffendringDato, tariffkjentdato] = useBoundStore((state) => [
    state.tariffendringDato,
    state.tariffkjentdato
  ]);
  const ferie = useBoundStore((state) => state.ferie);
  const lonnsendringsdato = useBoundStore((state) => state.lonnsendringsdato);
  const permisjon = useBoundStore((state) => state.permisjon);
  const permittering = useBoundStore((state) => state.permittering);
  const nystillingdato = useBoundStore((state) => state.nystillingdato);
  const nystillingsprosentdato = useBoundStore((state) => state.nystillingsprosentdato);
  const sykefravaerperioder = useBoundStore((state) => state.sykefravaerperioder);
  const behandlingsdager = useBoundStore((state) => state.behandlingsdager);

  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const innsenderTelefonNr = useBoundStore((state) => state.innsenderTelefonNr);
  const nyInnsending = useBoundStore((state) => state.nyInnsending);
  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const skjaeringstidspunkt = useBoundStore((state) => state.skjaeringstidspunkt);
  const gammeltSkjaeringstidspunkt = useBoundStore((state) => state.gammeltSkjaeringstidspunkt);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  const inngangFraKvittering = useBoundStore((state) => state.inngangFraKvittering);
  const arbeidsgiverKanFlytteSkjæringstidspunkt = useBoundStore(
    (state) => state.arbeidsgiverKanFlytteSkjæringstidspunkt
  );
  const bestemmendeFravaersdag = useBoundStore((state) => state.bestemmendeFravaersdag);

  return (opplysningerBekreftet: boolean): InnsendingSkjema => {
    const endringAarsak = (): AArsakType | Tariffendring | PeriodeListe | StillingsEndring | undefined => {
      if (!bruttoinntekt.endringsaarsak) return undefined;
      switch (bruttoinntekt.endringsaarsak) {
        case begrunnelseEndringBruttoinntekt.Tariffendring:
          return {
            typpe: begrunnelseEndringBruttoinntekt.Tariffendring,
            gjelderFra: formatIsoDate(tariffendringDato),
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

        case begrunnelseEndringBruttoinntekt.VarigLoennsendring:
          return {
            typpe: 'VarigLonnsendring', // TODO: Denne må rettes opp når vi får samme navnet på alle apiene.
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

        case begrunnelseEndringBruttoinntekt.Sykefravaer:
          return {
            typpe: begrunnelseEndringBruttoinntekt.Sykefravaer,
            liste: sykefravaerperioder!.map((periode) => ({
              fom: formatIsoDate(periode.fom),
              tom: formatIsoDate(periode.tom)
            }))
          };

        default:
          return {
            typpe: bruttoinntekt.endringsaarsak.toString()
          };
      }
    };

    const harEgenmeldingsdager = sjekkOmViHarEgenmeldingsdager(egenmeldingsperioder);

    const RefusjonUtbetalingEndringUtenGammelBFD = refusjonEndringer?.filter((endring) => {
      return !isEqual(gammeltSkjaeringstidspunkt as Date, endring.dato || (gammeltSkjaeringstidspunkt as Date));
    });

    const innsendingRefusjonEndringer: Array<RefusjonEndring> | undefined = konverterRefusjonsendringer(
      harRefusjonEndringer,
      RefusjonUtbetalingEndringUtenGammelBFD
    );

    setSkalViseFeilmeldinger(true);

    const forespurtData = hentPaakrevdOpplysningstyper();

    const skalSendeArbeidsgiverperiode = forespurtData.includes(skjemaVariant.arbeidsgiverperiode);
    const skalSendeNaturalytelser = forespurtData.includes(skjemaVariant.arbeidsgiverperiode);

    const perioder = concatPerioder(fravaersperioder, egenmeldingsperioder);

    const innsendbarArbeidsgiverperioder: Array<SendtPeriode> | [] = finnInnsendbareArbeidsgiverperioder(
      arbeidsgiverperioder,
      skalSendeArbeidsgiverperiode
    );

    const formatertePerioder = konverterPerioderFraMottattTilInterntFormat(innsendbarArbeidsgiverperioder);

    const beregnetSkjaeringstidspunkt =
      skjaeringstidspunkt && isValid(skjaeringstidspunkt)
        ? skjaeringstidspunkt
        : parseIsoDate(
            finnBestemmendeFravaersdag(
              perioder,
              formatertePerioder,
              skjaeringstidspunkt,
              arbeidsgiverKanFlytteSkjæringstidspunkt()
            )!
          );

    const bestemmendeFraværsdag = hentBestemmendeFraværsdag(
      skalSendeArbeidsgiverperiode,
      perioder,
      formatertePerioder,
      skjaeringstidspunkt,
      arbeidsgiverKanFlytteSkjæringstidspunkt(),
      inngangFraKvittering,
      bestemmendeFravaersdag,
      beregnetSkjaeringstidspunkt
    );

    const kreverIkkeRefusjon = lonnISykefravaeret?.status === 'Nei';

    const aarsakInnsending = nyEllerEndring(nyInnsending); // Kan være Ny eller Endring
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
      arbeidsgiverperioder: innsendbarArbeidsgiverperioder,
      inntekt: {
        bekreftet: true,
        beregnetInntekt: bruttoinntekt.bruttoInntekt!,
        manueltKorrigert: verdiEllerFalse(bruttoinntekt.manueltKorrigert),
        endringÅrsak: endringAarsak()
      },
      bestemmendeFraværsdag: bestemmendeFraværsdag!,
      fullLønnIArbeidsgiverPerioden: {
        utbetalerFullLønn: fullLonnIArbeidsgiverPerioden?.status === 'Ja',
        begrunnelse: fullLonnIArbeidsgiverPerioden?.status === 'Ja' ? null : fullLonnIArbeidsgiverPerioden?.begrunnelse,
        utbetalt: fullLonnIArbeidsgiverPerioden?.status === 'Ja' ? null : fullLonnIArbeidsgiverPerioden?.utbetalt
      },
      refusjon: {
        utbetalerHeleEllerDeler: !kreverIkkeRefusjon,
        refusjonPrMnd: !kreverIkkeRefusjon ? lonnISykefravaeret?.beloep : undefined,
        refusjonOpphører: formaterOpphørsdato(kreverIkkeRefusjon, refusjonskravetOpphoerer),

        refusjonEndringer: !kreverIkkeRefusjon ? innsendingRefusjonEndringer : undefined
      },
      naturalytelser: naturalytelser?.map((ytelse) => ({
        naturalytelse: verdiEllerBlank(ytelse.type),
        dato: formatIsoDate(ytelse.bortfallsdato),
        beløp: verdiEllerNull(ytelse.verdi)
      })),
      bekreftOpplysninger: opplysningerBekreftet,
      behandlingsdager: behandlingsdager ? behandlingsdager.map((dag) => formatIsoDate(dag)) : [],
      årsakInnsending: aarsakInnsending, // Kan også være Ny eller Endring
      telefonnummer: innsenderTelefonNr || '',
      forespurtData: forespurtData
    };

    const paakrevdeData = forespurtData;

    if (!paakrevdeData.includes(skjemaVariant.arbeidsgiverperiode)) {
      delete skjemaData.fullLønnIArbeidsgiverPerioden;
    }

    if (!skalSendeNaturalytelser) {
      delete skjemaData.naturalytelser;
    }

    return skjemaData;
  };
}

export function hentBestemmendeFraværsdag(
  skalSendeArbeidsgiverperiode: boolean,
  perioder: Periode[] | undefined,
  formatertePerioder: { fom: Date; tom: Date; id: string }[] | undefined,
  skjaeringstidspunkt: Date | undefined,
  arbeidsgiverKanFlytteSkjæringstidspunkt: boolean,
  inngangFraKvittering: boolean,
  bestemmendeFravaersdag: Date | undefined,
  beregnetSkjaeringstidspunkt: Date
) {
  if (!isValid(beregnetSkjaeringstidspunkt)) {
    beregnetSkjaeringstidspunkt = parseIsoDate(
      finnBestemmendeFravaersdag(perioder, undefined, undefined, arbeidsgiverKanFlytteSkjæringstidspunkt)!
    );
  }

  return skalSendeArbeidsgiverperiode
    ? finnBestemmendeFravaersdag(
        perioder,
        formatertePerioder,
        skjaeringstidspunkt,
        arbeidsgiverKanFlytteSkjæringstidspunkt
      )
    : inngangFraKvittering
      ? formatIsoDate(bestemmendeFravaersdag)
      : formatIsoDate(beregnetSkjaeringstidspunkt);
}

function formaterOpphørsdato(
  kreverIkkeRefusjon: boolean,
  refusjonskravetOpphoerer: RefusjonskravetOpphoerer | undefined
): string | undefined {
  return !kreverIkkeRefusjon
    ? refusjonskravetOpphoerer?.opphoersdato
      ? formatIsoDate(refusjonskravetOpphoerer?.opphoersdato)
      : undefined
    : undefined;
}

function nyEllerEndring(nyInnsending: boolean) {
  return nyInnsending ? 'Ny' : 'Endring';
}

function concatPerioder(fravaersperioder: Periode[] | undefined, egenmeldingsperioder: Periode[] | undefined) {
  let perioder;
  if (fravaersperioder) {
    perioder = fravaersperioder.concat(egenmeldingsperioder ?? []);
  } else {
    perioder = egenmeldingsperioder;
  }
  return perioder;
}

function konverterPerioderFraMottattTilInterntFormat(innsendbarArbeidsgiverperioder: SendtPeriode[] | undefined) {
  return innsendbarArbeidsgiverperioder
    ? innsendbarArbeidsgiverperioder?.map((periode) => ({
        fom: parseISO(periode.fom),
        tom: parseISO(periode.tom),
        id: 'id'
      }))
    : undefined;
}

function finnInnsendbareArbeidsgiverperioder(
  arbeidsgiverperioder: Periode[] | undefined,
  skalSendeArbeidsgiverperiode: boolean
): SendtPeriode[] | [] {
  if (!skalSendeArbeidsgiverperiode) {
    return [];
  }

  return arbeidsgiverperioder && arbeidsgiverperioder.length > 0
    ? arbeidsgiverperioder
        ?.filter((periode) => (periode.fom && isValid(periode.fom)) || (periode.tom && isValid(periode.tom)))
        .map((periode) => ({ fom: formatIsoDate(periode.fom), tom: formatIsoDate(periode.tom) }))
    : [];
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
  harRefusjonEndringer: YesNo | undefined,
  refusjonEndringer: Array<EndringsBeloep> | undefined
): RefusjonEndring[] | undefined {
  const refusjoner =
    harRefusjonEndringer === 'Ja' && refusjonEndringer
      ? refusjonEndringer.map((endring) => ({
          beløp: endring.beloep!,
          dato: formatIsoDate(endring.dato)!
        }))
      : undefined;

  if (refusjoner && refusjoner.length > 0) {
    return refusjoner;
  } else {
    return undefined;
  }
}

function sjekkOmViHarEgenmeldingsdager(egenmeldingsperioder: Array<Periode> | undefined) {
  return (
    egenmeldingsperioder &&
    (egenmeldingsperioder.length > 1 || (egenmeldingsperioder[0]?.fom && egenmeldingsperioder[0]?.tom))
  );
}
