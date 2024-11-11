import { isValid } from 'date-fns';
import { EndringsBeloep } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import formatIsoDate from '../utils/formatIsoDate';
import { Begrunnelse, Periode, YesNo } from './state';
import useBoundStore from './useBoundStore';
import validerAapenInnsending, { EndringAarsak, RefusjonEndring } from '../validators/validerAapenInnsending';
import { SendtPeriode, formaterRedusertLoennIAgp } from './useFyllInnsending';
import { konverterEndringAarsakSchema } from '../schema/konverterEndringAarsakSchema';
import parseIsoDate from '../utils/parseIsoDate';

export default function useFyllAapenInnsending() {
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);

  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const [identitetsnummer, orgnrUnderenhet] = useBoundStore((state) => [state.identitetsnummer, state.orgnrUnderenhet]);
  const [fullLonnIArbeidsgiverPerioden, refusjonskravetOpphoerer] = useBoundStore((state) => [
    state.fullLonnIArbeidsgiverPerioden,
    state.refusjonskravetOpphoerer
  ]);
  const naturalytelser = useBoundStore((state) => state.naturalytelser);

  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const innsenderTelefonNr = useBoundStore((state) => state.innsenderTelefonNr);
  const skjaeringstidspunkt = useBoundStore((state) => state.skjaeringstidspunkt);
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const vedtaksperiodeId = useBoundStore((state) => state.vedtaksperiodeId);

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
    const endringAarsak: EndringAarsak | undefined = bruttoinntekt.endringAarsak?.aarsak
      ? bruttoinntekt.endringAarsak
      : undefined;
    console.log('endringAarsak', endringAarsak);
    const endringAarsakParsed = endringAarsak ? konverterEndringAarsakSchema.parse(endringAarsak) : null;

    const innsending = validerAapenInnsending({
      vedtaksperiodeId: vedtaksperiodeId,
      sykmeldtFnr: identitetsnummer,
      avsender: {
        orgnr: orgnrUnderenhet!,
        tlf: innsenderTelefonNr!
      },
      sykmeldingsperioder: fravaersperioder!
        .filter((periode) => periode.fom && periode.tom)
        .map((periode) => ({ fom: formatDateForSubmit(periode!.fom!), tom: formatDateForSubmit(periode!.tom!) })),
      agp: {
        perioder: arbeidsgiverperioder!.map((periode) => ({
          fom: formatDateForSubmit(periode!.fom!),
          tom: formatDateForSubmit(periode!.tom!)
        })),
        egenmeldinger: egenmeldingsperioder
          ? egenmeldingsperioder
              .filter((periode) => periode.fom && periode.tom)
              .map((periode) => ({ fom: formatDateForSubmit(periode!.fom!), tom: formatDateForSubmit(periode!.tom!) }))
          : [],
        redusertLoennIAgp: formaterRedusertLoennIAgp(fullLonnIArbeidsgiverPerioden)
      },
      inntekt: {
        beloep: bruttoinntekt.bruttoInntekt!,
        inntektsdato: bestemmendeFravaersdag!, // Skjæringstidspunkt?
        naturalytelser: naturalytelser
          ? naturalytelser?.map((ytelse) => ({
              naturalytelse: ytelse.type,
              verdiBeloep: ytelse.verdi,
              sluttdato: formatDateForSubmit(ytelse.bortfallsdato)
            }))
          : [],
        endringAarsak: endringAarsakParsed ?? null
      },
      refusjon:
        lonnISykefravaeret?.status === 'Ja'
          ? {
              beloepPerMaaned: lonnISykefravaeret.beloep!,
              sluttdato: refusjonskravetOpphoerer?.opphoersdato
                ? formatDateForSubmit(refusjonskravetOpphoerer?.opphoersdato)
                : null,
              endringer: konverterRefusjonEndringer(harRefusjonEndringer, refusjonEndringer)
            }
          : null,
      aarsakInnsending: skjemaData.aarsakInnsending
    });

    return innsending;
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

function konverterPerioderFraMottattTilInterntFormat(innsendbarArbeidsgiverperioder: SendtPeriode[] | undefined) {
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
  refusjonEndringer: Array<EndringsBeloep> | undefined
): RefusjonEndring[] | undefined {
  const refusjoner: RefusjonEndring[] | undefined =
    harRefusjonEndringer === 'Ja' && refusjonEndringer
      ? refusjonEndringer.map((endring) => ({
          beloep: endring.beloep!,
          startdato: formatDateForSubmit(endring.dato!)
        }))
      : undefined;

  if (refusjoner && refusjoner.length > 0) {
    return refusjoner;
  } else {
    return [];
  }
}

export function skalSendeArbeidsgiverperiode(begrunnelse?: Begrunnelse, perioder?: Periode[]): boolean {
  if (begrunnelse && (!perioder || perioder.filter((periode) => periode.fom && periode.tom).length === 0)) {
    return false;
  }
  return true;
}

function formatDateForSubmit(date?: Date | string): string {
  if (date instanceof Date) {
    return formatIsoDate(date);
  }

  return date ?? '';
}
