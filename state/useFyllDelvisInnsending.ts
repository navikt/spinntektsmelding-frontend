import { isAfter, isValid } from 'date-fns';

import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import formatIsoDate from '../utils/formatIsoDate';
import { Periode, YesNo } from './state';
import useBoundStore from './useBoundStore';
import forespoerselType from '../config/forespoerselType';

import { TDateISODate } from './MottattData';
import valideringDelvisInnsendingSchema from '../schema/valideringDelvisInnsendingSchema';
import { z } from 'zod';

import parseIsoDate from '../utils/parseIsoDate';
import { finnFoersteFravaersdag } from '../pages/endring/[slug]';
import fullInnsendingSchema from '../schema/fullInnsendingSchema';
import { EndringAarsak, RefusjonEndring } from '../validators/validerAapenInnsending';
import {
  formaterOpphørsdato,
  konverterPerioderFraMottattTilInterntFormat,
  konverterRefusjonEndringer,
  verdiEllerBlank,
  verdiEllerNull,
  formaterRedusertLoennIAgp,
  SendtPeriode
} from './useFyllInnsending';
import { konverterEndringAarsakSchema } from '../schema/konverterEndringAarsakSchema';

export default function useFyllDelvisInnsending() {
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);

  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const [fullLonnIArbeidsgiverPerioden] = useBoundStore((state) => [state.fullLonnIArbeidsgiverPerioden]);
  const naturalytelser = useBoundStore((state) => state.naturalytelser);

  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const skjaeringstidspunkt = useBoundStore((state) => state.skjaeringstidspunkt);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
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

  type SkjemaData = z.infer<typeof valideringDelvisInnsendingSchema>;
  type FullInnsending = z.infer<typeof fullInnsendingSchema>;

  return (skjema: SkjemaData, forespoerselId: string): FullInnsending => {
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

    const innsendingRefusjonEndringer: Array<RefusjonEndring> | undefined = konverterRefusjonEndringer(
      harRefusjonEndringerTilInnsending ? 'Ja' : 'Nei',
      RefusjonUtbetalingEndringUtenGammelBFD
    );

    setSkalViseFeilmeldinger(true);

    const forespurtData = hentPaakrevdOpplysningstyper();

    const skalSendeArbeidsgiverperiode = forespurtData.includes(forespoerselType.arbeidsgiverperiode);

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
            )
          );

    const bestemmendeFraværsdagTilInnsending = finnFoersteFravaersdag(
      beregnetSkjaeringstidspunkt,
      mottattBestemmendeFravaersdag,
      mottattEksternBestemmendeFravaersdag
    );

    const bestemmendeFraværsdag = formatIsoDate(bestemmendeFraværsdagTilInnsending);

    setForeslaattBestemmendeFravaersdag(bestemmendeFraværsdagTilInnsending);

    const endringAarsak: EndringAarsak | null =
      skjema.inntekt.endringAarsak?.aarsak && skjema.inntekt.endringAarsak?.aarsak !== 'SammeSomSist'
        ? skjema.inntekt.endringAarsak
        : null;

    const endringAarsakParsed = endringAarsak ? konverterEndringAarsakSchema.parse(endringAarsak) : null;
    const endringsaarsakerParsed = skjema.inntekt?.endringsaarsaker
      ? skjema.inntekt?.endringsaarsaker.map((endringAarsak) => {
          return konverterEndringAarsakSchema.parse(endringAarsak);
        })
      : null;
    const skjemaData: FullInnsending = {
      forespoerselId,
      agp: skalSendeArbeidsgiverperiode
        ? {
            perioder: innsendbarArbeidsgiverperioder,
            egenmeldinger: harEgenmeldingsdager
              ? egenmeldingsperioder!.map((periode) => ({
                  fom: formatIsoDate(periode.fom) as TDateISODate,
                  tom: formatIsoDate(periode.tom) as TDateISODate
                }))
              : [],
            redusertLoennIAgp: formaterRedusertLoennIAgp(fullLonnIArbeidsgiverPerioden)
          }
        : null,
      inntekt: {
        beloep: skjema.inntekt.beloep!,
        inntektsdato: bestemmendeFraværsdag,
        naturalytelser: naturalytelser
          ? naturalytelser?.map((ytelse) => ({
              naturalytelse: verdiEllerBlank(ytelse.type),
              sluttdato: formatIsoDate(ytelse.bortfallsdato) as string,
              verdiBeloep: verdiEllerNull(ytelse.verdi)
            }))
          : [],
        endringAarsak: endringAarsakParsed,
        endringsaarsaker: endringsaarsakerParsed
      },
      refusjon:
        skjema.refusjon.kreverRefusjon === 'Ja'
          ? {
              beloepPerMaaned: skjema.refusjon.refusjonPrMnd ?? 0,
              sluttdato: formaterOpphørsdato(
                skjema.refusjon.kravetOpphoerer as YesNo,
                skjema.refusjon.refusjonOpphoerer
              ),

              endringer: harRefusjonEndringerTilInnsending ? innsendingRefusjonEndringer : []
            }
          : null,
      avsenderTlf: skjema.telefon || ''
    };

    return skjemaData;
  };
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

export function finnInnsendbareArbeidsgiverperioder(
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

function sjekkOmViHarEgenmeldingsdager(egenmeldingsperioder: Array<Periode> | undefined) {
  return (
    egenmeldingsperioder &&
    (egenmeldingsperioder.length > 1 || (egenmeldingsperioder[0]?.fom && egenmeldingsperioder[0]?.tom))
  );
}
