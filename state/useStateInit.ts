import { nanoid } from 'nanoid';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../utils/parseIsoDate';
import MottattData from './MottattData';
import useBoundStore from './useBoundStore';
import { ForespurtData } from '../schema/endepunktHentForespoerselSchema';
import { json } from 'stream/consumers';

type Datafelt = 'virksomhet' | 'arbeidstaker-informasjon' | 'forespoersel-svar' | 'inntekt';

export type FeilReportElement = {
  melding: string;
  datafelt: Datafelt;
};

function feilRapportMapper(feilReport?: Array<FeilReportElement>) {
  if (!feilReport) return {};

  const virksomhetFeil = feilReport.filter((feilElement) => feilElement.datafelt === 'virksomhet');
  const arbeidstakerFeil = feilReport.filter((feilElement) => feilElement.datafelt === 'arbeidstaker-informasjon');
  const forespoerselFeil = feilReport.filter((feilElement) => feilElement.datafelt === 'forespoersel-svar');
  const inntektFeil = feilReport.filter((feilElement) => feilElement.datafelt === 'inntekt');

  return {
    virksomhetFeil,
    arbeidstakerFeil,
    forespoerselFeil,
    inntektFeil
  };
}

export default function useStateInit() {
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initBruttoinntekt = useBoundStore((state) => state.initBruttoinntekt);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const initPerson = useBoundStore((state) => state.initPerson);
  const setBestemmendeFravaersdag = useBoundStore((state) => state.setBestemmendeFravaersdag);
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

  return (jsonData: MottattData | ForespurtData) => {
    const feilRapporter = feilRapportMapper(jsonData.feilReport?.feil);

    initFravaersperiode(jsonData.fravaersperioder);
    initEgenmeldingsperiode(jsonData.egenmeldingsperioder);
    const feilVedLasting = {
      persondata: feilRapporter.arbeidstakerFeil,
      arbeidsgiverdata: feilRapporter.virksomhetFeil,
      inntekt: feilRapporter.inntektFeil
    };
    initPerson(
      jsonData.navn,
      jsonData.identitetsnummer,
      jsonData.orgnrUnderenhet,
      jsonData.orgNavn ?? jsonData.virksomhetsnavn,
      jsonData.innsenderNavn,
      jsonData.telefonnummer,
      feilVedLasting
    );

    if (jsonData.eksternBestemmendeFravaersdag) setSkjaeringstidspunkt(jsonData.eksternBestemmendeFravaersdag);

    const perioder = jsonData.fravaersperioder.concat(jsonData.egenmeldingsperioder).map((periode) => ({
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
    if (bestemmendeFravaersdag) setBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));

    if (jsonData.eksternBestemmendeFravaersdag) {
      setForeslaattBestemmendeFravaersdag(parseIsoDate(jsonData.eksternBestemmendeFravaersdag));
    } else if (bestemmendeFravaersdag) setForeslaattBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));

    if (arbeidsgiverperiode) setArbeidsgiverperioder(arbeidsgiverperiode);

    initBruttoinntekt(
      jsonData.bruttoinntekt,
      jsonData.tidligereinntekter,
      parseIsoDate(bestemmendeFravaersdag)!,
      feilVedLasting.inntekt
    );

    if (jsonData.forespurtData) {
      initForespurtData(jsonData.forespurtData);
    }
  };
}
