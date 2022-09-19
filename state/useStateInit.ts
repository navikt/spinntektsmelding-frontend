import MottattData from './MottattData';
import useBoundStore from './useBoundStore';

export default function useStateInit() {
  const initArbeidsforhold = useBoundStore((state) => state.initArbeidsforhold);
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initBruttoinntekt = useBoundStore((state) => state.initBruttioinntekt);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const initPerson = useBoundStore((state) => state.initPerson);
  const initBehandlingsdager = useBoundStore((state) => state.initBehandlingsdager);

  return (jsonData: MottattData) => {
    initArbeidsforhold(jsonData.arbeidsforhold);

    initFravaersperiode(jsonData.fravaersperiode);

    initBruttoinntekt(jsonData.bruttoinntekt, jsonData.tidligereinntekt);
    initEgenmeldingsperiode(jsonData.arbeidsforhold, jsonData.egenmeldingsperioder);
    initPerson(jsonData.navn, jsonData.identitetsnummer, jsonData.orgnrUnderenhet);
    if (jsonData.behandlingsperiode) {
      initBehandlingsdager(jsonData.behandlingsperiode, jsonData.behandlingsdager);
    }
  };
}
