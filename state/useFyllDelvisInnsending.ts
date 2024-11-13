import { isAfter } from 'date-fns';

import formatIsoDate from '../utils/formatIsoDate';
import useBoundStore from './useBoundStore';

import { TDateISODate } from './MottattData';
import valideringDelvisInnsendingSchema from '../schema/valideringDelvisInnsendingSchema';
import { z } from 'zod';

import parseIsoDate from '../utils/parseIsoDate';
import { finnFoersteFravaersdag } from '../pages/endring/[slug]';
import fullInnsendingSchema from '../schema/fullInnsendingSchema';
import { RefusjonEndring } from '../validators/validerAapenInnsending';
import { formaterOpphørsdato, konverterRefusjonEndringer, verdiEllerBlank, verdiEllerNull } from './useFyllInnsending';
import { konverterEndringAarsakSchema } from '../schema/konverterEndringAarsakSchema';

import useSkjemadataForespurt from '../utils/useSkjemadataForespurt';
import { ForespurtData } from '../schema/endepunktHentForespoerselSchema';
import { NaturalytelseEnum } from '../schema/NaturalytelseEnum';
import { YesNo } from './state';

export default function useFyllDelvisInnsending(forespoerselId: string) {
  const { data: forespurtDataData } = useSkjemadataForespurt(forespoerselId, true) as {
    data: ForespurtData;
  };

  const naturalytelser = useBoundStore((state) => state.naturalytelser);

  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);
  const kvitteringData = useBoundStore((state) => state.kvitteringData);
  const inngangFraKvittering = useBoundStore((state) => state.inngangFraKvittering);

  const setForeslaattBestemmendeFravaersdag = useBoundStore((state) => state.setForeslaattBestemmendeFravaersdag);

  type SkjemaData = z.infer<typeof valideringDelvisInnsendingSchema>;
  type FullInnsending = z.infer<typeof fullInnsendingSchema>;
  type Naturalytelse = z.infer<typeof NaturalytelseEnum>;

  return (skjema: SkjemaData, forespoerselId: string): FullInnsending => {
    const foersteDag = forespurtDataData.fravaersperioder.toSorted((periodeA, periodeB) =>
      periodeA.fom > periodeB.fom ? 1 : -1
    )[0].fom;
    const beregnetBestemmendeFravaersdag = finnFoersteFravaersdag(
      parseIsoDate(foersteDag),
      inngangFraKvittering
        ? (forespurtDataData.bestemmendeFravaersdag as TDateISODate)
        : kvitteringData?.bestemmendeFravaersdag,
      inngangFraKvittering
        ? (forespurtDataData.eksternBestemmendeFravaersdag as TDateISODate)
        : kvitteringData?.eksternBestemmendeFravaersdag
    )!;

    // const fravaersperioder = forespurtDataData.fravaersperioder.map((periode) => ({
    //   fom: parseIsoDate(periode.fom),
    //   tom: parseIsoDate(periode.tom),
    //   id: periode.fom + periode.tom
    // }));

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

    const bestemmendeFraværsdag = inngangFraKvittering
      ? ((kvitteringData?.bestemmendeFraværsdag ?? kvitteringData?.inntekt?.inntektsdato) as TDateISODate)
      : ((forespurtDataData.bestemmendeFravaersdag as TDateISODate) ?? foersteDag);

    setForeslaattBestemmendeFravaersdag(parseIsoDate(bestemmendeFraværsdag));

    const endringAarsak =
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
              naturalytelse: verdiEllerBlank(ytelse.type) as Naturalytelse,
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
