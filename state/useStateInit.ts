import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import MottattData from './MottattData';
import useBoundStore from './useBoundStore';

export default function useStateInit() {
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initBruttoinntekt = useBoundStore((state) => state.initBruttioinntekt);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const initPerson = useBoundStore((state) => state.initPerson);
  const initBehandlingsdager = useBoundStore((state) => state.initBehandlingsdager);
  const getGrunnbeloep = useBoundStore((state) => state.getGrunnbeloep);

  return (jsonData: MottattData) => {
    initFravaersperiode(jsonData.fravaersperioder);
    initBruttoinntekt(jsonData.bruttoinntekt, jsonData.tidligereinntekter);
    initEgenmeldingsperiode(jsonData.egenmeldingsperioder);
    initPerson(jsonData.navn, jsonData.identitetsnummer, jsonData.orgnrUnderenhet);
    if (jsonData.behandlingsperiode) {
      initBehandlingsdager(jsonData.behandlingsperiode, jsonData.behandlingsdager);
    }

    const bestemmendeFravaersdag = finnBestemmendeFravaersdag(jsonData.fravaersperioder);
    getGrunnbeloep(bestemmendeFravaersdag);
  };
}
