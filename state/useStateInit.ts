import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../utils/parseIsoDate';
import MottattData from './MottattData';
import useBoundStore from './useBoundStore';

export default function useStateInit() {
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initBruttoinntekt = useBoundStore((state) => state.initBruttioinntekt);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const initPerson = useBoundStore((state) => state.initPerson);
  const initBehandlingsdager = useBoundStore((state) => state.initBehandlingsdager);
  const getGrunnbeloep = useBoundStore((state) => state.getGrunnbeloep);
  const setBestemmendeFravaersdag = useBoundStore((state) => state.setBestemmendeFravaersdag);

  const setArbeidsgiverperioder = useBoundStore((state) => state.setArbeidsgiverperioder);

  return (jsonData: MottattData) => {
    initFravaersperiode(jsonData.fravaersperioder);
    initBruttoinntekt(jsonData.bruttoinntekt, jsonData.tidligereinntekter);
    initEgenmeldingsperiode(jsonData.egenmeldingsperioder);
    initPerson(jsonData.navn, jsonData.identitetsnummer, jsonData.orgnrUnderenhet);
    if (jsonData.behandlingsperiode) {
      initBehandlingsdager(jsonData.behandlingsperiode, jsonData.behandlingsdager);
    }

    const bestemmendeFravaersdag = finnBestemmendeFravaersdag(
      jsonData.fravaersperioder.concat(jsonData.egenmeldingsperioder)
    );
    if (bestemmendeFravaersdag) setBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));

    const perioder = jsonData.fravaersperioder.concat(jsonData.egenmeldingsperioder).map((periode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom),
      id: 'dummy'
    }));

    const arbeidsgiverperiode = finnArbeidsgiverperiode(perioder);

    if (arbeidsgiverperiode) setArbeidsgiverperioder(arbeidsgiverperiode);

    // getGrunnbeloep(bestemmendeFravaersdag);
  };
}
