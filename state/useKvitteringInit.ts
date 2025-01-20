import parseIsoDate from '../utils/parseIsoDate';
import { MottattNaturalytelse, MottattPeriode, TDateISODate } from './MottattData';
import useBoundStore from './useBoundStore';
import { InnsendingSkjema } from './useFyllInnsending';

import MottattKvitteringSchema, {
  kvitteringEksternSchema,
  kvitteringNavNoSchema
} from '../schema/mottattKvitteringSchema';

import skjemaVariant from '../config/skjemavariant';
import { konverterBegrunnelseFullLonnIArbeidsgiverperiode } from '../utils/konverterBegrunnelseFullLonnIArbeidsgiverperiode';
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import { finnFravaersperioder } from './useEgenmeldingStore';
import { isBefore } from 'date-fns';
import { z } from 'zod';
import { Opplysningstype } from './useForespurtDataStore';

type KvitteringEksternSchema = z.infer<typeof kvitteringEksternSchema>;
type KvitteringNavNoSchema = z.infer<typeof kvitteringNavNoSchema>;
type KvitteringData = z.infer<typeof MottattKvitteringSchema>;

interface KvitteringSkjema extends InnsendingSkjema {
  fulltNavn: string;
  virksomhetNavn: string;
  innsenderNavn: string;
  innsenderTelefonNr: string;
  beregnetInntekt?: number;
  tidspunkt?: string;
}

export default function useKvitteringInit() {
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const initPerson = useBoundStore((state) => state.initPerson);

  const setBareNyMaanedsinntekt = useBoundStore((state) => state.setBareNyMaanedsinntekt);
  const initFullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.initFullLonnIArbeidsgiverPerioden);

  const oppdaterRefusjonEndringer = useBoundStore((state) => state.oppdaterRefusjonEndringer);

  const initArbeidsgiverperioder = useBoundStore((state) => state.initArbeidsgiverperioder);
  const initLonnISykefravaeret = useBoundStore((state) => state.initLonnISykefravaeret);

  const refusjonskravetOpphoererDato = useBoundStore((state) => state.refusjonskravetOpphoererDato);
  const refusjonskravetOpphoererStatus = useBoundStore((state) => state.refusjonskravetOpphoererStatus);
  const initNaturalytelser = useBoundStore((state) => state.initNaturalytelser);
  const setKvitteringInnsendt = useBoundStore((state) => state.setKvitteringInnsendt);
  const setEndringAarsak = useBoundStore((state) => state.setEndringAarsak);
  const harArbeidsgiverperiodenBlittEndret = useBoundStore((state) => state.harArbeidsgiverperiodenBlittEndret);

  const setPaakrevdeOpplysninger = useBoundStore((state) => state.setPaakrevdeOpplysninger);
  const setTidligereInntektsdata = useBoundStore((state) => state.setTidligereInntektsdata);
  const setInngangFraKvittering = useBoundStore((state) => state.setInngangFraKvittering);
  const setOpprinneligNyMaanedsinntekt = useBoundStore((state) => state.setOpprinneligNyMaanedsinntekt);
  const setSkjemaKvitteringEksterntSystem = useBoundStore((state) => state.setSkjemaKvitteringEksterntSystem);
  const setForeslaattBestemmendeFravaersdag = useBoundStore((state) => state.setForeslaattBestemmendeFravaersdag);
  const initRefusjonskravetOpphoerer = useBoundStore((state) => state.initRefusjonskravetOpphoerer);
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
    setBareNyMaanedsinntekt(beregnetInntekt.toString());
    setOpprinneligNyMaanedsinntekt();
    setEndringAarsak(jsonData.skjema.inntekt.endringAarsak);
  }

  function handleRefusjon(jsonData: KvitteringNavNoSchema) {
    initLonnISykefravaeret({
      status: jsonData.skjema.refusjon?.beloepPerMaaned ? 'Ja' : 'Nei',
      beloep: jsonData.skjema.refusjon?.beloepPerMaaned
    });

    if (jsonData.skjema.refusjon) {
      initRefusjonskravetOpphoerer(
        jsonData.skjema.refusjon?.sluttdato ? 'Ja' : 'Nei',
        jsonData.skjema.refusjon?.sluttdato ? parseIsoDate(jsonData.skjema.refusjon?.sluttdato) : undefined,
        jsonData.skjema.refusjon?.endringer && jsonData.skjema.refusjon?.endringer.length > 0 ? 'Ja' : 'Nei'
      );
    }

    if (jsonData.skjema.refusjon?.endringer) {
      const endringer = jsonData.skjema.refusjon?.endringer.map((endring) => ({
        beloep: endring.beloep,
        dato: parseIsoDate(endring.startdato)
      }));
      oppdaterRefusjonEndringer(endringer);
    }

    if (jsonData.skjema.refusjon?.sluttdato) {
      refusjonskravetOpphoererDato(parseIsoDate(jsonData.skjema.refusjon?.sluttdato));
      refusjonskravetOpphoererStatus('Ja');
    } else if (jsonData.skjema.refusjon?.utbetalerHeleEllerDeler) {
      refusjonskravetOpphoererStatus('Nei');
    }
  }

  function handleNaturalytelser(jsonData: KvitteringNavNoSchema) {
    if (jsonData.skjema.inntekt.naturalytelser) {
      const ytelser: Array<MottattNaturalytelse> = jsonData.skjema.inntekt.naturalytelser.map((ytelse) => ({
        type: ytelse.naturalytelse,
        bortfallsdato: ytelse.sluttdato,
        verdi: ytelse.verdiBeloep
      }));
      initNaturalytelser(ytelser);
    }
  }

  function handleArbeidsgiverperioder(jsonData: KvitteringNavNoSchema) {
    if (jsonData.skjema.agp?.redusertLoennIAgp) {
      initFullLonnIArbeidsgiverPerioden({
        status: jsonData.skjema.agp.redusertLoennIAgp ? 'Nei' : 'Ja',
        begrunnelse: jsonData.skjema.agp.redusertLoennIAgp.begrunnelse
          ? konverterBegrunnelseFullLonnIArbeidsgiverperiode(jsonData.skjema.agp.redusertLoennIAgp.begrunnelse)
          : undefined,
        utbetalt: jsonData.skjema.agp.redusertLoennIAgp.beloep ?? undefined
      });
    }
    initArbeidsgiverperioder(jsonData.skjema.agp?.perioder);
    harArbeidsgiverperiodenBlittEndret();
  }

  function handleKvitteringInnsendtTidspunkt(jsonData: KvitteringNavNoSchema) {
    if (jsonData.mottatt) {
      setKvitteringInnsendt(jsonData.mottatt);
    }
  }

  function handleTidligereInntektsdata(jsonData: KvitteringNavNoSchema) {
    const beregnetInntekt = jsonData.skjema.inntekt?.beloep;
    setTidligereInntektsdata({
      beløp: beregnetInntekt,
      skjæringstidspunkt: jsonData.skjema.inntekt.inntektsdato as TDateISODate,
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

  if (jsonData.skjema.agp) paakrevdeOpplysninger.push(skjemaVariant.arbeidsgiverperiode as Opplysningstype);
  if (jsonData.skjema.inntekt) paakrevdeOpplysninger.push(skjemaVariant.inntekt as Opplysningstype);
  if (jsonData.skjema.refusjon) paakrevdeOpplysninger.push(skjemaVariant.refusjon as Opplysningstype);
  return paakrevdeOpplysninger;
}
