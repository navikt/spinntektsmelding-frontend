import parseIsoDate from '../utils/parseIsoDate';
import { MottattNaturalytelse, TDateISODate } from './MottattData';
import useBoundStore from './useBoundStore';
import {
  AArsakType,
  InnsendingSkjema,
  PeriodeListe,
  SendtPeriode,
  StillingsEndring,
  Tariffendring
} from './useFyllInnsending';

import { Periode } from './state';
import begrunnelseEndringBruttoinntekt from '../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import skjemaVariant from '../config/skjemavariant';
import { nanoid } from 'nanoid';
import { SkjemaKvitteringEksterntSystem } from './useSkjemadataStore';
import { konverterBegrunnelseFullLonnIArbeidsgiverperiode } from '../utils/konverterBegrunnelseFullLonnIArbeidsgiverperiode';

export interface KvitteringSkjema extends InnsendingSkjema {
  fulltNavn: string;
  virksomhetNavn: string;
  innsenderNavn: string;
  innsenderTelefonNr: string;
  beregnetInntekt?: number;
  tidspunkt?: string;
}

interface KvitteringInit {
  kvitteringEkstern: SkjemaKvitteringEksterntSystem | null;
  kvitteringDokument: KvitteringSkjema | null;
}

export default function useKvitteringInit() {
  const initFravaersperiode = useBoundStore((state) => state.initFravaersperiode);
  const initEgenmeldingsperiode = useBoundStore((state) => state.initEgenmeldingsperiode);
  const initPerson = useBoundStore((state) => state.initPerson);

  const setBestemmendeFravaersdag = useBoundStore((state) => state.setBestemmendeFravaersdag);
  const setBareNyMaanedsinntekt = useBoundStore((state) => state.setBareNyMaanedsinntekt);
  const initFullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.initFullLonnIArbeidsgiverPerioden);

  const oppdaterRefusjonEndringer = useBoundStore((state) => state.oppdaterRefusjonEndringer);

  const initArbeidsgiverperioder = useBoundStore((state) => state.initArbeidsgiverperioder);
  const initLonnISykefravaeret = useBoundStore((state) => state.initLonnISykefravaeret);

  const refusjonskravetOpphoererDato = useBoundStore((state) => state.refusjonskravetOpphoererDato);
  const refusjonskravetOpphoererStatus = useBoundStore((state) => state.refusjonskravetOpphoererStatus);
  const initNaturalytelser = useBoundStore((state) => state.initNaturalytelser);
  const setKvitteringInnsendt = useBoundStore((state) => state.setKvitteringInnsendt);
  const setEndringsaarsak = useBoundStore((state) => state.setEndringsaarsak);
  const setTariffEndringsdato = useBoundStore((state) => state.setTariffEndringsdato);
  const setTariffKjentdato = useBoundStore((state) => state.setTariffKjentdato);
  const setFeriePeriode = useBoundStore((state) => state.setFeriePeriode);
  const setPermisjonPeriode = useBoundStore((state) => state.setPermisjonPeriode);
  const setPermitteringPeriode = useBoundStore((state) => state.setPermitteringPeriode);
  const setNyStillingDato = useBoundStore((state) => state.setNyStillingDato);
  const setNyStillingsprosentDato = useBoundStore((state) => state.setNyStillingsprosentDato);
  const setLonnsendringDato = useBoundStore((state) => state.setLonnsendringDato);
  const setSykefravaerPeriode = useBoundStore((state) => state.setSykefravaerPeriode);
  const harArbeidsgiverperiodenBlittEndret = useBoundStore((state) => state.harArbeidsgiverperiodenBlittEndret);
  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const setPaakrevdeOpplysninger = useBoundStore((state) => state.setPaakrevdeOpplysninger);
  const setTidligereInntektsdata = useBoundStore((state) => state.setTidligereInntektsdata);
  const setInngangFraKvittering = useBoundStore((state) => state.setInngangFraKvittering);
  const setOpprinneligNyMaanedsinntekt = useBoundStore((state) => state.setOpprinneligNyMaanedsinntekt);
  const setSkjemaKvitteringEksterntSystem = useBoundStore((state) => state.setSkjemaKvitteringEksterntSystem);
  const setForeslaattBestemmendeFravaersdag = useBoundStore((state) => state.setForeslaattBestemmendeFravaersdag);
  const initRefusjonskravetOpphoerer = useBoundStore((state) => state.initRefusjonskravetOpphoerer);

  return async (kvitteringsData: KvitteringInit) => {
    let jsonData: KvitteringSkjema;

    if (kvitteringsData.kvitteringEkstern && kvitteringsData.kvitteringEkstern !== null) {
      setSkjemaKvitteringEksterntSystem(kvitteringsData.kvitteringEkstern);
      return;
    }

    if (kvitteringsData.kvitteringDokument && kvitteringsData.kvitteringDokument !== null) {
      jsonData = kvitteringsData.kvitteringDokument!;
    } else {
      jsonData = kvitteringsData as unknown as KvitteringSkjema;
    }

    initFravaersperiode(jsonData.fraværsperioder);
    if (jsonData.egenmeldingsperioder) initEgenmeldingsperiode(jsonData.egenmeldingsperioder);

    const paakrevdeOpplysninger = jsonData.forespurtData;

    if (paakrevdeOpplysninger) {
      setPaakrevdeOpplysninger(paakrevdeOpplysninger);
    }

    setInngangFraKvittering();

    initPerson(
      jsonData.fulltNavn,
      jsonData.identitetsnummer,
      jsonData.orgnrUnderenhet,
      jsonData.virksomhetNavn,
      jsonData.innsenderNavn,
      jsonData.telefonnummer
    );

    const bestemmendeFravaersdag = jsonData.bestemmendeFraværsdag;
    if (bestemmendeFravaersdag) {
      setBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));
      setForeslaattBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));
    }

    if (jsonData.skjaeringstidspunkt) {
      setForeslaattBestemmendeFravaersdag(parseIsoDate(jsonData.skjaeringstidspunkt));
    }

    const beregnetInntekt =
      jsonData.inntekt && jsonData.inntekt.beregnetInntekt
        ? jsonData.inntekt.beregnetInntekt
        : jsonData.beregnetInntekt || 0;

    setBareNyMaanedsinntekt(beregnetInntekt.toString());
    setOpprinneligNyMaanedsinntekt();

    if (jsonData.inntekt.endringÅrsak) {
      const aarsak: Tariffendring | PeriodeListe | StillingsEndring | AArsakType | undefined =
        jsonData.inntekt.endringÅrsak;

      if (aarsak.typpe === 'VarigLonnsendring') {
        //TODO: This is a bug, should be VarigLoennsendring.
        aarsak.typpe = begrunnelseEndringBruttoinntekt.VarigLoennsendring;
      }

      setEndringsaarsak(aarsak.typpe);

      switch (aarsak.typpe) {
        case begrunnelseEndringBruttoinntekt.Tariffendring: {
          if ('gjelderFra' in aarsak) setTariffEndringsdato(parseIsoDate(aarsak.gjelderFra));
          if ('bleKjent' in aarsak) setTariffKjentdato(parseIsoDate(aarsak.bleKjent));
          break;
        }

        case begrunnelseEndringBruttoinntekt.Ferie: {
          if ('liste' in aarsak) {
            const perioder: Array<Periode> = mapPeriodeTilPeriode(aarsak);
            setFeriePeriode(perioder);
          }
          break;
        }
        case begrunnelseEndringBruttoinntekt.VarigLoennsendring: {
          if ('gjelderFra' in aarsak) setLonnsendringDato(parseIsoDate(aarsak.gjelderFra));
          break;
        }

        case begrunnelseEndringBruttoinntekt.Permisjon: {
          if ('liste' in aarsak) {
            const perioder: Array<Periode> = mapPeriodeTilPeriode(aarsak);
            setPermisjonPeriode(perioder);
          }
          break;
        }

        case begrunnelseEndringBruttoinntekt.Permittering: {
          if ('liste' in aarsak) {
            const perioder: Array<Periode> = mapPeriodeTilPeriode(aarsak);
            setPermitteringPeriode(perioder);
          }
          break;
        }

        case begrunnelseEndringBruttoinntekt.NyStilling: {
          if ('gjelderFra' in aarsak) setNyStillingDato(parseIsoDate(aarsak.gjelderFra));
          break;
        }

        case begrunnelseEndringBruttoinntekt.NyStillingsprosent: {
          if ('gjelderFra' in aarsak) setNyStillingsprosentDato(parseIsoDate(aarsak.gjelderFra));
          break;
        }

        case begrunnelseEndringBruttoinntekt.Sykefravaer: {
          if ('liste' in aarsak) {
            const perioder: Array<Periode> = mapPeriodeTilPeriode(aarsak);
            setSykefravaerPeriode(perioder);
          }
          break;
        }
      }
    }

    initLonnISykefravaeret({
      status: jsonData.refusjon.utbetalerHeleEllerDeler ? 'Ja' : 'Nei',
      beloep: jsonData.refusjon.refusjonPrMnd
    });
    const paakrevdeData = hentPaakrevdOpplysningstyper();

    if (paakrevdeData.includes(skjemaVariant.arbeidsgiverperiode) && jsonData.fullLønnIArbeidsgiverPerioden) {
      initFullLonnIArbeidsgiverPerioden({
        status: jsonData.fullLønnIArbeidsgiverPerioden.utbetalerFullLønn ? 'Ja' : 'Nei',
        begrunnelse: jsonData.fullLønnIArbeidsgiverPerioden.begrunnelse
          ? konverterBegrunnelseFullLonnIArbeidsgiverperiode(jsonData.fullLønnIArbeidsgiverPerioden.begrunnelse)
          : undefined,
        utbetalt:
          jsonData.fullLønnIArbeidsgiverPerioden.utbetalt !== undefined
            ? jsonData.fullLønnIArbeidsgiverPerioden.utbetalt
            : undefined
      });
    }

    if (jsonData.refusjon.utbetalerHeleEllerDeler) {
      initRefusjonskravetOpphoerer(
        jsonData.refusjon.refusjonOpphører ? 'Ja' : 'Nei',
        jsonData.refusjon.refusjonOpphører ? parseIsoDate(jsonData.refusjon.refusjonOpphører) : undefined,
        jsonData.refusjon.refusjonEndringer && jsonData.refusjon.refusjonEndringer.length > 0 ? 'Ja' : 'Nei'
      );
    }

    if (jsonData.refusjon.refusjonEndringer) {
      const endringer = jsonData.refusjon.refusjonEndringer.map((endring) => ({
        beloep: endring.beløp,
        dato: parseIsoDate(endring.dato)
      }));
      oppdaterRefusjonEndringer(endringer);
    }

    if (jsonData.refusjon.refusjonOpphører) {
      refusjonskravetOpphoererDato(parseIsoDate(jsonData.refusjon.refusjonOpphører));
      refusjonskravetOpphoererStatus('Ja');
    } else if (jsonData.refusjon.utbetalerHeleEllerDeler) {
      refusjonskravetOpphoererStatus('Nei');
    }

    if (jsonData.naturalytelser) {
      const ytelser: Array<MottattNaturalytelse> = jsonData.naturalytelser.map((ytelse) => ({
        type: ytelse.naturalytelse,
        bortfallsdato: ytelse.dato,
        verdi: ytelse.beløp
      }));

      initNaturalytelser(ytelser);
    }

    initArbeidsgiverperioder(jsonData.arbeidsgiverperioder);

    harArbeidsgiverperiodenBlittEndret();

    if (jsonData.tidspunkt) {
      setKvitteringInnsendt(jsonData.tidspunkt);
    }

    setTidligereInntektsdata({
      beløp: beregnetInntekt,
      skjæringstidspunkt: jsonData.bestemmendeFraværsdag as TDateISODate,
      kilde: 'INNTEKTSMELDING'
    });
  };
}

function mapPeriodeTilPeriode(aarsak: PeriodeListe): Periode[] {
  return aarsak.liste.map((periode: SendtPeriode) => ({
    fom: parseIsoDate(periode.fom),
    tom: parseIsoDate(periode.tom),
    id: nanoid()
  }));
}
