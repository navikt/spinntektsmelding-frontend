import InntektsmeldingSkjema from './state';
import useArbeidsforholdStore from './useArbeidsforholdStore';
import useBehandlingsdagerStore from './useBehandlingsdagerStore';
import useBruttoinntektStore from './useBruttoinntektStore';
import useEgenmeldingStore from './useEgenmeldingStore';
import useFeilmeldingerStore from './useFeilmeldingerStore';
import useFravaersperiodeStore from './useFravaersperiodeStore';
import useNaturalytelserStore from './useNaturalytelserStore';
import usePersonStore from './usePersonStore';
import useRefusjonArbeidsgiverStore from './useRefusjonArbeidsgiverStore';

export default function useFyllInnsending() {
  const fravaersperiode = useFravaersperiodeStore((state) => state.fravaersperiode);
  const bruttoinntekt = useBruttoinntektStore((state) => state.bruttoinntekt);

  const egenmeldingsperioder = useEgenmeldingStore((state) => state.egenmeldingsperioder);
  const [navn, identitetsnummer, virksomhetsnavn, orgnrUnderenhet] = usePersonStore((state) => [
    state.navn,
    state.identitetsnummer,
    state.virksomhetsnavn,
    state.orgnrUnderenhet
  ]);
  const [fullLonnIArbeidsgiverPerioden, lonnISykefravaeret] = useRefusjonArbeidsgiverStore((state) => [
    state.fullLonnIArbeidsgiverPerioden,
    state.lonnISykefravaeret
  ]);
  const naturalytelser = useNaturalytelserStore((state) => state.naturalytelser);

  const [behandlingsperiode, behandlingsdager] = useBehandlingsdagerStore((state) => [
    state.behandlingsperiode,
    state.behandlingsdager
  ]);

  const setSkalViseFeilmeldinger = useFeilmeldingerStore((state) => state.setSkalViseFeilmeldinger);

  const arbeidsforhold = useArbeidsforholdStore((state) => state.arbeidsforhold);

  setSkalViseFeilmeldinger(true);

  return (opplysningerBekreftet: boolean): InntektsmeldingSkjema => {
    const skjemaData: InntektsmeldingSkjema = {
      navn: navn,
      identitetsnummer: identitetsnummer,
      virksomhetsnavn: virksomhetsnavn,
      orgnrUnderenhet: orgnrUnderenhet,
      fravaersperiode: fravaersperiode,
      egenmeldingsperioder: egenmeldingsperioder,
      bruttoinntekt: bruttoinntekt,
      fullLonnIArbeidsgiverPerioden: fullLonnIArbeidsgiverPerioden,
      lonnISykefravaeret: lonnISykefravaeret,
      naturalytelser: naturalytelser,
      opplysningerBekreftet: opplysningerBekreftet,
      behandlingsdager: behandlingsdager,
      behandlingsperiode: behandlingsperiode,
      sammeFravaersperiode: false,
      arbeidsforhold: arbeidsforhold
    };

    return skjemaData;
  };
}
