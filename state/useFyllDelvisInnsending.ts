import { isAfter, isValid } from 'date-fns';

import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import formatIsoDate from '../utils/formatIsoDate';
import { Periode, YesNo } from './state';
import useBoundStore from './useBoundStore';
import skjemaVariant from '../config/skjemavariant';

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
import isValidUUID from '../utils/isValidUUID';
import useSkjemadataForespurt from '../utils/useSkjemadataForespurt';
import { ForespurtData } from '../schema/endepunktHentForespoerselSchema';
// import paakrevdOpplysningstyper from '../utils/paakrevdeOpplysninger';

export default function useFyllDelvisInnsending(forespoerselId: string) {
  // if (!isValidUUID(forespoerselId)) {
  //   throw new Error('Ugyldig forespørselId -' + forespoerselId + '-');
  // }

  const {
    data: forespurtDataData,
    error: forespurtDataError,
    isLoading: forespurtDataIsLoading
  } = useSkjemadataForespurt(forespoerselId, true) as {
    data: ForespurtData;
    error: any;
    isLoading: boolean;
  };

  // const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  // const [fullLonnIArbeidsgiverPerioden] = useBoundStore((state) => [state.fullLonnIArbeidsgiverPerioden]);
  const naturalytelser = useBoundStore((state) => state.naturalytelser);

  // const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  // const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  // const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  // const skjaeringstidspunkt = useBoundStore((state) => state.skjaeringstidspunkt);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  // const arbeidsgiverKanFlytteSkjæringstidspunkt = useBoundStore(
  //   (state) => state.arbeidsgiverKanFlytteSkjæringstidspunkt
  // );
  // const [bestemmendeFravaersdag, mottattBestemmendeFravaersdag, mottattEksternBestemmendeFravaersdag] = useBoundStore(
  //   (state) => [
  //     state.bestemmendeFravaersdag,
  //     state.mottattBestemmendeFravaersdag,
  //     state.mottattEksternBestemmendeFravaersdag
  //   ]
  // );
  const setForeslaattBestemmendeFravaersdag = useBoundStore((state) => state.setForeslaattBestemmendeFravaersdag);

  const beregnetBestemmendeFravaersdag = finnFoersteFravaersdag(
    undefined,
    forespurtDataData.bestemmendeFravaersdag as TDateISODate,
    forespurtDataData.eksternBestemmendeFravaersdag as TDateISODate
  )!;

  type SkjemaData = z.infer<typeof valideringDelvisInnsendingSchema>;
  type FullInnsending = z.infer<typeof fullInnsendingSchema>;

  return (skjema: SkjemaData, forespoerselId: string): FullInnsending => {
    // const harEgenmeldingsdager = sjekkOmViHarEgenmeldingsdager(egenmeldingsperioder);
    const fravaersperioder = forespurtDataData.fravaersperioder.map((periode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom),
      id: periode.fom + periode.tom
    }));

    console.log('useFyllDelvisInnsending', fravaersperioder);

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

    const harRefusjonEndringer =
      RefusjonUtbetalingEndringUtenGammelBFD && RefusjonUtbetalingEndringUtenGammelBFD.length > 0;

    const harRefusjonEndringerTilInnsending =
      skjema.refusjon.erDetEndringRefusjon === 'Nei'
        ? harRefusjonEndringer
        : skjema.refusjon.erDetEndringRefusjon === 'Ja';

    const innsendingRefusjonEndringer: Array<RefusjonEndring> | undefined = konverterRefusjonEndringer(
      harRefusjonEndringerTilInnsending ? 'Ja' : 'Nei',
      RefusjonUtbetalingEndringUtenGammelBFD
    );

    setSkalViseFeilmeldinger(true);

    // const forespurtData = paakrevdOpplysningstyper(forespurtDataData?.forespurtData);

    // const skalSendeArbeidsgiverperiode = forespurtData.includes(skjemaVariant.arbeidsgiverperiode);
    // const skalSendeNaturalytelser = forespurtData.includes(skjemaVariant.arbeidsgiverperiode);

    // const perioder = concatPerioder(fravaersperioder, egenmeldingsperioder);

    // const innsendbarArbeidsgiverperioder: Array<SendtPeriode> | [] = finnInnsendbareArbeidsgiverperioder(
    //   arbeidsgiverperioder,
    //   skalSendeArbeidsgiverperiode
    // );

    // const formatertePerioder = konverterPerioderFraMottattTilInterntFormat(innsendbarArbeidsgiverperioder);

    const beregnetSkjaeringstidspunkt = undefined;
    // skjaeringstidspunkt && isValid(skjaeringstidspunkt)
    //   ? skjaeringstidspunkt
    //   : parseIsoDate(
    //       finnBestemmendeFravaersdag(
    //         perioder,
    //         formatertePerioder,
    //         skjaeringstidspunkt,
    //         arbeidsgiverKanFlytteSkjæringstidspunkt()
    //       )!
    //     );

    const bestemmendeFraværsdagTilInnsending = finnFoersteFravaersdag(
      beregnetSkjaeringstidspunkt,
      forespurtDataData.bestemmendeFravaersdag,
      forespurtDataData.eksternBestemmendeFravaersdag
    );

    const bestemmendeFraværsdag = formatIsoDate(bestemmendeFraværsdagTilInnsending);

    setForeslaattBestemmendeFravaersdag(bestemmendeFraværsdagTilInnsending);

    const endringAarsak: EndringAarsak | null =
      skjema.inntekt.endringAarsak?.aarsak && skjema.inntekt.endringAarsak?.aarsak !== 'SammeSomSist'
        ? skjema.inntekt.endringAarsak
        : null;

    const endringAarsakParsed = endringAarsak ? konverterEndringAarsakSchema.parse(endringAarsak) : null;

    const skjemaData: FullInnsending = {
      forespoerselId,
      agp: null,
      inntekt: {
        beloep: skjema.inntekt.beloep!,
        inntektsdato: bestemmendeFraværsdag!,
        naturalytelser: naturalytelser
          ? naturalytelser?.map((ytelse) => ({
              naturalytelse: verdiEllerBlank(ytelse.type),
              sluttdato: formatIsoDate(ytelse.bortfallsdato) as string,
              verdiBeloep: verdiEllerNull(ytelse.verdi)
            }))
          : [],
        endringAarsak: endringAarsakParsed
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

// function concatPerioder(fravaersperioder: Periode[] | undefined, egenmeldingsperioder: Periode[] | undefined) {
//   let perioder;
//   if (fravaersperioder) {
//     perioder = fravaersperioder.concat(egenmeldingsperioder ?? []);
//   } else {
//     perioder = egenmeldingsperioder;
//   }
//   return perioder;
// }

// function finnInnsendbareArbeidsgiverperioder(
//   arbeidsgiverperioder: Periode[] | undefined,
//   skalSendeArbeidsgiverperiode: boolean
// ): SendtPeriode[] | [] {
//   if (!skalSendeArbeidsgiverperiode) {
//     return [];
//   }

//   return arbeidsgiverperioder && arbeidsgiverperioder.length > 0
//     ? arbeidsgiverperioder
//         ?.filter((periode) => (periode.fom && isValid(periode.fom)) || (periode.tom && isValid(periode.tom)))
//         .map((periode) => ({ fom: formatIsoDate(periode.fom), tom: formatIsoDate(periode.tom) }))
//     : [];
// }

// function sjekkOmViHarEgenmeldingsdager(egenmeldingsperioder: Array<Periode> | undefined) {
//   return (
//     egenmeldingsperioder &&
//     (egenmeldingsperioder.length > 1 || (egenmeldingsperioder[0]?.fom && egenmeldingsperioder[0]?.tom))
//   );
// }
