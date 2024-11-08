import parseIsoDate from '../utils/parseIsoDate';
import { MottattNaturalytelse, MottattPeriode, TDateISODate } from './MottattData';
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
import finnBestemmendeFravaersdag from '../utils/finnBestemmendeFravaersdag';
import { finnFravaersperioder } from './useEgenmeldingStore';
import { isBefore } from 'date-fns';

interface KvitteringSkjema extends InnsendingSkjema {
  fulltNavn: string;
  virksomhetNavn: string;
  innsenderNavn: string;
  innsenderTelefonNr: string;
  beregnetInntekt?: number;
  tidspunkt?: string;
}

export interface KvitteringInit {
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
  const setEndringAarsakGjelderFra = useBoundStore((state) => state.setEndringAarsakGjelderFra);
  const setEndringAarsakBleKjent = useBoundStore((state) => state.setEndringAarsakBleKjent);
  const setPerioder = useBoundStore((state) => state.setPerioder);
  const harArbeidsgiverperiodenBlittEndret = useBoundStore((state) => state.harArbeidsgiverperiodenBlittEndret);
  const hentPaakrevdOpplysningstyper = useBoundStore((state) => state.hentPaakrevdOpplysningstyper);
  const setPaakrevdeOpplysninger = useBoundStore((state) => state.setPaakrevdeOpplysninger);
  const setTidligereInntektsdata = useBoundStore((state) => state.setTidligereInntektsdata);
  const setInngangFraKvittering = useBoundStore((state) => state.setInngangFraKvittering);
  const setOpprinneligNyMaanedsinntekt = useBoundStore((state) => state.setOpprinneligNyMaanedsinntekt);
  const setSkjemaKvitteringEksterntSystem = useBoundStore((state) => state.setSkjemaKvitteringEksterntSystem);
  const setForeslaattBestemmendeFravaersdag = useBoundStore((state) => state.setForeslaattBestemmendeFravaersdag);
  const initRefusjonskravetOpphoerer = useBoundStore((state) => state.initRefusjonskravetOpphoerer);
  const setSkjaeringstidspunkt = useBoundStore((state) => state.setSkjaeringstidspunkt);

  return async (kvitteringsData: KvitteringInit) => {
    let jsonData: KvitteringSkjema;
    if (!kvitteringsData || (Array.isArray(kvitteringsData) && kvitteringsData.length === 0)) return;

    if (!kvitteringsData.kvitteringDokument && !kvitteringsData.kvitteringEkstern) return;

    if (kvitteringsData.kvitteringEkstern && kvitteringsData.kvitteringEkstern !== null) {
      setSkjemaKvitteringEksterntSystem(kvitteringsData.kvitteringEkstern);
      return;
    }

    if (kvitteringsData.kvitteringDokument && kvitteringsData.kvitteringDokument !== null) {
      jsonData = kvitteringsData.kvitteringDokument!;
    } else {
      jsonData = kvitteringsData as unknown as KvitteringSkjema;
    }
    if (jsonData.fraværsperioder) initFravaersperiode(jsonData.fraværsperioder);
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

    const beregnetInntekt = jsonData.inntekt?.beregnetInntekt ?? jsonData.beregnetInntekt ?? jsonData.beloep ?? 0;

    setBareNyMaanedsinntekt(beregnetInntekt.toString());
    setOpprinneligNyMaanedsinntekt();

    if (jsonData.inntekt?.endringÅrsak) {
      const aarsak: Tariffendring | PeriodeListe | StillingsEndring | AArsakType | undefined =
        jsonData.inntekt.endringÅrsak;
      if (aarsak.typpe === 'VarigLonnsendring') {
        //TODO: This is a bug, should be VarigLoennsendring.
        aarsak.typpe = begrunnelseEndringBruttoinntekt.VarigLoennsendring;
      }

      setEndringsaarsak(aarsak.typpe);

      switch (aarsak.typpe) {
        case begrunnelseEndringBruttoinntekt.Tariffendring: {
          if ('gjelderFra' in aarsak) setEndringAarsakGjelderFra(parseIsoDate(aarsak.gjelderFra));
          if ('bleKjent' in aarsak) setEndringAarsakBleKjent(parseIsoDate(aarsak.bleKjent));
          break;
        }

        case begrunnelseEndringBruttoinntekt.Ferie: {
          if ('liste' in aarsak) {
            const perioder: Array<Periode> = mapPeriodeTilPeriode(aarsak);
            setPerioder(perioder);
          }
          break;
        }
        case begrunnelseEndringBruttoinntekt.VarigLoennsendring: {
          if ('gjelderFra' in aarsak) setEndringAarsakGjelderFra(parseIsoDate(aarsak.gjelderFra));
          break;
        }

        case begrunnelseEndringBruttoinntekt.Permisjon: {
          if ('liste' in aarsak) {
            const perioder: Array<Periode> = mapPeriodeTilPeriode(aarsak);
            setPerioder(perioder);
          }
          break;
        }

        case begrunnelseEndringBruttoinntekt.Permittering: {
          if ('liste' in aarsak) {
            const perioder: Array<Periode> = mapPeriodeTilPeriode(aarsak);
            setPerioder(perioder);
          }
          break;
        }

        case begrunnelseEndringBruttoinntekt.NyStilling: {
          if ('gjelderFra' in aarsak) setEndringAarsakGjelderFra(parseIsoDate(aarsak.gjelderFra));
          break;
        }

        case begrunnelseEndringBruttoinntekt.NyStillingsprosent: {
          if ('gjelderFra' in aarsak) setEndringAarsakGjelderFra(parseIsoDate(aarsak.gjelderFra));
          break;
        }

        case begrunnelseEndringBruttoinntekt.Sykefravaer: {
          if ('liste' in aarsak) {
            const perioder: Array<Periode> = mapPeriodeTilPeriode(aarsak);
            setPerioder(perioder);
          }
          break;
        }
      }
    }

    if (jsonData.inntekt?.endringAarsak) {
      const aarsak = jsonData.inntekt.endringAarsak;

      setEndringsaarsak(aarsak.aarsak);
      if (aarsak.perioder)
        setPerioder(
          aarsak.perioder.map((periode: MottattPeriode) => ({
            fom: parseIsoDate(periode.fom),
            tom: parseIsoDate(periode.tom)
          }))
        );
      if (aarsak.gjelderFra) setEndringAarsakGjelderFra(parseIsoDate(aarsak.gjelderFra));
      if (aarsak.bleKjent) setEndringAarsakBleKjent(parseIsoDate(aarsak.bleKjent));
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

    const sykmeldingPerioder = jsonData.fraværsperioder.map((periode) => ({
      fom: parseIsoDate(periode.fom),
      tom: parseIsoDate(periode.tom)
    }));
    const egenmeldingPerioder = jsonData.egenmeldingsperioder
      ? jsonData.egenmeldingsperioder.map((periode) => ({
          fom: parseIsoDate(periode.fom),
          tom: parseIsoDate(periode.tom)
        }))
      : [];

    const fravaerPerioder = finnFravaersperioder(sykmeldingPerioder, egenmeldingPerioder);

    const arbeidsgiverperioder = jsonData.arbeidsgiverperioder
      ? jsonData.arbeidsgiverperioder.map((periode) => ({
          fom: parseIsoDate(periode.fom),
          tom: parseIsoDate(periode.tom)
        }))
      : [];

    const beregnetBestemmeFravaersdag = finnBestemmendeFravaersdag(fravaerPerioder, arbeidsgiverperioder);

    if (
      beregnetBestemmeFravaersdag &&
      isBefore(parseIsoDate(bestemmendeFravaersdag), parseIsoDate(beregnetBestemmeFravaersdag))
    ) {
      setForeslaattBestemmendeFravaersdag(parseIsoDate(bestemmendeFravaersdag));
      setSkjaeringstidspunkt(bestemmendeFravaersdag as TDateISODate);
    }
  };
}

function mapPeriodeTilPeriode(aarsak: PeriodeListe): Periode[] {
  return aarsak.liste.map((periode: SendtPeriode) => ({
    fom: parseIsoDate(periode.fom),
    tom: parseIsoDate(periode.tom),
    id: nanoid()
  }));
}
