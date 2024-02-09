import { isValid, parseISO } from 'date-fns';
import { EndringsBelop } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import formatIsoDate from '../utils/formatIsoDate';
import { Periode, YesNo } from './state';
import useBoundStore from './useBoundStore';
import validerAapenInnsending, {
  EndringAarsak,
  InntektEndringAarsakEnum,
  RefusjonEndring
} from '../validators/validerAapenInnsending';
import { SendtPeriode } from './useFyllInnsending';

export default function useFyllInnsending() {
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);

  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const [identitetsnummer, orgnrUnderenhet] = useBoundStore((state) => [state.identitetsnummer, state.orgnrUnderenhet]);
  const [fullLonnIArbeidsgiverPerioden, refusjonskravetOpphoerer] = useBoundStore((state) => [
    state.fullLonnIArbeidsgiverPerioden,
    state.refusjonskravetOpphoerer
  ]);
  const naturalytelser = useBoundStore((state) => state.naturalytelser);
  const [tariffendringDato, tariffkjentdato] = useBoundStore((state) => [
    state.tariffendringDato,
    state.tariffkjentdato
  ]);
  const ferie = useBoundStore((state) => state.ferie);
  const lonnsendringsdato = useBoundStore((state) => state.lonnsendringsdato);
  const permisjon = useBoundStore((state) => state.permisjon);
  const permittering = useBoundStore((state) => state.permittering);
  const nystillingdato = useBoundStore((state) => state.nystillingdato);
  const nystillingsprosentdato = useBoundStore((state) => state.nystillingsprosentdato);
  const sykefravaerperioder = useBoundStore((state) => state.sykefravaerperioder);

  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const innsenderTelefonNr = useBoundStore((state) => state.innsenderTelefonNr);
  const skjaeringstidspunkt = useBoundStore((state) => state.skjaeringstidspunkt);
  const arbeidsgiverKanFlytteSkjæringstidspunkt = useBoundStore(
    (state) => state.arbeidsgiverKanFlytteSkjæringstidspunkt
  );

  const perioder = concatPerioder(fravaersperioder, egenmeldingsperioder);
  const innsendbarArbeidsgiverperioder: Array<SendtPeriode> | [] = finnInnsendbareArbeidsgiverperioder(
    arbeidsgiverperioder,
    true
  );
  const formatertePerioder = konverterPerioderFraMottattTilInterntFormat(innsendbarArbeidsgiverperioder);
  const bestemmendeFravaersdag = finnBestemmendeFravaersdag(
    perioder,
    formatertePerioder,
    skjaeringstidspunkt,
    arbeidsgiverKanFlytteSkjæringstidspunkt()
  );
  return (skjemaData: any) => {
    const endringAarsak: EndringAarsak = fyllEndringaarsak(bruttoinntekt, {
      ferie,
      nystillingdato,
      nystillingsprosentdato,
      permisjon,
      permittering,
      tariffendringDato,
      tariffkjentdato,
      lonnsendringsdato,
      sykefravaerperioder
    });

    const innsending = validerAapenInnsending({
      sykmeldtFnr: identitetsnummer,
      avsender: {
        orgnr: orgnrUnderenhet!,
        tlf: innsenderTelefonNr!
      },
      sykmeldingsperioder: fravaersperioder!
        .filter((periode) => periode.fom && periode.tom)
        .map((periode) => ({ fom: periode!.fom!, tom: periode!.tom! })),
      agp: {
        perioder: arbeidsgiverperioder!.map((periode) => ({ fom: periode!.fom!, tom: periode!.tom! })),
        egenmeldinger: egenmeldingsperioder
          ? egenmeldingsperioder
              .filter((periode) => periode.fom && periode.tom)
              .map((periode) => ({ fom: periode!.fom!, tom: periode!.tom! }))
          : [],
        redusertLoennIAgp:
          fullLonnIArbeidsgiverPerioden?.status === 'Nei'
            ? {
                beloep: fullLonnIArbeidsgiverPerioden?.utbetalt,
                begrunnelse: fullLonnIArbeidsgiverPerioden?.begrunnelse
              }
            : undefined
      },
      inntekt: {
        beloep: bruttoinntekt.bruttoInntekt!,
        inntektsdato: bestemmendeFravaersdag!, // Skjæringstidspunkt?
        naturalytelser: naturalytelser
          ? naturalytelser?.map((ytelse) => ({
              naturalytelse: ytelse.type,
              verdiBeloep: ytelse.verdi,
              sluttdato: ytelse.bortfallsdato
            }))
          : [],
        endringAarsak: endringAarsak
      },
      refusjon: {
        beloepPerMaaned: bruttoinntekt.bruttoInntekt!,
        sluttdato: refusjonskravetOpphoerer?.opphoersdato ?? null,
        endringer: konverterRefusjonEndringer(harRefusjonEndringer, refusjonEndringer)
      },
      aarsakInnsending: 'Ny'
    });

    return innsending;
  };
}

function fyllEndringaarsak(bruttoinntekt: Inntekt, parametere) {
  switch (bruttoinntekt.endringsaarsak) {
    case InntektEndringAarsakEnum.enum.Bonus:
      return {
        aarsak: 'Bonus'
      };

    case InntektEndringAarsakEnum.enum.Feilregistrert:
      return {
        aarsak: 'Feilregistrert'
      };

    case InntektEndringAarsakEnum.enum.Ferie:
      return {
        aarsak: 'Ferie',
        perioder: parametere.ferie?.map((periode) => ({
          fom: periode.fom,
          tom: periode.tom
        }))
      };

    case InntektEndringAarsakEnum.enum.Ferietrekk:
      return {
        aarsak: 'Ferietrekk'
      };

    case InntektEndringAarsakEnum.enum.Nyansatt:
      return {
        aarsak: 'Nyansatt'
      };

    case InntektEndringAarsakEnum.enum.NyStilling:
      return {
        aarsak: 'NyStilling',
        gjelderFra: parametere.nystillingdato
      };

    case InntektEndringAarsakEnum.enum.NyStillingsprosent:
      return {
        aarsak: 'NyStillingsprosent',
        gjelderFra: parametere.nystillingsprosentdato
      };

    case InntektEndringAarsakEnum.enum.Permisjon:
      return {
        aarsak: 'Permisjon',
        perioder: parametere.permisjon?.map((periode) => ({
          fom: periode.fom,
          tom: periode.tom
        }))
      };

    case InntektEndringAarsakEnum.enum.Permittering:
      return {
        aarsak: 'Permittering',
        perioder: parametere.permittering?.map((periode) => ({
          fom: periode.fom,
          tom: periode.tom
        }))
      };

    case InntektEndringAarsakEnum.enum.Sykefravaer:
      return {
        aarsak: 'Sykefravaer',
        perioder: parametere.sykefravaerperioder?.map((periode) => ({
          fom: periode.fom,
          tom: periode.tom
        }))
      };

    case InntektEndringAarsakEnum.enum.Tariffendring:
      return {
        aarsak: 'Tariffendring',
        gjelderFra: parametere.tariffendringDato,
        bleKjent: parametere.tariffkjentdato
      };

    case InntektEndringAarsakEnum.enum.VarigLoennsendring:
      return {
        aarsak: 'VarigLoennsendring',
        gjelderFra: parametere.lonnsendringsdato
      };
  }
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

function konverterRefusjonEndringer(
  harRefusjonEndringer: YesNo | undefined,
  refusjonEndringer: Array<EndringsBelop> | undefined
): RefusjonEndring[] | undefined {
  const refusjoner =
    harRefusjonEndringer === 'Ja' && refusjonEndringer
      ? refusjonEndringer.map((endring) => ({
          beloep: endring.belop!,
          startDato: endring.dato!
        }))
      : undefined;

  if (refusjoner && refusjoner.length > 0) {
    return refusjoner;
  } else {
    return [];
  }
}
