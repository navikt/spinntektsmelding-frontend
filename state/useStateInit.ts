import { nanoid } from 'nanoid';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../utils/parseIsoDate';
import useBoundStore from './useBoundStore';
import { MottattData } from '../schema/MottattDataSchema';

export default function useStateInit() {
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initBruttoinntekt = useBoundStore((state) => state.initBruttoinntekt);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const initPerson = useBoundStore((state) => state.initPerson);
  const initForespurtData = useBoundStore((state) => state.initForespurtData);
  const [setForeslaattBestemmendeFravaersdag, setSkjaeringstidspunkt, setBegrensetForespoersel] = useBoundStore(
    (state) => [state.setForeslaattBestemmendeFravaersdag, state.setSkjaeringstidspunkt, state.setBegrensetForespoersel]
  );
  const [setMottattBestemmendeFravaersdag, setMottattEksternInntektsdato] = useBoundStore((state) => [
    state.setMottattBestemmendeFravaersdag,
    state.setMottattEksternInntektsdato
  ]);

  const setArbeidsgiverperioder = useBoundStore((state) => state.setArbeidsgiverperioder);
  const arbeidsgiverKanFlytteSkjæringstidspunkt = useBoundStore(
    (state) => state.arbeidsgiverKanFlytteSkjæringstidspunkt
  );

  return (jsonData: MottattData) => {
    initFravaersperiode(jsonData.sykmeldingsperioder);
    initEgenmeldingsperiode(jsonData.egenmeldingsperioder);

    initPerson(
      jsonData.sykmeldt.navn,
      jsonData.sykmeldt.fnr,
      jsonData.avsender.orgnr,
      jsonData.avsender.orgNavn,
      jsonData.avsender.navn,
      jsonData.telefonnummer
    );

    if (jsonData.eksternInntektsdato) setSkjaeringstidspunkt(jsonData.eksternInntektsdato);

    const perioder = jsonData.sykmeldingsperioder.concat(jsonData.egenmeldingsperioder).map((periode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom),
      id: nanoid()
    }));

    setMottattBestemmendeFravaersdag(jsonData.bestemmendeFravaersdag);
    setMottattEksternInntektsdato(jsonData.eksternInntektsdato);

    const arbeidsgiverperiode = finnArbeidsgiverperiode(perioder);

    const bestemmendeFravaersdag = finnBestemmendeFravaersdag(
      perioder,
      arbeidsgiverperiode,
      jsonData.eksternInntektsdato ?? undefined,
      arbeidsgiverKanFlytteSkjæringstidspunkt()
    );

    if (jsonData.eksternInntektsdato) {
      setForeslaattBestemmendeFravaersdag(parseIsoDate(jsonData.eksternInntektsdato));
    } else if (bestemmendeFravaersdag) setForeslaattBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));

    if (arbeidsgiverperiode) setArbeidsgiverperioder(arbeidsgiverperiode);

    initBruttoinntekt(
      jsonData.inntekt?.gjennomsnitt ?? null,
      jsonData.inntekt?.historikk ?? null,
      parseIsoDate(bestemmendeFravaersdag)!
    );

    if (jsonData.forespurtData) {
      initForespurtData(
        jsonData.forespurtData,
        jsonData.bestemmendeFravaersdag ?? parseIsoDate(bestemmendeFravaersdag)!,
        jsonData.inntekt?.gjennomsnitt ?? null,
        jsonData.inntekt?.historikk ?? null
      );
    }

    if (jsonData.begrensetForespoersel) {
      setBegrensetForespoersel(jsonData.begrensetForespoersel);
    }
  };
}
