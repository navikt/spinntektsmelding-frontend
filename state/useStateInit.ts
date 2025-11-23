import { nanoid } from 'nanoid';
import finnArbeidsgiverperiode from '../utils/finnArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import parseIsoDate from '../utils/parseIsoDate';
import useBoundStore from './useBoundStore';
import { MottattData } from '../schema/MottattDataSchema';
import { useShallow } from 'zustand/react/shallow';

export default function useStateInit() {
  const {
    initFravaersperiode,
    initBruttoinntekt,
    initEgenmeldingsperiode,
    initPerson,
    initForespurtData,
    setForeslaattBestemmendeFravaersdag,
    setSkjaeringstidspunkt,
    setBegrensetForespoersel,
    setMottattBestemmendeFravaersdag,
    setMottattEksternInntektsdato,
    setArbeidsgiverperioder,
    arbeidsgiverKanFlytteSkjæringstidspunkt
  } = useBoundStore(
    useShallow((state) => ({
      initFravaersperiode: state.initFravaersperiode,
      initBruttoinntekt: state.initBruttoinntekt,
      initEgenmeldingsperiode: state.initEgenmeldingsperiode,
      initPerson: state.initPerson,
      initForespurtData: state.initForespurtData,
      setForeslaattBestemmendeFravaersdag: state.setForeslaattBestemmendeFravaersdag,
      setSkjaeringstidspunkt: state.setSkjaeringstidspunkt,
      setBegrensetForespoersel: state.setBegrensetForespoersel,
      setMottattBestemmendeFravaersdag: state.setMottattBestemmendeFravaersdag,
      setMottattEksternInntektsdato: state.setMottattEksternInntektsdato,
      setArbeidsgiverperioder: state.setArbeidsgiverperioder,
      arbeidsgiverKanFlytteSkjæringstidspunkt: state.arbeidsgiverKanFlytteSkjæringstidspunkt
    }))
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
        jsonData.bestemmendeFravaersdag ?? parseIsoDate(bestemmendeFravaersdag),
        jsonData.inntekt?.gjennomsnitt ?? null,
        jsonData.inntekt?.historikk ?? null
      );
    }

    if (jsonData.erBegrenset) {
      setBegrensetForespoersel(jsonData.erBegrenset);
    }
  };
}
