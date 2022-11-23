import InntektsmeldingSkjema from './state';
import useBoundStore from './useBoundStore';

export default function useFyllInnsending() {
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);

  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const [navn, identitetsnummer, virksomhetsnavn, orgnrUnderenhet] = useBoundStore((state) => [
    state.navn,
    state.identitetsnummer,
    state.virksomhetsnavn,
    state.orgnrUnderenhet
  ]);
  const [fullLonnIArbeidsgiverPerioden, lonnISykefravaeret, refusjonskravetOpphoerer] = useBoundStore((state) => [
    state.fullLonnIArbeidsgiverPerioden,
    state.lonnISykefravaeret,
    state.refusjonskravetOpphoerer
  ]);
  const naturalytelser = useBoundStore((state) => state.naturalytelser);

  const [behandlingsperiode, behandlingsdager] = useBoundStore((state) => [
    state.behandlingsperiode,
    state.behandlingsdager
  ]);

  const setSkalViseFeilmeldinger = useBoundStore((state) => state.setSkalViseFeilmeldinger);

  setSkalViseFeilmeldinger(true);

  return (opplysningerBekreftet: boolean): InntektsmeldingSkjema => {
    const skjemaData: InntektsmeldingSkjema = {
      navn: navn,
      identitetsnummer: identitetsnummer,
      virksomhetsnavn: virksomhetsnavn,
      orgnrUnderenhet: orgnrUnderenhet,
      fravaersperioder: fravaersperioder,
      egenmeldingsperioder: egenmeldingsperioder,
      bruttoinntekt: bruttoinntekt,
      fullLonnIArbeidsgiverPerioden: fullLonnIArbeidsgiverPerioden,
      lonnISykefravaeret: lonnISykefravaeret,
      naturalytelser: naturalytelser,
      opplysningerBekreftet: opplysningerBekreftet,
      behandlingsdager: behandlingsdager,
      behandlingsperiode: behandlingsperiode,
      sammeFravaersperiode: false,
      refusjonskravetOpphoerer: refusjonskravetOpphoerer
    };

    return skjemaData;
  };
}
