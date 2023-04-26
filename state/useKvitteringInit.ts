import parseIsoDate from '../utils/parseIsoDate';
import { MottattNaturalytelse } from './MottattData';
import useBoundStore from './useBoundStore';
import { InnsendingSkjema } from './useFyllInnsending';
import fetchInntektsdata from '../utils/fetchInntektsdata';
import environment from '../config/environment';
import { logger } from '@navikt/next-logger';

export interface KvitteringSkjema extends InnsendingSkjema {
  fulltNavn: string;
  virksomhetNavn: string;
  innsenderNavn: string;
  innsenderTelefonNr: string;
  beregnetInntekt?: number;
  tidspunkt?: string;
}

export default function useKvitteringInit() {
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initBruttoinntekt = useBoundStore((state) => state.initBruttoinntekt);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const initPerson = useBoundStore((state) => state.initPerson);

  const setBestemmendeFravaersdag = useBoundStore((state) => state.setBestemmendeFravaersdag);
  const setNyMaanedsinntektBlanktSkjema = useBoundStore((state) => state.setNyMaanedsinntektBlanktSkjema);
  const initFullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.initFullLonnIArbeidsgiverPerioden);

  const setHarRefusjonEndringer = useBoundStore((state) => state.setHarRefusjonEndringer);
  const oppdaterRefusjonEndringer = useBoundStore((state) => state.oppdaterRefusjonEndringer);

  const initArbeidsgiverperioder = useBoundStore((state) => state.initArbeidsgiverperioder);
  const initLonnISykefravaeret = useBoundStore((state) => state.initLonnISykefravaeret);

  const refusjonskravetOpphoererDato = useBoundStore((state) => state.refusjonskravetOpphoererDato);
  const refusjonskravetOpphoererStatus = useBoundStore((state) => state.refusjonskravetOpphoererStatus);
  const initNaturalytelser = useBoundStore((state) => state.initNaturalytelser);
  const setSlug = useBoundStore((state) => state.setSlug);
  const setKvitteringInnsendt = useBoundStore((state) => state.setKvitteringInnsendt);

  return async (jsonData: KvitteringSkjema, slug: string) => {
    initFravaersperiode(jsonData.fraværsperioder);
    if (jsonData.egenmeldingsperioder) initEgenmeldingsperiode(jsonData.egenmeldingsperioder);

    initPerson(
      jsonData.fulltNavn,
      jsonData.identitetsnummer,
      jsonData.orgnrUnderenhet,
      jsonData.virksomhetNavn,
      jsonData.innsenderNavn,
      jsonData.innsenderTelefonNr
    );

    setSlug(slug);

    const bestemmendeFravaersdag = jsonData.bestemmendeFraværsdag;
    if (bestemmendeFravaersdag) setBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));

    const arbeidsgiverperiode = jsonData.arbeidsgiverperioder;
    if (arbeidsgiverperiode) initArbeidsgiverperioder(jsonData.arbeidsgiverperioder);

    const beregnetInntekt =
      jsonData.inntekt && jsonData.inntekt.beregnetInntekt
        ? jsonData.inntekt.beregnetInntekt
        : jsonData.beregnetInntekt || 0;

    if (bestemmendeFravaersdag) {
      setNyMaanedsinntektBlanktSkjema(beregnetInntekt.toString());
    }

    try {
      const inntektSisteTreMnd = await fetchInntektsdata(
        environment.inntektsdataUrl,
        slug,
        parseIsoDate(bestemmendeFravaersdag)
      );

      initBruttoinntekt(beregnetInntekt, inntektSisteTreMnd.tidligereInntekter, parseIsoDate(bestemmendeFravaersdag));
    } catch (error) {
      logger.warn('Feil ved henting av tidliger inntektsdata', error);
    }

    initLonnISykefravaeret({
      status: jsonData.refusjon.utbetalerHeleEllerDeler ? 'Ja' : 'Nei',
      belop: jsonData.refusjon.refusjonPrMnd
    });

    initFullLonnIArbeidsgiverPerioden({
      status: jsonData.fullLønnIArbeidsgiverPerioden.utbetalerFullLønn ? 'Ja' : 'Nei',
      begrunnelse: jsonData.fullLønnIArbeidsgiverPerioden.begrunnelse
        ? jsonData.fullLønnIArbeidsgiverPerioden.begrunnelse
        : undefined,
      utbetalt: jsonData.fullLønnIArbeidsgiverPerioden.utbetalt
        ? jsonData.fullLønnIArbeidsgiverPerioden.utbetalt
        : undefined
    });

    setHarRefusjonEndringer(
      jsonData.refusjon.refusjonEndringer && jsonData.refusjon.refusjonEndringer.length > 0 ? 'Ja' : 'Nei'
    );

    if (jsonData.refusjon.refusjonEndringer) {
      const endringer = jsonData.refusjon.refusjonEndringer.map((endring) => ({
        belop: endring.beløp,
        dato: parseIsoDate(endring.dato)
      }));
      oppdaterRefusjonEndringer(endringer);
    }

    if (jsonData.refusjon.refusjonOpphører) {
      refusjonskravetOpphoererDato(parseIsoDate(jsonData.refusjon.refusjonOpphører));
      refusjonskravetOpphoererStatus('Ja');
    } else {
      refusjonskravetOpphoererStatus('Nei');
    }

    if (jsonData.naturalytelser) {
      const ytelser: Array<MottattNaturalytelse> = jsonData.naturalytelser.map((ytelse) => ({
        type: ytelse.naturalytelse,
        bortfallsdato: ytelse.dato,
        verdi: ytelse.beløp
      }));

      initNaturalytelser(ytelser);
    }

    if (jsonData.tidspunkt) {
      setKvitteringInnsendt(jsonData.tidspunkt);
    }
  };
}
