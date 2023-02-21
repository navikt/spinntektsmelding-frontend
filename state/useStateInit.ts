import { nanoid } from 'nanoid';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../utils/parseIsoDate';
import MottattData from './MottattData';
import useBoundStore from './useBoundStore';

export default function useStateInit() {
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initBruttoinntekt = useBoundStore((state) => state.initBruttoinntekt);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const initPerson = useBoundStore((state) => state.initPerson);
  const initBehandlingsdager = useBoundStore((state) => state.initBehandlingsdager);
  const setBestemmendeFravaersdag = useBoundStore((state) => state.setBestemmendeFravaersdag);

  const setArbeidsgiverperioder = useBoundStore((state) => state.setArbeidsgiverperioder);

  return (jsonData: MottattData) => {
    initFravaersperiode(jsonData.fravaersperioder);
    initEgenmeldingsperiode(jsonData.egenmeldingsperioder);
    initPerson(
      jsonData.navn,
      jsonData.identitetsnummer,
      jsonData.orgnrUnderenhet,
      jsonData.orgNavn,
      jsonData.innsenderNavn,
      jsonData.innsenderTelefonNr
    );
    if (jsonData.behandlingsperiode) {
      initBehandlingsdager(jsonData.behandlingsperiode, jsonData.behandlingsdager);
    }

    const perioder = jsonData.fravaersperioder.concat(jsonData.egenmeldingsperioder).map((periode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom),
      id: nanoid()
    }));

    const bestemmendeFravaersdag = finnBestemmendeFravaersdag(perioder);
    if (bestemmendeFravaersdag) setBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));

    const arbeidsgiverperiode = finnArbeidsgiverperiode(perioder);

    if (arbeidsgiverperiode) setArbeidsgiverperioder(arbeidsgiverperiode);

    if (bestemmendeFravaersdag) {
      initBruttoinntekt(jsonData.bruttoinntekt, jsonData.tidligereinntekter, parseIsoDate(bestemmendeFravaersdag));
    }
  };
}
