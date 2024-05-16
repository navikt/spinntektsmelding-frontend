import { isAfter, isValid, parseISO } from 'date-fns';

import { EndringsBeloep } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import formatIsoDate from '../utils/formatIsoDate';
import { Periode, YesNo } from './state';
import useBoundStore from './useBoundStore';
import skjemaVariant from '../config/skjemavariant';
import { Opplysningstype } from './useForespurtDataStore';
import { TDateISODate } from './MottattData';
import delvisInnsendingSchema from '../schema/delvisInnsendingSchema';
import { z } from 'zod';
import { hentBestemmendeFraværsdag } from './useFyllInnsending';
import parseIsoDate from '../utils/parseIsoDate';
import { finnFoersteFravaersdag } from '../pages/endring/[slug]';

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
  refusjonOpphører?: TDateISODate;
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

export default function useFyllDelvisInnsending() {
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);

  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const [identitetsnummer, orgnrUnderenhet] = useBoundStore((state) => [state.identitetsnummer, state.orgnrUnderenhet]);
  const [fullLonnIArbeidsgiverPerioden] = useBoundStore((state) => [state.fullLonnIArbeidsgiverPerioden]);
  const naturalytelser = useBoundStore((state) => state.naturalytelser);

  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const nyInnsending = useBoundStore((state) => state.nyInnsending);
  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const skjaeringstidspunkt = useBoundStore((state) => state.skjaeringstidspunkt);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  const inngangFraKvittering = useBoundStore((state) => state.inngangFraKvittering);
  const arbeidsgiverKanFlytteSkjæringstidspunkt = useBoundStore(
    (state) => state.arbeidsgiverKanFlytteSkjæringstidspunkt
  );
  const [bestemmendeFravaersdag, mottattBestemmendeFravaersdag, mottattEksternBestemmendeFravaersdag] = useBoundStore(
    (state) => [
      state.bestemmendeFravaersdag,
      state.mottattBestemmendeFravaersdag,
      state.mottattEksternBestemmendeFravaersdag
    ]
  );
  const setForeslaattBestemmendeFravaersdag = useBoundStore((state) => state.setForeslaattBestemmendeFravaersdag);

  const beregnetBestemmendeFravaersdag = finnFoersteFravaersdag(
    bestemmendeFravaersdag,
    mottattBestemmendeFravaersdag,
    mottattEksternBestemmendeFravaersdag
  );

  type SkjemaData = z.infer<typeof delvisInnsendingSchema>;

  return (skjema: SkjemaData): InnsendingSkjema => {
    const harEgenmeldingsdager = sjekkOmViHarEgenmeldingsdager(egenmeldingsperioder);

    const RefusjonUtbetalingEndringUtenGammelBFD = skjema.refusjon.refusjonEndringer
      ? skjema.refusjon.refusjonEndringer.filter((endring) => {
          if (!endring.dato) return false;
          return isAfter(endring.dato, beregnetBestemmendeFravaersdag);
        })
      : beregnetBestemmendeFravaersdag && refusjonEndringer
        ? refusjonEndringer?.filter((endring) => {
            if (!endring.dato) return false;
            return isAfter(endring.dato, beregnetBestemmendeFravaersdag);
          })
        : refusjonEndringer;

    const harRefusjonEndringerTilInnsending =
      skjema.refusjon.erDetEndringRefusjon === 'Nei'
        ? harRefusjonEndringer === 'Ja'
        : skjema.refusjon.erDetEndringRefusjon === 'Ja';

    const innsendingRefusjonEndringer: Array<RefusjonEndring> | undefined = konverterRefusjonsendringer(
      harRefusjonEndringerTilInnsending ? 'Ja' : 'Nei',
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

    const bestemmendeFraværsdagTilInnsending = finnFoersteFravaersdag(
      beregnetSkjaeringstidspunkt,
      mottattBestemmendeFravaersdag,
      mottattEksternBestemmendeFravaersdag
    );

    console.log('bestemmendeFraværsdagTilInnsending', bestemmendeFraværsdagTilInnsending);

    const bestemmendeFraværsdag = formatIsoDate(bestemmendeFraværsdagTilInnsending);

    setForeslaattBestemmendeFravaersdag(bestemmendeFraværsdagTilInnsending);

    const aarsakInnsending = nyEllerEndring(nyInnsending); // Kan være Ny eller Endring

    const endringAarsak =
      skjema.inntekt.endringAarsak?.aarsak && skjema.inntekt.endringAarsak?.aarsak !== 'SammeSomSist'
        ? {
            ...skjema.inntekt.endringAarsak,
            liste: skjema.inntekt.endringAarsak?.perioder ?? undefined,
            typpe:
              skjema.inntekt.endringAarsak?.aarsak === 'VarigLoennsendring'
                ? 'VarigLonnsendring'
                : skjema.inntekt.endringAarsak?.aarsak,
            aarsak: undefined,
            perioder: undefined
          }
        : undefined;

    const manueltKorrigertInntekt =
      !!skjema.inntekt.endringAarsak?.aarsak && skjema.inntekt.endringAarsak?.aarsak !== 'SammeSomSist';

    const skjemaData: InnsendingSkjema = {
      orgnrUnderenhet: orgnrUnderenhet!,
      identitetsnummer: identitetsnummer!,
      egenmeldingsperioder: harEgenmeldingsdager
        ? egenmeldingsperioder!.map((periode) => ({
            fom: formatIsoDate(periode.fom) as TDateISODate,
            tom: formatIsoDate(periode.tom) as TDateISODate
          }))
        : [],
      fraværsperioder: fravaersperioder!.map((periode) => ({
        fom: formatIsoDate(periode.fom) as TDateISODate,
        tom: formatIsoDate(periode.tom) as TDateISODate
      })),
      arbeidsgiverperioder: innsendbarArbeidsgiverperioder,
      inntekt: {
        bekreftet: true,
        beregnetInntekt: skjema.inntekt.beloep!,
        manueltKorrigert: manueltKorrigertInntekt,
        endringÅrsak: endringAarsak
      },
      bestemmendeFraværsdag: bestemmendeFraværsdag!,
      fullLønnIArbeidsgiverPerioden: {
        utbetalerFullLønn: fullLonnIArbeidsgiverPerioden?.status === 'Ja',
        begrunnelse: fullLonnIArbeidsgiverPerioden?.status === 'Ja' ? null : fullLonnIArbeidsgiverPerioden?.begrunnelse,
        utbetalt: fullLonnIArbeidsgiverPerioden?.status === 'Ja' ? null : fullLonnIArbeidsgiverPerioden?.utbetalt
      },
      refusjon: {
        utbetalerHeleEllerDeler: skjema.refusjon.kreverRefusjon === 'Ja',
        refusjonPrMnd: skjema.refusjon.refusjonPrMnd ?? 0,
        refusjonOpphører: formaterOpphørsdato(
          skjema.refusjon.kravetOpphoerer as YesNo,
          skjema.refusjon.refusjonOpphoerer!
        ),

        refusjonEndringer: harRefusjonEndringerTilInnsending ? innsendingRefusjonEndringer : undefined
      },
      naturalytelser: naturalytelser?.map((ytelse) => ({
        naturalytelse: verdiEllerBlank(ytelse.type),
        dato: formatIsoDate(ytelse.bortfallsdato),
        beløp: verdiEllerNull(ytelse.verdi)
      })),
      bekreftOpplysninger: skjema.opplysningerBekreftet,
      behandlingsdager: [],
      årsakInnsending: aarsakInnsending, // Kan også være Ny eller Endring
      telefonnummer: skjema.telefon || '',
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

function formaterOpphørsdato(kravetOpphoerer: YesNo, refusjonskravetOpphoerer: Date): TDateISODate | undefined {
  const formatertDato =
    kravetOpphoerer === 'Ja' && refusjonskravetOpphoerer ? formatIsoDate(refusjonskravetOpphoerer) : undefined;
  if (formatertDato) {
    return formatertDato;
  }
  return undefined;
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

function jaEllerNei(velger: YesNo | undefined, returverdi: any): any | undefined {
  return velger === 'Ja' ? returverdi : undefined;
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

function konverterRefusjonsendringer(
  harRefusjonEndringer: YesNo | undefined,
  refusjonEndringer: Array<EndringsBeloep> | undefined
): RefusjonEndring[] | undefined {
  const refusjoner =
    harRefusjonEndringer === 'Ja' && refusjonEndringer
      ? refusjonEndringer
          .filter((endring) => endring.dato)
          .map((endring) => ({
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
