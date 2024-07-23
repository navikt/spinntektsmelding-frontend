import { isAfter, isValid, parseISO } from 'date-fns';
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
import { EndringAarsak } from '../validators/validerAapenInnsending';
import { z } from 'zod';
import fullInnsendingSchema from '../schema/fullInnsendingSchema';

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
  const [fullLonnIArbeidsgiverPerioden, lonnISykefravaeret, refusjonskravetOpphoerer] = useBoundStore((state) => [
    state.fullLonnIArbeidsgiverPerioden,
    state.lonnISykefravaeret,
    state.refusjonskravetOpphoerer
  ]);
  const naturalytelser = useBoundStore((state) => state.naturalytelser);

  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const innsenderTelefonNr = useBoundStore((state) => state.innsenderTelefonNr);
  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const skjaeringstidspunkt = useBoundStore((state) => state.skjaeringstidspunkt);
  // const gammeltSkjaeringstidspunkt = useBoundStore((state) => state.gammeltSkjaeringstidspunkt);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  const inngangFraKvittering = useBoundStore((state) => state.inngangFraKvittering);
  const arbeidsgiverKanFlytteSkjæringstidspunkt = useBoundStore(
    (state) => state.arbeidsgiverKanFlytteSkjæringstidspunkt
  );
  const bestemmendeFravaersdag = useBoundStore((state) => state.bestemmendeFravaersdag);
  type FullInnsending = z.infer<typeof fullInnsendingSchema>;

  return (opplysningerBekreftet: boolean, forespoerselId: string): FullInnsending => {
    const endringAarsak: EndringAarsak | null =
      bruttoinntekt.endringAarsak !== null &&
      bruttoinntekt.endringAarsak?.aarsak !== undefined &&
      bruttoinntekt.endringAarsak?.aarsak !== ''
        ? bruttoinntekt.endringAarsak
        : null;

    console.log('endringAarsak', endringAarsak);

    // const harEgenmeldingsdager = sjekkOmViHarEgenmeldingsdager(egenmeldingsperioder);
    // const RefusjonUtbetalingEndringUtenGammelBFD = gammeltSkjaeringstidspunkt
    //   ? refusjonEndringer?.filter((endring) => {
    //       return endring.dato && isAfter(endring.dato, gammeltSkjaeringstidspunkt);
    //     })
    //   : refusjonEndringer;

    // const innsendingRefusjonEndringer: Array<RefusjonEndring> | undefined = konverterRefusjonEndringer(
    //   harRefusjonEndringer,
    //   RefusjonUtbetalingEndringUtenGammelBFD
    // );

    setSkalViseFeilmeldinger(true);

    const forespurtData = hentPaakrevdOpplysningstyper();

    const skalSendeArbeidsgiverperiode = forespurtData.includes(skjemaVariant.arbeidsgiverperiode);
    // const skalSendeNaturalytelser = forespurtData.includes(skjemaVariant.arbeidsgiverperiode);

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

    // const kreverIkkeRefusjon = lonnISykefravaeret?.status === 'Nei';
    const skjemaData: FullInnsending = {
      forespoerselId,
      agp: {
        perioder: arbeidsgiverperioder
          ? arbeidsgiverperioder.map((periode) => ({
              fom: formatIsoDate(periode.fom!),
              tom: formatIsoDate(periode.tom!)
            }))
          : [],
        egenmeldinger: egenmeldingsperioder
          ? egenmeldingsperioder
              .filter((periode) => periode.fom && periode.tom)
              .map((periode) => ({ fom: formatIsoDate(periode!.fom!), tom: formatIsoDate(periode!.tom!) }))
          : [],
        redusertLoennIAgp:
          fullLonnIArbeidsgiverPerioden?.status === 'Nei'
            ? {
                beloep: fullLonnIArbeidsgiverPerioden.utbetalt!,
                begrunnelse: fullLonnIArbeidsgiverPerioden.begrunnelse!
              }
            : null
      },
      inntekt: {
        beloep: bruttoinntekt.bruttoInntekt!,
        inntektsdato: bestemmendeFraværsdag!, // Skjæringstidspunkt? e.l.
        // manueltKorrigert: verdiEllerFalse(bruttoinntekt.manueltKorrigert),
        naturalytelser: naturalytelser
          ? naturalytelser?.map((ytelse) => ({
              naturalytelse: verdiEllerBlank(ytelse.type),
              sluttdato: formatIsoDate(ytelse.bortfallsdato),
              verdiBeloep: verdiEllerNull(ytelse.verdi)
            }))
          : [],
        endringAarsak: endringAarsak
      },
      refusjon:
        lonnISykefravaeret?.status === 'Ja'
          ? {
              beloepPerMaaned: lonnISykefravaeret.beloep!,
              sluttdato: (formatIsoDate(refusjonskravetOpphoerer?.opphoersdato) as string) ?? null,
              endringer: konverterRefusjonEndringer(harRefusjonEndringer, refusjonEndringer)
            }
          : null,
      avsenderTlf: innsenderTelefonNr || ''
    };

    // const paakrevdeData = forespurtData;

    // if (!paakrevdeData.includes(skjemaVariant.arbeidsgiverperiode)) {
    //   delete skjemaData.fullLønnIArbeidsgiverPerioden;
    // }

    // if (!skalSendeNaturalytelser) {
    //   delete skjemaData.naturalytelser;
    // }

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
  let opphørsdato;
  if (!kreverIkkeRefusjon && refusjonskravetOpphoerer?.status === 'Ja' && refusjonskravetOpphoerer?.opphoersdato) {
    opphørsdato = formatIsoDate(refusjonskravetOpphoerer?.opphoersdato);
  }
  return opphørsdato;
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

function verdiEllerBlank(verdi: string | undefined): string {
  return verdi ?? '';
}

function verdiEllerNull(verdi: number | undefined): number {
  return verdi ?? 0;
}

function konverterRefusjonEndringer(
  harRefusjonEndringer: YesNo | undefined,
  refusjonEndringer: Array<EndringsBeloep> | undefined
): RefusjonEndring[] | undefined {
  const refusjoner =
    harRefusjonEndringer === 'Ja' && refusjonEndringer
      ? refusjonEndringer.map((endring) => ({
          beloep: endring.beloep!,
          startdato: formatIsoDate(endring.dato)
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
