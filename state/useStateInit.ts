import { nanoid } from 'nanoid';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../utils/parseIsoDate';
import useBoundStore from './useBoundStore';
import { FeilReportElement } from '../schema/feilReportSchema';
import { MottattData } from '../schema/mottattData';

function feilRapportMapper(feilReport?: Array<FeilReportElement>) {
  if (!feilReport) return {};

  const virksomhetFeil = feilReport.filter((feilElement) => feilElement.datafelt === 'virksomhet');
  const arbeidstakerFeil = feilReport.filter((feilElement) => feilElement.datafelt === 'arbeidstaker-informasjon');

  const forespoerselFeil = feilReport.filter((feilElement) => feilElement.datafelt === 'forespoersel-svar');
  const inntektFeil = feilReport.filter((feilElement) => feilElement.datafelt === 'inntekt');
  const personopplysningerFeil = feilReport.filter((feilElement) => feilElement.datafelt === 'personer');

  return {
    virksomhetFeil,
    arbeidstakerFeil,
    forespoerselFeil,
    inntektFeil,
    personopplysningerFeil
  };
}

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
    initFravaersperiode(jsonData.fravaersperioder);
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

    if (jsonData.eksternBestemmendeFravaersdag) {
      setForeslaattBestemmendeFravaersdag(parseIsoDate(jsonData.eksternBestemmendeFravaersdag));
    } else if (bestemmendeFravaersdag) setForeslaattBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));

    if (arbeidsgiverperiode) setArbeidsgiverperioder(arbeidsgiverperiode);

    initBruttoinntekt(
      jsonData.bruttoinntekt,
      jsonData.tidligereinntekter,
      parseIsoDate(bestemmendeFravaersdag)!,
      jsonData.tidligereinntekter === null
    );

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
