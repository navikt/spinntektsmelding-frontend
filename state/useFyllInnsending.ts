import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import formatIsoDate from '../utils/formatIsoDate';
import useBoundStore from './useBoundStore';

interface Bruttoinntekt {
  bekreftet: boolean;
  beregnetInntekt: number;
  endringÅrsak?: string;
  manueltKorrigert: boolean;
}

interface SendtPeriode {
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
  bortfallsdato: string;
  beløp: number;
}

export interface InnsendingSkjema {
  identitetsnummer: string;
  orgnrUnderenhet: string;
  egenmeldingsperioder?: Array<SendtPeriode>;
  arbeidsgiverperioder: Array<SendtPeriode>;
  bestemmendeFraværsdag: string;
  fraværsperioder: Array<SendtPeriode>;
  inntekt: Bruttoinntekt;
  fullLønnIArbeidsgiverPerioden: FullLonnIArbeidsgiverPerioden;
  refusjon: Refusjon;
  naturalytelser?: Array<SendtNaturalytelse>;
  bekreftOpplysninger: boolean;
  behandlingsdager?: Array<string>;
  årsakInnsending: string;
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

  const behandlingsdager = useBoundStore((state) => state.behandlingsdager);

  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);

  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);

  const harEgenmeldingsdager =
    egenmeldingsperioder &&
    (egenmeldingsperioder.length > 1 || (egenmeldingsperioder[0].fom && egenmeldingsperioder[0].tom));

  const innsendingRefusjonEndringer: Array<RefusjonEndring> | undefined =
    harRefusjonEndringer && refusjonEndringer
      ? refusjonEndringer.map((endring) => ({
          beløp: endring.belop!,
          dato: formatIsoDate(endring.dato)!
        }))
      : undefined;

  return (opplysningerBekreftet: boolean): InnsendingSkjema => {
    setSkalViseFeilmeldinger(true);
    let perioder;
    if (fravaersperioder) {
      perioder = fravaersperioder.concat(egenmeldingsperioder);
    } else {
      perioder = egenmeldingsperioder;
    }

    const bestemmendeFraværsdag = finnBestemmendeFravaersdag(perioder);
    const arbeidsgiverperioder = finnArbeidsgiverperiode(perioder);

    const skjemaData: InnsendingSkjema = {
      orgnrUnderenhet: orgnrUnderenhet!,
      identitetsnummer: identitetsnummer!,
      egenmeldingsperioder: harEgenmeldingsdager
        ? egenmeldingsperioder.map((periode) => ({
            fom: formatIsoDate(periode.fom),
            tom: formatIsoDate(periode.tom)
          }))
        : [],
      fraværsperioder: fravaersperioder!.map((periode) => ({
        fom: formatIsoDate(periode.fom),
        tom: formatIsoDate(periode.tom)
      })),
      arbeidsgiverperioder: arbeidsgiverperioder.map((periode) => ({
        fom: formatIsoDate(periode.fom),
        tom: formatIsoDate(periode.tom)
      })),
      inntekt: {
        bekreftet: bruttoinntekt.bekreftet || false,
        beregnetInntekt: bruttoinntekt.bruttoInntekt,
        manueltKorrigert: bruttoinntekt.manueltKorrigert || false,
        endringÅrsak:
          bruttoinntekt.endringsaarsak && bruttoinntekt.endringsaarsak.length > 0
            ? bruttoinntekt.endringsaarsak
            : undefined
      },
      bestemmendeFraværsdag: bestemmendeFraværsdag!,
      fullLønnIArbeidsgiverPerioden: {
        utbetalerFullLønn: fullLonnIArbeidsgiverPerioden?.status === 'Ja',
        begrunnelse: fullLonnIArbeidsgiverPerioden?.begrunnelse,
        utbetalt: fullLonnIArbeidsgiverPerioden?.utbetalt
      },
      refusjon: {
        utbetalerHeleEllerDeler: lonnISykefravaeret?.status === 'Ja',
        refusjonPrMnd: lonnISykefravaeret?.belop,
        refusjonOpphører: refusjonskravetOpphoerer?.opphorsdato
          ? formatIsoDate(refusjonskravetOpphoerer?.opphorsdato)
          : undefined,
        refusjonEndringer: innsendingRefusjonEndringer
      },
      naturalytelser: naturalytelser?.map((ytelse) => ({
        naturalytelse: ytelse.type || '',
        bortfallsdato: formatIsoDate(ytelse.bortfallsdato),
        beløp: ytelse.verdi || 0
      })),
      bekreftOpplysninger: opplysningerBekreftet,
      behandlingsdager: behandlingsdager ? behandlingsdager.map((dag) => formatIsoDate(dag)) : [],
      årsakInnsending: 'Ny' // Kan også være Endring
    };

    return skjemaData;
  };
}
