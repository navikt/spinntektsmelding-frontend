import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import formatIsoDate from '../utils/formatIsoDate';
import { Begrunnelse, Periode } from './state';
import useBoundStore from './useBoundStore';
import validerAapenInnsending from '../validators/validerAapenInnsending';
import {
  SendtPeriode,
  concatPerioder,
  finnInnsendbareArbeidsgiverperioder,
  formaterRedusertLoennIAgp,
  konverterPerioderFraMottattTilInterntFormat,
  konverterRefusjonEndringer,
  mapEgenmeldingsperioder,
  mapNaturalytelserToData
} from './useFyllInnsending';
import { KonverterEndringAarsakSchema } from '../schema/KonverterEndringAarsakSchema';
import { z } from 'zod/v4';
import { HovedskjemaSchema } from '../schema/HovedskjemaSchema';
import isValidUUID from '../utils/isValidUUID';
import { TypeArbeidsforholdSchema } from '../schema/TypeArbeidsforholdSchema';

export default function useFyllAapenInnsending() {
  const sykmeldingsperioder = useBoundStore((state) => state.sykmeldingsperioder);

  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const [sykmeldt, avsender] = useBoundStore((state) => [state.sykmeldt, state.avsender]);
  const [fullLonnIArbeidsgiverPerioden, setInnsenderTelefon, initNaturalytelser] = useBoundStore((state) => [
    state.fullLonnIArbeidsgiverPerioden,
    state.setInnsenderTelefon,
    state.initNaturalytelser
  ]);

  const arbeidsgiverperioder = useBoundStore((state) => state.arbeidsgiverperioder);
  const arbeidsgiverperiodeDisabled = useBoundStore((state) => state.arbeidsgiverperiodeDisabled);
  const harRefusjonEndringer = useBoundStore((state) => state.harRefusjonEndringer);
  const refusjonEndringer = useBoundStore((state) => state.refusjonEndringer);
  const skjaeringstidspunkt = useBoundStore((state) => state.skjaeringstidspunkt);
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const vedtaksperiodeId = useBoundStore((state) => state.vedtaksperiodeId);
  const [setEndringAarsaker, setBareNyMaanedsinntekt] = useBoundStore((state) => [
    state.setEndringAarsaker,
    state.setBareNyMaanedsinntekt
  ]);

  const arbeidsgiverKanFlytteSkjæringstidspunkt = useBoundStore(
    (state) => state.arbeidsgiverKanFlytteSkjæringstidspunkt
  );

  const perioder = concatPerioder(sykmeldingsperioder, egenmeldingsperioder);
  const innsendbarArbeidsgiverperioder: Array<SendtPeriode> | [] = finnInnsendbareArbeidsgiverperioder(
    arbeidsgiverperioder,
    true
  );
  const formatertePerioder = konverterPerioderFraMottattTilInterntFormat(innsendbarArbeidsgiverperioder);

  type SkjemaData = z.infer<typeof HovedskjemaSchema>;
  type ArbeidsforholdType = z.infer<typeof TypeArbeidsforholdSchema>;

  return (
    skjemaData: SkjemaData,
    arbeidsforhold: string,
    selvbestemtType: 'MedArbeidsforhold' | 'UtenArbeidsforhold' | 'Fisker' | 'Behandlingsdager'
  ) => {
    const bestemmendeFravaersdag =
      perioder && perioder.length > 0
        ? finnBestemmendeFravaersdag(
            perioder,
            formatertePerioder,
            skjaeringstidspunkt,
            arbeidsgiverKanFlytteSkjæringstidspunkt()
          )
        : undefined;

    const endringAarsakerParsed = skjemaData.inntekt?.endringAarsaker
      ? skjemaData.inntekt.endringAarsaker.map((endringAarsak) => KonverterEndringAarsakSchema.parse(endringAarsak))
      : null;

    setEndringAarsaker(skjemaData.inntekt?.endringAarsaker);

    setBareNyMaanedsinntekt(skjemaData.inntekt?.beloep ?? 0);

    setInnsenderTelefon(skjemaData.avsenderTlf);

    initNaturalytelser(skjemaData.inntekt?.naturalytelser);

    const formattedAgpPerioder = getFormattedAgpPerioder(arbeidsgiverperiodeDisabled, arbeidsgiverperioder);

    let arbeidsforholdType: ArbeidsforholdType = {
      type: 'MedArbeidsforhold',
      vedtaksperiodeId: isValidUUID(vedtaksperiodeId) ? vedtaksperiodeId! : ''
    };
    if (selvbestemtType === 'UtenArbeidsforhold') {
      arbeidsforholdType = { type: 'UtenArbeidsforhold' };
    } else if (selvbestemtType === 'Fisker') {
      arbeidsforholdType = { type: 'Fisker' };
    } else if (selvbestemtType === 'Behandlingsdager') {
      arbeidsforholdType = { type: 'Behandlingsdager' };
    }

    const innsending = validerAapenInnsending({
      sykmeldtFnr: sykmeldt.fnr,
      avsender: {
        orgnr: avsender.orgnr!,
        tlf: skjemaData.avsenderTlf
      },
      sykmeldingsperioder: sykmeldingsperioder!
        .filter((periode) => periode.fom && periode.tom)
        .map((periode) => ({ fom: formatDateForSubmit(periode.fom), tom: formatDateForSubmit(periode.tom) })),
      agp: {
        perioder: formattedAgpPerioder,
        egenmeldinger: mapEgenmeldingsperioder(egenmeldingsperioder),
        redusertLoennIAgp: formaterRedusertLoennIAgp(fullLonnIArbeidsgiverPerioden)
      },
      inntekt: {
        beloep: skjemaData.inntekt?.beloep ?? 0,
        inntektsdato: bestemmendeFravaersdag!, // Skjæringstidspunkt?
        naturalytelser: mapNaturalytelserToData(skjemaData.inntekt?.naturalytelser),
        endringAarsaker: endringAarsakerParsed ?? []
      },
      refusjon:
        lonnISykefravaeret?.status === 'Ja'
          ? {
              beloepPerMaaned: lonnISykefravaeret.beloep!,
              sluttdato: null,
              endringer: konverterRefusjonEndringer(harRefusjonEndringer, refusjonEndringer)
            }
          : null,
      aarsakInnsending: skjemaData.aarsakInnsending,
      arbeidsforholdType: arbeidsforholdType
    });

    return innsending;
  };
}

function getFormattedAgpPerioder(arbeidsgiverperiodeDisabled: boolean, arbeidsgiverperioder: Periode[] | undefined) {
  return arbeidsgiverperiodeDisabled
    ? []
    : (arbeidsgiverperioder ?? []).map((periode) => ({
        fom: formatDateForSubmit(periode.fom),
        tom: formatDateForSubmit(periode.tom)
      }));
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
