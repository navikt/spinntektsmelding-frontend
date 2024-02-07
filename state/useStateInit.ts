import { nanoid } from 'nanoid';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../utils/parseIsoDate';
import MottattData from './MottattData';
import useBoundStore from './useBoundStore';

type Datafelt = 'virksomhet' | 'arbeidstaker-informasjon' | 'forespoersel-svar' | 'inntekt';

export type FeilReportElement = {
  melding: string;
  status: number;
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
  const initBehandlingsdager = useBoundStore((state) => state.initBehandlingsdager);
  const setBestemmendeFravaersdag = useBoundStore((state) => state.setBestemmendeFravaersdag);
  const initForespurtData = useBoundStore((state) => state.initForespurtData);
  const [setForeslaattBestemmendeFravaersdag, setSkjaeringstidspunkt] = useBoundStore((state) => [
    state.setForeslaattBestemmendeFravaersdag,
    state.setSkjaeringstidspunkt
  ]);

  const setArbeidsgiverperioder = useBoundStore((state) => state.setArbeidsgiverperioder);
  const arbeidsgiverKanFlytteSkjæringstidspunkt = useBoundStore(
    (state) => state.arbeidsgiverKanFlytteSkjæringstidspunkt
  );

  return (jsonData: MottattData) => {
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
      jsonData.orgNavn,
      jsonData.innsenderNavn,
      jsonData.telefonnummer,
      feilVedLasting
    );

    if (jsonData.behandlingsperiode) {
      initBehandlingsdager(jsonData.behandlingsperiode, jsonData.behandlingsdager);
    }

    if (jsonData.skjaeringstidspunkt) setSkjaeringstidspunkt(jsonData.skjaeringstidspunkt);

    const perioder = jsonData.fravaersperioder.concat(jsonData.egenmeldingsperioder).map((periode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom),
      id: nanoid()
    }));

    const foreslaattBestemmendeFraværsdag = jsonData.skjaeringstidspunkt;

    const bestemmendeFravaersdag = finnBestemmendeFravaersdag(
      perioder,
      undefined,
      foreslaattBestemmendeFraværsdag,
      arbeidsgiverKanFlytteSkjæringstidspunkt()
    );
    if (bestemmendeFravaersdag) setBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));

    if (foreslaattBestemmendeFraværsdag) {
      setForeslaattBestemmendeFravaersdag(parseIsoDate(foreslaattBestemmendeFraværsdag));
    } else if (bestemmendeFravaersdag) setForeslaattBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));

    const arbeidsgiverperiode = finnArbeidsgiverperiode(perioder);

    if (arbeidsgiverperiode) setArbeidsgiverperioder(arbeidsgiverperiode);

    if (bestemmendeFravaersdag) {
      initBruttoinntekt(
        jsonData.bruttoinntekt,
        jsonData.tidligereinntekter,
        parseIsoDate(bestemmendeFravaersdag),
        feilVedLasting.inntekt
      );
    }

    if (jsonData.forespurtData) {
      initForespurtData(jsonData.forespurtData);
    }
  };
}
