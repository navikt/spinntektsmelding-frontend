import InntektsmeldingSkjema from './state';
import useArbeidsforholdStore from './useArbeidsforholdStore';
import useBehandlingsdagerStore from './useBehandlingsdagerStore';
import useBruttoinntektStore from './useBruttoinntektStore';
import useEgenmeldingStore from './useEgenmeldingStore';
import useFravaersperiodeStore from './useFravaersperiodeStore';
import useNaturalytelserStore from './useNaturalytelserStore';
import usePersonStore from './usePersonStore';
import useRefusjonArbeidsgiverStore from './useRefusjonArbeidsgiverStore';

export default function useFyllInnsending() {
  const fravaersperiode = useFravaersperiodeStore((fstate) => fstate.fravaersperiode);
  const bruttoinntekt = useBruttoinntektStore((fstate) => fstate.bruttoinntekt);

  const egenmeldingsperioder = useEgenmeldingStore((fstate) => fstate.egenmeldingsperioder);
  const [navn, identitetsnummer, virksomhetsnavn, orgnrUnderenhet] = usePersonStore((fstate) => [
    fstate.navn,
    fstate.identitetsnummer,
    fstate.virksomhetsnavn,
    fstate.orgnrUnderenhet
  ]);
  const [fullLonnIArbeidsgiverPerioden, lonnISykefravaeret] = useRefusjonArbeidsgiverStore((fstate) => [
    fstate.fullLonnIArbeidsgiverPerioden,
    fstate.lonnISykefravaeret
  ]);
  const naturalytelser = useNaturalytelserStore((fstate) => fstate.naturalytelser);

  const [behandlingsperiode, behandlingsdager] = useBehandlingsdagerStore((fstate) => [
    fstate.behandlingsperiode,
    fstate.behandlingsdager
  ]);

  const arbeidsforhold = useArbeidsforholdStore((fstate) => fstate.arbeidsforhold);

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
