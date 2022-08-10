import MottattData from './MottattData';
import useArbeidsforholdStore from './useArbeidsforholdStore';
import useBehandlingsdagerStore from './useBehandlingsdagerStore';
import useBruttoinntektStore from './useBruttoinntektStore';
import useEgenmeldingStore from './useEgenmeldingStore';
import useFravaersperiodeStore from './useFravaersperiodeStore';
import usePersonStore from './usePersonStore';

export default function useStateInit() {
  const initFravaersperiode = useFravaersperiodeStore((state) => state.initFravaersperiode);
  const initBruttoinntekt = useBruttoinntektStore((state) => state.initBruttioinntekt);
  const initArbeidsforhold = useArbeidsforholdStore((state) => state.initArbeidsforhold);
  const initEgenmeldingsperiode = useEgenmeldingStore((state) => state.initEgenmeldingsperiode);
  const initPerson = usePersonStore((state) => state.initPerson);
  const initBehandlingsdager = useBehandlingsdagerStore((state) => state.initBehandlingsdager);

  return (jsonData: MottattData) => {
    if (jsonData.fravaersperiode) {
      initFravaersperiode(jsonData.fravaersperiode);
    }
    initBruttoinntekt(jsonData.bruttoinntekt, jsonData.tidligereinntekt);
    initArbeidsforhold(jsonData.arbeidsforhold);
    initEgenmeldingsperiode(jsonData.arbeidsforhold, jsonData.egenmeldingsperioder);
    initPerson(jsonData.navn, jsonData.identitetsnummer, jsonData.orgnrUnderenhet);
    if (jsonData.behandlingsperiode) {
      initBehandlingsdager(jsonData.behandlingsperiode, jsonData.behandlingsdager);
    }
  };
}
