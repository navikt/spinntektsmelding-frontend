import { nanoid } from 'nanoid';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../utils/parseIsoDate';
import useBoundStore from './useBoundStore';
import { MottattData } from '../schema/mottattDataSchema';

export default function useStateInit() {
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initBruttoinntekt = useBoundStore((state) => state.initBruttoinntekt);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const initPerson = useBoundStore((state) => state.initPerson);
  const initForespurtData = useBoundStore((state) => state.initForespurtData);
  const [setForeslaattBestemmendeFravaersdag, setSkjaeringstidspunkt] = useBoundStore((state) => [
    state.setForeslaattBestemmendeFravaersdag,
    state.setSkjaeringstidspunkt
  ]);
  const [setMottattBestemmendeFravaersdag, setMottattEksternBestemmendeFravaersdag] = useBoundStore((state) => [
    state.setMottattBestemmendeFravaersdag,
    state.setMottattEksternBestemmendeFravaersdag
  ]);

  const setArbeidsgiverperioder = useBoundStore((state) => state.setArbeidsgiverperioder);
  const arbeidsgiverKanFlytteSkjæringstidspunkt = useBoundStore(
    (state) => state.arbeidsgiverKanFlytteSkjæringstidspunkt
  );

  return (jsonData: MottattData) => {
    initFravaersperiode(jsonData.sykmeldingsperioder);
    initEgenmeldingsperiode(jsonData.egenmeldingsperioder);

    initPerson(
      jsonData.navn,
      jsonData.identitetsnummer,
      jsonData.orgnrUnderenhet,
      jsonData.orgNavn,
      jsonData.innsenderNavn,
      jsonData.telefonnummer
    );

    if (jsonData.eksternBestemmendeFravaersdag) setSkjaeringstidspunkt(jsonData.eksternBestemmendeFravaersdag);

    const perioder = jsonData.sykmeldingsperioder.concat(jsonData.egenmeldingsperioder).map((periode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom),
      id: nanoid()
    }));

    setMottattBestemmendeFravaersdag(jsonData.bestemmendeFravaersdag);
    setMottattEksternBestemmendeFravaersdag(jsonData.eksternBestemmendeFravaersdag);

    const arbeidsgiverperiode = finnArbeidsgiverperiode(perioder);

    const bestemmendeFravaersdag = finnBestemmendeFravaersdag(
      perioder,
      arbeidsgiverperiode,
      jsonData.eksternBestemmendeFravaersdag,
      arbeidsgiverKanFlytteSkjæringstidspunkt()
    );

    if (jsonData.eksternBestemmendeFravaersdag) {
      setForeslaattBestemmendeFravaersdag(parseIsoDate(jsonData.eksternBestemmendeFravaersdag));
    } else if (bestemmendeFravaersdag) setForeslaattBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));

    if (arbeidsgiverperiode) setArbeidsgiverperioder(arbeidsgiverperiode);

    initBruttoinntekt(jsonData.bruttoinntekt, jsonData.tidligereinntekter, parseIsoDate(bestemmendeFravaersdag)!);

    if (jsonData.forespurtData) {
      initForespurtData(
        jsonData.forespurtData,
        jsonData.bestemmendeFravaersdag ?? parseIsoDate(bestemmendeFravaersdag)!,
        jsonData.bruttoinntekt,
        jsonData.tidligereinntekter
      );
    }
  };
}
