import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import formatIsoDate from '../utils/formatIsoDate';
import { Begrunnelse, Periode } from './state';
import useBoundStore from './useBoundStore';
import validerAapenInnsending from '../validators/validerAapenInnsending';
import {
  SendtPeriode,
  formaterRedusertLoennIAgp,
  konverterPerioderFraMottattTilInterntFormat,
  konverterRefusjonEndringer,
  mapEgenmeldingsperioder,
  mapNaturalytelserToData
} from './useFyllInnsending';
import { konverterEndringAarsakSchema } from '../schema/konverterEndringAarsakSchema';
import { z } from 'zod';
import { hovedskjemaSchema } from '../schema/hovedskjemaSchema';
import { isValid } from 'date-fns/isValid';

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
  const bestemmendeFravaersdag = finnBestemmendeFravaersdag(
    perioder,
    formatertePerioder,
    skjaeringstidspunkt,
    arbeidsgiverKanFlytteSkjæringstidspunkt()
  );

  type SkjemaData = z.infer<typeof hovedskjemaSchema>;

  return (skjemaData: SkjemaData) => {
    const endringAarsakerParsed = skjemaData.inntekt?.endringAarsaker
      ? skjemaData.inntekt.endringAarsaker.map((endringAarsak) => konverterEndringAarsakSchema.parse(endringAarsak))
      : null;

    setEndringAarsaker(skjemaData.inntekt?.endringAarsaker);

    setBareNyMaanedsinntekt(skjemaData.inntekt?.beloep ?? 0);

    setInnsenderTelefon(skjemaData.avsenderTlf);

    initNaturalytelser(skjemaData.inntekt?.naturalytelser);

    const innsending = validerAapenInnsending({
      vedtaksperiodeId: vedtaksperiodeId,
      sykmeldtFnr: sykmeldt.fnr,
      avsender: {
        orgnr: avsender.orgnr!,
        tlf: skjemaData.avsenderTlf
      },
      sykmeldingsperioder: sykmeldingsperioder!
        .filter((periode) => periode.fom && periode.tom)
        .map((periode) => ({ fom: formatDateForSubmit(periode.fom), tom: formatDateForSubmit(periode.tom) })),
      agp: {
        perioder: arbeidsgiverperioder!.map((periode) => ({
          fom: formatDateForSubmit(periode.fom),
          tom: formatDateForSubmit(periode.tom)
        })),
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
      aarsakInnsending: skjemaData.aarsakInnsending
    });

    return innsending;
  };
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
