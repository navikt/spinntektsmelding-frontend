import { isValid } from 'date-fns';
import { EndringsBeloep } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import formatIsoDate from '../utils/formatIsoDate';
import { LonnIArbeidsgiverperioden, Naturalytelse, Periode, YesNo } from './state';
import useBoundStore from './useBoundStore';
import forespoerselType from '../config/forespoerselType';
import parseIsoDate from '../utils/parseIsoDate';
import { RefusjonEndring } from '../validators/validerAapenInnsending';
import { z } from 'zod';
import FullInnsendingSchema from '../schema/FullInnsendingSchema';
import { skalSendeArbeidsgiverperiode } from './useFyllAapenInnsending';
import { KonverterEndringAarsakSchema } from '../schema/KonverterEndringAarsakSchema';
import { HovedskjemaSchema } from '../schema/HovedskjemaSchema';
import { NaturalytelseEnumSchema } from '../schema/NaturalytelseEnumSchema';
import { ApiPeriodeSchema } from '../schema/ApiPeriodeSchema';
import { TidPeriode } from '../schema/TidPeriodeSchema';
import { Opplysningstype } from '../schema/ForespurtDataSchema';

export type SendtPeriode = z.infer<typeof ApiPeriodeSchema>;

export default function useFyllInnsending() {
  const sykmeldingsperioder = useBoundStore((state) => state.sykmeldingsperioder);

  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const [fullLonnIArbeidsgiverPerioden, lonnISykefravaeret, ForespurtDataSchema] = useBoundStore((state) => [
    state.fullLonnIArbeidsgiverPerioden,
    state.lonnISykefravaeret,
    state.ForespurtDataSchema
  ]);

  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const skjaeringstidspunkt = useBoundStore((state) => state.skjaeringstidspunkt);
  const setSkjaeringstidspunkt = useBoundStore((state) => state.setSkjaeringstidspunkt);
  const foreslaattBestemmendeFravaersdag = useBoundStore((state) => state.foreslaattBestemmendeFravaersdag);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  const inngangFraKvittering = useBoundStore((state) => state.inngangFraKvittering);
  const arbeidsgiverKanFlytteSkjæringstidspunkt = useBoundStore(
    (state) => state.arbeidsgiverKanFlytteSkjæringstidspunkt
  );
  const [setEndringAarsaker, setBareNyMaanedsinntekt, setInnsenderTelefon, initNaturalytelser, setKvitteringData] =
    useBoundStore((state) => [
      state.setEndringAarsaker,
      state.setBareNyMaanedsinntekt,
      state.setInnsenderTelefon,
      state.initNaturalytelser,
      state.setKvitteringData
    ]);

  type FullInnsending = z.infer<typeof FullInnsendingSchema>;
  type Skjema = z.infer<typeof HovedskjemaSchema>;

  return (
    opplysningerBekreftet: boolean,
    forespoerselId: string,
    forespurteOpplysningstyper: Opplysningstype[],
    skjemaData: Skjema
  ): FullInnsending => {
    setSkalViseFeilmeldinger(true);

    const harForespurtArbeidsgiverperiode = forespurteOpplysningstyper.includes(forespoerselType.arbeidsgiverperiode);
    const harForespurtInntekt = forespurteOpplysningstyper.includes(forespoerselType.inntekt);

    const perioder = concatPerioder(sykmeldingsperioder, egenmeldingsperioder);

    const innsendbarArbeidsgiverperioder: Array<SendtPeriode> | [] = finnInnsendbareArbeidsgiverperioder(
      arbeidsgiverperioder,
      harForespurtArbeidsgiverperiode
    );

    const formatertePerioder = konverterPerioderFraMottattTilInterntFormat(innsendbarArbeidsgiverperioder);

    let beregnetSkjaeringstidspunkt =
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

    let kreverAgp = true;
    if (ForespurtDataSchema?.arbeidsgiverperiode?.paakrevd === false || !harForespurtArbeidsgiverperiode) {
      kreverAgp = false;
      setSkjaeringstidspunkt(
        ForespurtDataSchema?.inntekt?.forslag?.forrigeInntekt?.skjæringstidspunkt ?? foreslaattBestemmendeFravaersdag
      );

      beregnetSkjaeringstidspunkt = parseIsoDate(
        ForespurtDataSchema?.inntekt?.forslag?.forrigeInntekt?.skjæringstidspunkt ?? foreslaattBestemmendeFravaersdag
      );
    }
    const bestemmendeFraværsdag = kreverAgp
      ? hentBestemmendeFraværsdag(
          harForespurtArbeidsgiverperiode,
          perioder,
          formatertePerioder,
          skjaeringstidspunkt,
          arbeidsgiverKanFlytteSkjæringstidspunkt(),
          inngangFraKvittering,
          undefined,
          beregnetSkjaeringstidspunkt
        )
      : ForespurtDataSchema?.inntekt?.forslag?.forrigeInntekt?.skjæringstidspunkt;

    const endringAarsakerParsed = skjemaData.inntekt?.endringAarsaker
      ? skjemaData.inntekt?.endringAarsaker.map((endringAarsak) => {
          return KonverterEndringAarsakSchema.parse(endringAarsak);
        })
      : [];

    setEndringAarsaker(skjemaData.inntekt?.endringAarsaker);

    setBareNyMaanedsinntekt(skjemaData.inntekt?.beloep ?? 0);

    setInnsenderTelefon(skjemaData.avsenderTlf);

    initNaturalytelser(skjemaData.inntekt?.naturalytelser);

    const innsendingSkjema: FullInnsending = {
      forespoerselId,
      agp: {
        perioder: mapArbeidsgiverPerioder(fullLonnIArbeidsgiverPerioden, arbeidsgiverperioder),
        egenmeldinger: mapEgenmeldingsperioder(egenmeldingsperioder),
        redusertLoennIAgp: formaterRedusertLoennIAgp(fullLonnIArbeidsgiverPerioden)
      },
      inntekt: harForespurtInntekt
        ? {
            beloep: skjemaData.inntekt?.beloep ?? 0,
            inntektsdato: bestemmendeFraværsdag ?? formatIsoDate(beregnetSkjaeringstidspunkt), // Skjæringstidspunkt? e.l.
            naturalytelser: mapNaturalytelserToData(skjemaData.inntekt?.naturalytelser),
            endringAarsaker: endringAarsakerParsed
          }
        : null,
      refusjon:
        lonnISykefravaeret?.status === 'Ja'
          ? {
              beloepPerMaaned: lonnISykefravaeret.beloep!,
              sluttdato: null,

              endringer: konverterRefusjonEndringer(harRefusjonEndringer, refusjonEndringer)
            }
          : null,
      avsenderTlf: skjemaData.avsenderTlf ?? ''
    };

    if (!harForespurtArbeidsgiverperiode) {
      innsendingSkjema.agp = null;
    }

    setKvitteringData(innsendingSkjema);

    return innsendingSkjema;
  };
}

function mapArbeidsgiverPerioder(
  fullLonnIArbeidsgiverPerioden: LonnIArbeidsgiverperioden | undefined,
  arbeidsgiverperioder: Periode[] | undefined
): { fom: string; tom: string }[] {
  return skalSendeArbeidsgiverperiode(fullLonnIArbeidsgiverPerioden?.begrunnelse, arbeidsgiverperioder) &&
    arbeidsgiverperioder
    ? arbeidsgiverperioder.map((periode) => ({
        fom: formatIsoDate(periode.fom),
        tom: formatIsoDate(periode.tom)
      }))
    : [];
}

export function mapEgenmeldingsperioder(egenmeldingsperioder: Periode[] | undefined) {
  return egenmeldingsperioder
    ? egenmeldingsperioder
        .filter((periode) => periode.fom && periode.tom)
        .map((periode) => ({ fom: formatIsoDate(periode.fom), tom: formatIsoDate(periode.tom) }))
    : [];
}

export function mapNaturalytelserToData(naturalytelser: Naturalytelse[] | undefined) {
  return naturalytelser
    ? naturalytelser?.map((ytelse) => ({
        naturalytelse: verdiEllerBlank(ytelse.naturalytelse) as z.infer<typeof NaturalytelseEnumSchema>,
        sluttdato: formatIsoDate(ytelse.sluttdato),
        verdiBeloep: verdiEllerNull(ytelse.verdiBeloep)
      }))
    : [];
}

function hentBestemmendeFraværsdag(
  harForespurtArbeidsgiverperiode: boolean,
  perioder: Periode[] | undefined,
  formatertePerioder: { fom: Date; tom: Date; id: string }[] | undefined,
  skjaeringstidspunkt: Date | undefined,
  arbeidsgiverKanFlytteSkjæringstidspunkt: boolean,
  inngangFraKvittering: boolean,
  bestemmendeFravaersdag: Date | undefined,
  beregnetSkjaeringstidspunkt: Date | undefined
) {
  if (!isValid(beregnetSkjaeringstidspunkt)) {
    beregnetSkjaeringstidspunkt = parseIsoDate(
      finnBestemmendeFravaersdag(perioder, undefined, undefined, arbeidsgiverKanFlytteSkjæringstidspunkt)
    );
  }

  if (harForespurtArbeidsgiverperiode) {
    return finnBestemmendeFravaersdag(
      perioder,
      formatertePerioder,
      skjaeringstidspunkt,
      arbeidsgiverKanFlytteSkjæringstidspunkt
    );
  } else {
    return inngangFraKvittering ? formatIsoDate(bestemmendeFravaersdag) : formatIsoDate(beregnetSkjaeringstidspunkt);
  }
}

function concatPerioder(sykmeldingsperioder: Periode[] | undefined, egenmeldingsperioder: Periode[] | undefined) {
  let perioder;
  if (sykmeldingsperioder) {
    perioder = sykmeldingsperioder.concat(egenmeldingsperioder ?? []);
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

function finnInnsendbareArbeidsgiverperioder<T extends TidPeriode>(
  arbeidsgiverperioder: T[] | undefined,
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

function verdiEllerBlank(verdi: string | undefined): string {
  return verdi ?? '';
}

function verdiEllerNull(verdi: number | undefined): number {
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
