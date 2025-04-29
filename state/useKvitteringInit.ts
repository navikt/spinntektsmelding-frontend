import parseIsoDate from '../utils/parseIsoDate';
import { MottattNaturalytelse, MottattPeriode, TDateISODate } from './MottattData';
import useBoundStore from './useBoundStore';

import MottattKvitteringSchema, {
  kvitteringEksternSchema,
  kvitteringNavNoSchema
} from '../schema/mottattKvitteringSchema';

import forespoerselType from '../config/forespoerselType';
import { konverterBegrunnelseFullLonnIArbeidsgiverperiode } from '../utils/konverterBegrunnelseFullLonnIArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import { finnFravaersperioder } from './useEgenmeldingStore';
import { isBefore } from 'date-fns';
import { z } from 'zod';
import { Opplysningstype } from './useForespurtDataStore';

type KvitteringEksternSchema = z.infer<typeof kvitteringEksternSchema>;
type KvitteringNavNoSchema = z.infer<typeof kvitteringNavNoSchema>;
type KvitteringData = z.infer<typeof MottattKvitteringSchema>;

export default function useKvitteringInit() {
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const initPerson = useBoundStore((state) => state.initPerson);

  const setBareNyMaanedsinntekt = useBoundStore((state) => state.setBareNyMaanedsinntekt);
  const initFullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.initFullLonnIArbeidsgiverPerioden);

  const oppdaterRefusjonEndringer = useBoundStore((state) => state.oppdaterRefusjonEndringer);

  const initArbeidsgiverperioder = useBoundStore((state) => state.initArbeidsgiverperioder);
  const initLonnISykefravaeret = useBoundStore((state) => state.initLonnISykefravaeret);

  const initNaturalytelser = useBoundStore((state) => state.initNaturalytelser);
  const setKvitteringInnsendt = useBoundStore((state) => state.setKvitteringInnsendt);
  const [setEndringAarsaker] = useBoundStore((state) => [state.setEndringAarsaker]);
  const harArbeidsgiverperiodenBlittEndret = useBoundStore((state) => state.harArbeidsgiverperiodenBlittEndret);

  const setPaakrevdeOpplysninger = useBoundStore((state) => state.setPaakrevdeOpplysninger);
  const setTidligereInntektsdata = useBoundStore((state) => state.setTidligereInntektsdata);
  const setInngangFraKvittering = useBoundStore((state) => state.setInngangFraKvittering);
  const setOpprinneligNyMaanedsinntekt = useBoundStore((state) => state.setOpprinneligNyMaanedsinntekt);
  const setSkjemaKvitteringEksterntSystem = useBoundStore((state) => state.setSkjemaKvitteringEksterntSystem);
  const setForeslaattBestemmendeFravaersdag = useBoundStore((state) => state.setForeslaattBestemmendeFravaersdag);
  const setHarRefusjonEndringer = useBoundStore((state) => state.setHarRefusjonEndringer);
  const setSkjaeringstidspunkt = useBoundStore((state) => state.setSkjaeringstidspunkt);

  return async (kvitteringsData: KvitteringData) => {
    if (!kvitteringsData) return;

    if (kvitteringsData.kvitteringEkstern && kvitteringsData.kvitteringEkstern !== null) {
      setSkjemaKvitteringEksterntSystem(kvitteringsData.kvitteringEkstern);
      return;
    }

    const jsonData: KvitteringNavNoSchema = kvitteringsData.kvitteringNavNo!;

    handleFravaersperiode(jsonData);
    handleEgenmeldingsperiode(jsonData);
    handlePaakrevdeOpplysninger(jsonData);
    handlePerson(jsonData);
    handleBestemmendeFravaersdag(jsonData);
    handleInntekt(jsonData);
    handleRefusjon(jsonData);
    handleNaturalytelser(jsonData);
    handleArbeidsgiverperioder(jsonData);
    handleKvitteringInnsendtTidspunkt(jsonData);
    handleTidligereInntektsdata(jsonData);
    handleFravaersperioder(jsonData);
  };

  function handleFravaersperiode(jsonData: KvitteringNavNoSchema) {
    initFravaersperiode(jsonData.sykmeldingsperioder);
  }

  function handleEgenmeldingsperiode(jsonData: KvitteringNavNoSchema) {
    if (jsonData.skjema.agp?.egenmeldinger)
      initEgenmeldingsperiode(jsonData.skjema.agp.egenmeldinger as MottattPeriode[]);
  }

  function handlePaakrevdeOpplysninger(jsonData: KvitteringNavNoSchema) {
    const paakrevdeOpplysninger: Array<Opplysningstype> = finnPakrevdeOpplysninger(jsonData);
    if (paakrevdeOpplysninger.length > 0) {
      setPaakrevdeOpplysninger(paakrevdeOpplysninger);
    }
    setInngangFraKvittering();
  }

  function handlePerson(jsonData: KvitteringNavNoSchema) {
    initPerson(
      jsonData.sykmeldt.navn,
      jsonData.sykmeldt.fnr,
      jsonData.avsender.orgnr,
      jsonData.avsender.orgNavn,
      jsonData.avsender.navn,
      jsonData.avsender.tlf
    );
  }

  function handleBestemmendeFravaersdag(jsonData: KvitteringNavNoSchema) {
    const bestemmendeFravaersdag = jsonData.skjema.inntekt?.inntektsdato;
    if (bestemmendeFravaersdag) {
      setForeslaattBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));
    }
  }

  function handleInntekt(jsonData: KvitteringNavNoSchema) {
    const beregnetInntekt = jsonData.skjema.inntekt?.beloep;
    if (!beregnetInntekt) return;
    setBareNyMaanedsinntekt(beregnetInntekt.toString());
    setOpprinneligNyMaanedsinntekt();
    if (jsonData.skjema.inntekt?.endringAarsak) {
      setEndringAarsaker([jsonData.skjema.inntekt.endringAarsak]);
    }
    if (jsonData.skjema.inntekt?.endringAarsaker) {
      setEndringAarsaker(jsonData.skjema.inntekt?.endringAarsaker);
    }
  }

  function handleRefusjon(jsonData: KvitteringNavNoSchema) {
    initLonnISykefravaeret({
      status: jsonData.skjema.refusjon?.beloepPerMaaned ? 'Ja' : 'Nei',
      beloep: jsonData.skjema.refusjon?.beloepPerMaaned
    });

    if (jsonData.skjema.refusjon?.sluttdato) {
      if (jsonData.skjema.refusjon?.endringer && jsonData.skjema.refusjon?.endringer.length > 0) {
        jsonData.skjema.refusjon.endringer.push({
          beloep: 0,
          startdato: jsonData.skjema.refusjon.sluttdato!
        });
      } else {
        jsonData.skjema.refusjon.endringer = [
          {
            beloep: 0,
            startdato: jsonData.skjema.refusjon?.sluttdato
          }
        ];
      }
    }

    if (jsonData.skjema.refusjon?.endringer) {
      const endringer = jsonData.skjema.refusjon?.endringer.map((endring) => ({
        beloep: endring.beloep,
        dato: parseIsoDate(endring.startdato)
      }));
      oppdaterRefusjonEndringer(endringer);
    }

    if (jsonData.skjema.refusjon) {
      setHarRefusjonEndringer(
        jsonData.skjema.refusjon?.endringer && jsonData.skjema.refusjon?.endringer.length > 0 ? 'Ja' : 'Nei'
      );
    }
  }

  function handleNaturalytelser(jsonData: KvitteringNavNoSchema) {
    if (!jsonData.skjema.inntekt) return;

    if (jsonData.skjema.inntekt.naturalytelser) {
      const ytelser: Array<MottattNaturalytelse> = jsonData.skjema.inntekt.naturalytelser.map((ytelse) => ({
        naturalytelse: ytelse.naturalytelse,
        sluttdato: parseIsoDate(ytelse.sluttdato),
        verdiBeloep: ytelse.verdiBeloep
      }));
      initNaturalytelser(ytelser);
    }
  }

  function handleArbeidsgiverperioder(jsonData: KvitteringNavNoSchema) {
    initFullLonnIArbeidsgiverPerioden({
      status: jsonData.skjema.agp?.redusertLoennIAgp ? 'Nei' : 'Ja',
      begrunnelse: jsonData.skjema.agp?.redusertLoennIAgp?.begrunnelse
        ? konverterBegrunnelseFullLonnIArbeidsgiverperiode(jsonData.skjema.agp.redusertLoennIAgp.begrunnelse)
        : undefined,
      utbetalt: jsonData.skjema.agp?.redusertLoennIAgp?.beloep ?? undefined
    });

    initArbeidsgiverperioder(jsonData.skjema.agp?.perioder);
    harArbeidsgiverperiodenBlittEndret();
  }

  function handleKvitteringInnsendtTidspunkt(jsonData: KvitteringNavNoSchema) {
    if (jsonData.mottatt) {
      setKvitteringInnsendt(jsonData.mottatt);
    }
  }

  function handleTidligereInntektsdata(jsonData: KvitteringNavNoSchema) {
    if (!jsonData.skjema.inntekt) return;

    const beregnetInntekt = jsonData.skjema.inntekt?.beloep;
    setTidligereInntektsdata({
      beløp: beregnetInntekt,
      skjæringstidspunkt: jsonData.skjema.inntekt?.inntektsdato as TDateISODate,
      kilde: 'INNTEKTSMELDING'
    });
  }

  function handleFravaersperioder(jsonData: KvitteringNavNoSchema) {
    const sykmeldingPerioder = jsonData.sykmeldingsperioder.map((periode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom)
    }));
    const egenmeldingPerioder = jsonData.skjema.agp?.egenmeldinger
      ? jsonData.skjema.agp.egenmeldinger.map((periode) => ({
          fom: parseIsoDate(periode.fom),
          tom: parseIsoDate(periode.tom)
        }))
      : [];
    const fravaerPerioder = finnFravaersperioder(sykmeldingPerioder, egenmeldingPerioder);
    const arbeidsgiverperioder = jsonData.skjema.agp?.perioder
      ? jsonData.skjema.agp.perioder.map((periode) => ({
          fom: parseIsoDate(periode.fom),
          tom: parseIsoDate(periode.tom)
        }))
      : [];
    const bestemmendeFravaersdag = jsonData.skjema.inntekt?.inntektsdato;
    const beregnetBestemmeFravaersdag = finnBestemmendeFravaersdag(fravaerPerioder, arbeidsgiverperioder);
    if (
      beregnetBestemmeFravaersdag &&
      isBefore(parseIsoDate(bestemmendeFravaersdag)!, parseIsoDate(beregnetBestemmeFravaersdag)!)
    ) {
      setForeslaattBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));
      setSkjaeringstidspunkt(bestemmendeFravaersdag as TDateISODate);
    }
  }
}

function finnPakrevdeOpplysninger(jsonData: KvitteringNavNoSchema) {
  const paakrevdeOpplysninger: Array<Opplysningstype> = [];

  if (jsonData.skjema.agp) paakrevdeOpplysninger.push(forespoerselType.arbeidsgiverperiode as Opplysningstype);
  if (jsonData.skjema.inntekt) paakrevdeOpplysninger.push(forespoerselType.inntekt as Opplysningstype);
  if (jsonData.skjema.refusjon) paakrevdeOpplysninger.push(forespoerselType.refusjon as Opplysningstype);
  return paakrevdeOpplysninger;
}
