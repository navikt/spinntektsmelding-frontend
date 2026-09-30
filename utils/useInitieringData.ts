import { useMemo } from 'react';
import type { UseFormSetError } from 'react-hook-form';
import { EndepunktArbeidsforholdSchema } from '../schema/EndepunktArbeidsforholdSchema';
import {
  EndepunktSykepengesoeknaderSchema,
  type EndepunktSykepengesoeknader,
  type Forespoersel
} from '../schema/EndepunktSykepengesoeknaderSchema';
import useArbeidsforhold from './useArbeidsforhold';
import useSykepengesoeknader from './useSykepengesoeknader';

export type SykepengePeriode = {
  id: string;
  fom: Date;
  tom: Date;
  forespoerselId?: string;
  forlengerVedtaksperiodeId?: string;
  egenmeldingsperioder?: {
    fom: Date;
    tom: Date;
  }[];
};

function getForespoerselId(forespoersler: Forespoersel[], fom: string): string | undefined {
  return forespoersler.find((forespoersel) => forespoersel.sykmeldingsperioder.some((periode) => periode.fom === fom))
    ?.forespoerselId;
}

function mapArbeidsforhold(data: unknown, hasError: boolean) {
  const parsed = EndepunktArbeidsforholdSchema.safeParse(data);
  if (!parsed.success || hasError) {
    return { arbeidsforhold: [], fulltNavn: '', orgnrUnderenhet: undefined, orgNavnMangler: false };
  }

  const arbeidsforhold = parsed.data.underenheter.flatMap((arbeidsgiver) => {
    if (!arbeidsgiver) {
      return [];
    }
    return [{ orgnrUnderenhet: arbeidsgiver.orgnrUnderenhet, virksomhetsnavn: arbeidsgiver.virksomhetsnavn }];
  });

  return {
    arbeidsforhold,
    fulltNavn: parsed.data.fulltNavn,
    orgnrUnderenhet: parsed.data.underenheter.length === 1 ? parsed.data.underenheter[0]?.orgnrUnderenhet : undefined,
    orgNavnMangler: parsed.data.underenheter.some((arbeidsgiver) => arbeidsgiver?.orgnrUnderenhet === null)
  };
}

function mapSykepengePerioder(data: EndepunktSykepengesoeknader | undefined): SykepengePeriode[] {
  if (!data) {
    return [];
  }

  return data.soeknaderArbeidstaker.map((periode) => ({
    fom: new Date(periode.sykmeldingsperiode.fom),
    tom: new Date(periode.sykmeldingsperiode.tom),
    id: periode.vedtaksperiodeId,
    forespoerselId: getForespoerselId(data.forespoersler, periode.sykmeldingsperiode.fom),
    forlengerVedtaksperiodeId: periode.forlengerVedtaksperiodeId ?? undefined,
    egenmeldingsperioder: periode.egenmeldingsperioder.map((egenmeldingsperiode) => ({
      fom: new Date(egenmeldingsperiode.fom),
      tom: new Date(egenmeldingsperiode.tom)
    }))
  }));
}

export default function useInitieringData(
  identitetsnummer: string | undefined,
  valgtOrganisasjonsnummer: string | undefined,
  setError: UseFormSetError<any>,
  ignorerSjekkArbeidsforhold?: boolean
) {
  const arbeidsforholdResponse = useArbeidsforhold(identitetsnummer, setError);
  const arbeidsforholdData = useMemo(
    () => mapArbeidsforhold(arbeidsforholdResponse.data, !!arbeidsforholdResponse.error),
    [arbeidsforholdResponse.data, arbeidsforholdResponse.error]
  );
  const organisasjonsnummer = valgtOrganisasjonsnummer ?? arbeidsforholdData.orgnrUnderenhet;
  const sykepengesoeknaderResponse = useSykepengesoeknader(
    identitetsnummer,
    organisasjonsnummer ?? '',
    ignorerSjekkArbeidsforhold ? undefined : setError
  );
  const spData = sykepengesoeknaderResponse.data;
  const parsedSpData = useMemo(() => {
    const parsed = EndepunktSykepengesoeknaderSchema.safeParse(spData);
    return parsed.success ? parsed.data : undefined;
  }, [spData]);
  const sykepengePerioder = useMemo(() => mapSykepengePerioder(parsedSpData), [parsedSpData]);

  return {
    ...arbeidsforholdResponse,
    ...arbeidsforholdData,
    organisasjonsnummer,
    spData,
    spError: sykepengesoeknaderResponse.error,
    spIsLoading: sykepengesoeknaderResponse.isLoading,
    forespoersler: parsedSpData?.forespoersler ?? [],
    soeknaderArbeidstaker: parsedSpData?.soeknaderArbeidstaker ?? [],
    sykepengePerioder
  };
}
