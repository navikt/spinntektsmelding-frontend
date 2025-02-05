import { isValid } from 'date-fns';
import { EndringsBeloep } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import formatIsoDate from '../utils/formatIsoDate';
import { LonnIArbeidsgiverperioden, Periode, YesNo } from './state';
import useBoundStore from './useBoundStore';
import skjemaVariant from '../config/skjemavariant';
import { TDateISODate } from './MottattData';
import parseIsoDate from '../utils/parseIsoDate';
import { EndringAarsak, RefusjonEndring } from '../validators/validerAapenInnsending';
import { z } from 'zod';
import fullInnsendingSchema from '../schema/fullInnsendingSchema';
import { skalSendeArbeidsgiverperiode } from './useFyllAapenInnsending';
import { konverterEndringAarsakSchema } from '../schema/konverterEndringAarsakSchema';

export interface SendtPeriode {
  fom: TDateISODate;
  tom: TDateISODate;
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

    setSkalViseFeilmeldinger(true);

    const forespurtData = hentPaakrevdOpplysningstyper();

    const harForespurtArbeidsgiverperiode = forespurtData.includes(skjemaVariant.arbeidsgiverperiode);

    const perioder = concatPerioder(fravaersperioder, egenmeldingsperioder);

    const innsendbarArbeidsgiverperioder: Array<SendtPeriode> | [] = finnInnsendbareArbeidsgiverperioder(
      arbeidsgiverperioder,
      harForespurtArbeidsgiverperiode
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
            )
          );

    const bestemmendeFraværsdag = hentBestemmendeFraværsdag(
      harForespurtArbeidsgiverperiode,
      perioder,
      formatertePerioder,
      skjaeringstidspunkt,
      arbeidsgiverKanFlytteSkjæringstidspunkt(),
      inngangFraKvittering,
      bestemmendeFravaersdag,
      beregnetSkjaeringstidspunkt
    );

    const endringAarsakParsed = endringAarsak ? konverterEndringAarsakSchema.parse(endringAarsak) : null;

    const skjemaData: FullInnsending = {
      forespoerselId,
      agp: {
        perioder:
          skalSendeArbeidsgiverperiode(fullLonnIArbeidsgiverPerioden?.begrunnelse, arbeidsgiverperioder) &&
          arbeidsgiverperioder
            ? arbeidsgiverperioder.map((periode) => ({
                fom: formatIsoDate(periode.fom),
                tom: formatIsoDate(periode.tom)
              }))
            : [],
        egenmeldinger: egenmeldingsperioder
          ? egenmeldingsperioder
              .filter((periode) => periode.fom && periode.tom)
              .map((periode) => ({ fom: formatIsoDate(periode.fom), tom: formatIsoDate(periode.tom) }))
          : [],
        redusertLoennIAgp: formaterRedusertLoennIAgp(fullLonnIArbeidsgiverPerioden)
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
        endringAarsak: endringAarsakParsed
      },
      refusjon:
        lonnISykefravaeret?.status === 'Ja'
          ? {
              beloepPerMaaned: lonnISykefravaeret.beloep!,
              sluttdato: formaterOpphørsdato(refusjonskravetOpphoerer?.status, refusjonskravetOpphoerer?.opphoersdato),

              endringer: konverterRefusjonEndringer(harRefusjonEndringer, refusjonEndringer)
            }
          : null,
      avsenderTlf: innsenderTelefonNr ?? ''
    };

    return skjemaData;
  };
}

function hentBestemmendeFraværsdag(
  harForespurtArbeidsgiverperiode: boolean,
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
      finnBestemmendeFravaersdag(perioder, undefined, undefined, arbeidsgiverKanFlytteSkjæringstidspunkt)
    );
  }

  return harForespurtArbeidsgiverperiode
    ? finnBestemmendeFravaersdag(
        perioder,
        formatertePerioder,
        skjaeringstidspunkt,
        arbeidsgiverKanFlytteSkjæringstidspunkt
      )
    : setRiktigBestemmendeFravaersdag(inngangFraKvittering, bestemmendeFravaersdag, beregnetSkjaeringstidspunkt);
}

function setRiktigBestemmendeFravaersdag(inngangFraKvittering, bestemmendeFravaersdag, beregnetSkjaeringstidspunkt) {
  return inngangFraKvittering ? formatIsoDate(bestemmendeFravaersdag) : formatIsoDate(beregnetSkjaeringstidspunkt);
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

export function konverterPerioderFraMottattTilInterntFormat(
  innsendbarArbeidsgiverperioder: SendtPeriode[] | undefined
) {
  return innsendbarArbeidsgiverperioder
    ? innsendbarArbeidsgiverperioder?.map((periode) => ({
        fom: parseIsoDate(periode.fom),
        tom: parseIsoDate(periode.tom),
        id: 'id'
      }))
    : undefined;
}

function finnInnsendbareArbeidsgiverperioder(
  arbeidsgiverperioder: Periode[] | undefined,
  harForespurtArbeidsgiverperiode: boolean
): SendtPeriode[] | [] {
  if (!harForespurtArbeidsgiverperiode) {
    return [];
  }

  return arbeidsgiverperioder && arbeidsgiverperioder.length > 0
    ? arbeidsgiverperioder
        ?.filter((periode) => (periode.fom && isValid(periode.fom)) || (periode.tom && isValid(periode.tom)))
        .map((periode) => ({ fom: formatIsoDate(periode.fom), tom: formatIsoDate(periode.tom) }))
    : [];
}

export function verdiEllerBlank(verdi: string | undefined): string {
  return verdi ?? '';
}

export function verdiEllerNull(verdi: number | undefined): number {
  return verdi ?? 0;
}

export function konverterRefusjonEndringer(
  harRefusjonEndringer: YesNo | undefined,
  refusjonEndringer: Array<EndringsBeloep> | undefined
): RefusjonEndring[] | [] {
  const refusjoner =
    harRefusjonEndringer === 'Ja' && refusjonEndringer
      ? refusjonEndringer.map((endring) => ({
          beloep: endring.beloep!,
          startdato: formatIsoDate(endring.dato)
        }))
      : [];

  if (refusjoner && refusjoner.length > 0) {
    return refusjoner;
  } else {
    return [];
  }
}

export function formaterOpphørsdato(
  kravetOpphoerer: YesNo | undefined,
  refusjonskravetOpphoerer: Date | undefined
): TDateISODate | null {
  const formatertDato =
    kravetOpphoerer === 'Ja' && refusjonskravetOpphoerer ? formatIsoDate(refusjonskravetOpphoerer) : null;
  if (formatertDato) {
    return formatertDato;
  }
  return null;
}

export function formaterRedusertLoennIAgp(
  fullLonnIArbeidsgiverPerioden: LonnIArbeidsgiverperioden | undefined
): { beloep: number; begrunnelse: string } | null {
  return fullLonnIArbeidsgiverPerioden?.begrunnelse !== undefined &&
    fullLonnIArbeidsgiverPerioden?.begrunnelse !== '' &&
    fullLonnIArbeidsgiverPerioden?.status === 'Nei'
    ? {
        beloep: fullLonnIArbeidsgiverPerioden.utbetalt ?? 0,
        begrunnelse: fullLonnIArbeidsgiverPerioden.begrunnelse
      }
    : null;
}
