import formatIsoDate from '../utils/formatIsoDate';
import useBoundStore from './useBoundStore';

interface Bruttoinntekt {
  bekreftet: boolean;
  bruttoInntekt: number;
  endringaarsak?: string;
  manueltKorrigert: boolean;
}

interface SendtPeriode {
  fom: string;
  tom: string;
}

interface FullLonnIArbeidsgiverPerioden {
  utbetalerFullLønn: boolean;
  begrunnelse?: string;
}

interface HeleEllerdeler {
  utbetalerHeleEllerDeler: boolean;
  refusjonPrMnd?: number;
  opphørSisteDag?: string;
}

interface SendtNaturalytelse {
  type: string;
  bortfallsdato: string;
  verdi: number;
}

export interface InnsendingSkjema {
  identitetsnummer: string;
  orgnrUnderenhet: string;
  fraværsperioder: Array<SendtPeriode>;
  egenmeldingsperioder?: Array<SendtPeriode>;
  bruttoinntekt: Bruttoinntekt;
  fullLønnIArbeidsgiverPerioden: FullLonnIArbeidsgiverPerioden;
  heleEllerdeler: HeleEllerdeler;
  naturalytelser?: Array<SendtNaturalytelse>;
  bekreftOpplysninger: boolean;
  behandlingsdager?: Array<string>;
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

  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);

  setSkalViseFeilmeldinger(true);

  return (opplysningerBekreftet: boolean): InnsendingSkjema => {
    const skjemaData: InnsendingSkjema = {
      identitetsnummer: identitetsnummer!,
      orgnrUnderenhet: orgnrUnderenhet!,
      fraværsperioder: fravaersperioder!.map((periode) => ({
        fom: formatIsoDate(periode.fom),
        tom: formatIsoDate(periode.tom)
      })),
      egenmeldingsperioder: egenmeldingsperioder.map((periode) => ({
        fom: formatIsoDate(periode.fom),
        tom: formatIsoDate(periode.tom)
      })),
      bruttoinntekt: {
        bekreftet: bruttoinntekt.bekreftet || false,
        bruttoInntekt: bruttoinntekt.bruttoInntekt,
        manueltKorrigert: bruttoinntekt.manueltKorrigert || false,
        endringaarsak:
          bruttoinntekt.endringsaarsak && bruttoinntekt.endringsaarsak.length > 0
            ? bruttoinntekt.endringsaarsak
            : undefined
      },
      fullLønnIArbeidsgiverPerioden: {
        utbetalerFullLønn: fullLonnIArbeidsgiverPerioden?.status === 'Ja',
        begrunnelse: fullLonnIArbeidsgiverPerioden?.begrunnelse
      },
      heleEllerdeler: {
        utbetalerHeleEllerDeler: lonnISykefravaeret?.status === 'Ja',
        refusjonPrMnd: lonnISykefravaeret?.belop,
        opphørSisteDag: refusjonskravetOpphoerer?.opphorsdato
          ? formatIsoDate(refusjonskravetOpphoerer?.opphorsdato)
          : undefined
      },
      naturalytelser: naturalytelser?.map((ytelse) => ({
        type: ytelse.type || '',
        bortfallsdato: formatIsoDate(ytelse.bortfallsdato),
        verdi: ytelse.verdi || 0
      })),
      bekreftOpplysninger: opplysningerBekreftet,
      behandlingsdager: behandlingsdager?.map((dag) => formatIsoDate(dag))
    };

    return skjemaData;
  };
}
