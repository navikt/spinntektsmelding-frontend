import formatDate from '../../utils/formatDate';

import TextLabel from '../TextLabel';
import { Alert, BodyLong, Button, Checkbox } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';
import ButtonEndre from '../ButtonEndre';
import Periodevelger, { PeriodeParam } from '../Bruttoinntekt/Periodevelger';
import { Periode, YesNo } from '../../state/state';
import Heading3 from '../Heading3';
import lokalStyles from './Arbeidsgiverperiode.module.css';
import Feilmelding from '../Feilmelding';
import ButtonTilbakestill from '../ButtonTilbakestill/ButtonTilbakestill';
import LenkeEksternt from '../LenkeEksternt/LenkeEksternt';
import { useEffect, useEffectEvent, useMemo, useState } from 'react';
import logEvent from '../../utils/logEvent';
import { addDays, differenceInCalendarDays, differenceInDays } from 'date-fns';
import PeriodeType from '../../config/PeriodeType';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import SelectBegrunnelseKortArbeidsgiverperiode from './SelectBegrunnelseKortArbeidsgiverperiode';
import formatCurrency from '../../utils/formatCurrency';
import { finnSammenhengendePeriodeManuellJustering } from '../../utils/finnArbeidsgiverperiode';
import perioderInneholderHelgeopphold from '../../utils/perioderInneholderHelgeopphold';
import AlertBetvilerArbeidsevne from '../AlertBetvilerArbeidsevne/AlertBetvilerArbeidsevne';
import { finnSammenhengendePeriode } from '../../utils/finnBestemmendeFravaersdag';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';
import { useShallow } from 'zustand/react/shallow';
import NumberField from '../NumberField/NumberField';

interface ArbeidsgiverperiodeProps {
  arbeidsgiverperioder: Array<Periode> | undefined;
  setIsDirtyForm: (dirty: boolean) => void;
  skjemastatus: SkjemaStatus;
  onTilbakestillArbeidsgiverperiode: () => void;
  skalViseArbeidsgiverperiode: boolean;
}

export default function Arbeidsgiverperiode({
  arbeidsgiverperioder,
  setIsDirtyForm,
  skjemastatus,
  onTilbakestillArbeidsgiverperiode,
  skalViseArbeidsgiverperiode
}: Readonly<ArbeidsgiverperiodeProps>) {
  const {
    leggTilArbeidsgiverperiode,
    slettArbeidsgiverperiode,
    setArbeidsgiverperiodeDato,
    endretArbeidsgiverperiode,
    setEndreArbeidsgiverperiode,
    visFeilmeldingTekst,
    visFeilmelding,
    tilbakestillArbeidsgiverperiode,
    slettAlleArbeidsgiverperioder,
    setBeloepUtbetaltUnderArbeidsgiverperioden,
    begrunnelseRedusertUtbetaling,
    arbeidsgiverBetalerFullLonnIArbeidsgiverperioden,
    slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden,
    inngangFraKvittering,
    fullLonnIArbeidsgiverPerioden,
    arbeidsgiverperiodeDisabled,
    setArbeidsgiverperiodeDisabled,
    setArbeidsgiverperiodeKort,
    sykmeldingsperioder
  } = useBoundStore(
    useShallow((state) => ({
      leggTilArbeidsgiverperiode: state.leggTilArbeidsgiverperiode,
      slettArbeidsgiverperiode: state.slettArbeidsgiverperiode,
      setArbeidsgiverperiodeDato: state.setArbeidsgiverperiodeDato,
      endretArbeidsgiverperiode: state.endretArbeidsgiverperiode,
      setEndreArbeidsgiverperiode: state.setEndreArbeidsgiverperiode,
      visFeilmeldingTekst: state.visFeilmeldingTekst,
      visFeilmelding: state.visFeilmelding,
      tilbakestillArbeidsgiverperiode: state.tilbakestillArbeidsgiverperiode,
      slettAlleArbeidsgiverperioder: state.slettAlleArbeidsgiverperioder,
      setBeloepUtbetaltUnderArbeidsgiverperioden: state.setBeloepUtbetaltUnderArbeidsgiverperioden,
      begrunnelseRedusertUtbetaling: state.begrunnelseRedusertUtbetaling,
      arbeidsgiverBetalerFullLonnIArbeidsgiverperioden: state.arbeidsgiverBetalerFullLonnIArbeidsgiverperioden,
      slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden:
        state.slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden,
      inngangFraKvittering: state.inngangFraKvittering,
      fullLonnIArbeidsgiverPerioden: state.fullLonnIArbeidsgiverPerioden,
      arbeidsgiverperiodeDisabled: state.arbeidsgiverperiodeDisabled,
      setArbeidsgiverperiodeDisabled: state.setArbeidsgiverperiodeDisabled,
      setArbeidsgiverperiodeKort: state.setArbeidsgiverperiodeKort,
      sykmeldingsperioder: state.sykmeldingsperioder
    }))
  );

  const [manuellEndring, setManuellEndring] = useState<boolean>(false);

  const amplitudeComponent = 'Arbeidsgiverperiode';

  const addIsDirtyForm = (func: (event: React.ChangeEvent<HTMLInputElement>) => void) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsDirtyForm(true);
      func(event);
    };
  };

  const antallDagerIArbeidsgiverperioderManuellJustering = (perioder: Array<Periode> | undefined) => {
    if (typeof perioder === 'undefined') {
      return 0;
    }

    if (perioder.length === 0) {
      return 0;
    }

    let dagerTotalt = 0;

    const mergeDatePeriods = finnSammenhengendePeriodeManuellJustering(perioder);

    if (mergeDatePeriods.length === 0) {
      return 0;
    }

    mergeDatePeriods
      .filter((periode) => periode.fom && periode.tom)
      .forEach((periode) => {
        const justering = periode.fom === periode.tom ? 0 : 1;
        dagerTotalt = differenceInDays(periode.tom!, periode.fom!) + dagerTotalt + justering;
      });
    return dagerTotalt;
  };

  const antallDagerIArbeidsgiverperioder = (perioder: Array<Periode> | undefined) => {
    if (typeof perioder === 'undefined') {
      return 0;
    }

    let dagerTotalt = 0;

    const mergeDatePeriods = finnSammenhengendePeriode(perioder);

    if (mergeDatePeriods.length === 0) {
      return 0;
    }

    mergeDatePeriods
      .filter((periode) => periode?.fom && periode?.tom)
      .forEach((periode) => {
        const justering = periode.fom === periode.tom ? 0 : 1;
        dagerTotalt = differenceInCalendarDays(periode.tom!, periode.fom!) + dagerTotalt + justering;
      });
    return dagerTotalt;
  };

  const clickSlettArbeidsgiverperiode = (periode: string) => {
    logEvent('knapp klikket', {
      tittel: 'Slett arbeidsgiverperiode',
      component: amplitudeComponent
    });
    setIsDirtyForm(true);
    slettArbeidsgiverperiode(periode);
  };

  const clickLeggTilArbeidsgiverperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    logEvent('knapp klikket', {
      tittel: 'Legg til arbeidsgiverperiode',
      component: amplitudeComponent
    });

    leggTilArbeidsgiverperiode();
  };

  const clickEndreArbeidsgiverperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    setManuellEndring(true);
    event.preventDefault();

    logEvent('knapp klikket', {
      tittel: 'Endre arbeidsgiverperiode',
      component: amplitudeComponent
    });

    setEndreArbeidsgiverperiode(!endretArbeidsgiverperiode);
  };

  const clickTilbakestillArbeidsgiverperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    logEvent('knapp klikket', {
      tittel: 'Tilbakestill arbeidsgiverperiode',
      component: amplitudeComponent
    });
    if (!skalViseArbeidsgiverperiode) {
      setArbeidsgiverperiodeDisabled(false);
      tilbakestillArbeidsgiverperiode();
    } else {
      onTilbakestillArbeidsgiverperiode();
    }
  };

  const setArbeidsgiverperiodeDatofelt = (periode: PeriodeParam | undefined, periodeIndex: string) => {
    setIsDirtyForm(true);
    setArbeidsgiverperiodeDato(periode, periodeIndex);
  };

  const handleIngenArbeidsgiverperiodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setArbeidsgiverperiodeDisabled(event.target.checked);

    if (event.target.checked === true) {
      setBeloepUtbetaltUnderArbeidsgiverperioden('0');
      arbeidsgiverBetalerFullLonnIArbeidsgiverperioden('Nei');
      slettAlleArbeidsgiverperioder();
    } else {
      setBeloepUtbetaltUnderArbeidsgiverperioden(undefined);
      slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden();
      setArbeidsgiverperiodeDisabled(false);
      if (skjemastatus !== SkjemaStatus.SELVBESTEMT) tilbakestillArbeidsgiverperiode();
      begrunnelseRedusertUtbetaling(undefined);
    }
    setIsDirtyForm(true);
  };

  const setBegrunnelseRedusertUtbetaling = (begrunnelse: string | undefined) => {
    begrunnelseRedusertUtbetaling(begrunnelse);
    setIsDirtyForm(true);
  };

  const antallDager = useMemo(
    () =>
      manuellEndring
        ? antallDagerIArbeidsgiverperioderManuellJustering(arbeidsgiverperioder)
        : antallDagerIArbeidsgiverperioder(arbeidsgiverperioder),
    [arbeidsgiverperioder, manuellEndring]
  );

  const advarselLangPeriode =
    antallDager > 16
      ? `Arbeidsgiverperioden er oppgitt til ${antallDager} dager, men kan ikke være mer enn 16 dager totalt.`
      : '';

  const advarselKortPeriode =
    antallDager < 16
      ? `Du har lagt inn arbeidsgiverperiode på ${antallDager} dager. Angi begrunnelse for kort arbeidsgiverperiode hvis dette er korrekt.`
      : '';

  const onArbeidsgiverBetalerFullLonnIArbeidsgiverperioden = useEffectEvent((value: YesNo) => {
    arbeidsgiverBetalerFullLonnIArbeidsgiverperioden(value);
  });

  const onSlettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden = useEffectEvent(() => {
    slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden();
  });

  const onSetArbeidsgiverperiodeKort = useEffectEvent((disabled: boolean) => {
    setArbeidsgiverperiodeKort(disabled);
  });

  const onSetArbeidsgiverperiodeDisabled = useEffectEvent((disabled: boolean) => {
    setArbeidsgiverperiodeDisabled(disabled);
  });

  useEffect(() => {
    if (skjemastatus === SkjemaStatus.SELVBESTEMT) {
      onSetArbeidsgiverperiodeKort(antallDager < 16 && !arbeidsgiverperiodeDisabled);
      if (antallDager < 16) {
        onArbeidsgiverBetalerFullLonnIArbeidsgiverperioden('Nei');
      } else {
        onSlettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden();
      }
    }
  }, [antallDager, skjemastatus, arbeidsgiverperiodeDisabled]);

  useEffect(() => {
    if (arbeidsgiverperioder && arbeidsgiverperioder?.length > 0) {
      onSetArbeidsgiverperiodeKort(antallDager < 16);
    }
    if (!manuellEndring) {
      return;
    }

    if (arbeidsgiverperioder && arbeidsgiverperioder?.length > 0) {
      if (antallDager < 16) {
        onArbeidsgiverBetalerFullLonnIArbeidsgiverperioden('Nei');
      } else {
        onSlettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden();
      }
    }
  }, [antallDager, arbeidsgiverperioder, manuellEndring, arbeidsgiverperiodeDisabled]);

  const advarselOppholdHelg = useMemo(() => {
    if (arbeidsgiverperioder && arbeidsgiverperioder?.length > 1) {
      if (perioderInneholderHelgeopphold(arbeidsgiverperioder)) {
        return 'Normalt inkluderes lørdag og søndag i arbeidsgiverperioden uansett om arbeid  i helgen har vært planlagt eller ikke. Du skal kun legge inn opphold i arbeidsgiverperioden i helgen de dagene den ansatte har vært på jobb.';
      }
    }
    return '';
  }, [arbeidsgiverperioder]);

  useEffect(() => {
    if (inngangFraKvittering && arbeidsgiverperioder?.length === 0) {
      onSetArbeidsgiverperiodeDisabled(true);
    }
  }, [inngangFraKvittering, arbeidsgiverperioder]);

  const betvilerArbeidsevne = fullLonnIArbeidsgiverPerioden?.begrunnelse === 'BetvilerArbeidsufoerhet';

  const minFomDate = useMemo(() => {
    if (skalViseArbeidsgiverperiode) {
      return sykmeldingsperioder && sykmeldingsperioder.length > 0
        ? addDays(sykmeldingsperioder[0].fom!, 1)
        : undefined;
    }
    return undefined;
  }, [skalViseArbeidsgiverperiode, sykmeldingsperioder]);

  const maxTomDate = useMemo(() => {
    if (skalViseArbeidsgiverperiode) {
      return sykmeldingsperioder && sykmeldingsperioder.length > 0
        ? sykmeldingsperioder[sykmeldingsperioder.length - 1].tom!
        : undefined;
    }
    return undefined;
  }, [skalViseArbeidsgiverperiode, sykmeldingsperioder]);

  return (
    <>
      <Heading3 unPadded id='arbeidsgiverperioder'>
        Arbeidsgiverperiode
      </Heading3>
      {!skalViseArbeidsgiverperiode && (
        <BodyLong>
          Vi har brukt egenmeldinger og sykmeldingsperiode til å foreslå en arbeidsgiverperiode. Hvis dette er feil må
          du endre perioden.{' '}
          <LenkeEksternt href='https://www.nav.no/arbeidsgiver/sykepenger-i-arbeidsgiverperioden#arbeidsgiverperioden'>
            Les mer om arbeidsgiverperiode og hvordan denne beregnes.
          </LenkeEksternt>
        </BodyLong>
      )}
      {skalViseArbeidsgiverperiode && (
        <>
          <BodyLong>
            Vi trenger ikke informasjon om arbeidsgiverperioden for denne sykmeldingen. Sykemeldingen er en forlengelse
            av en tidligere sykeperiode. Hvis du mener dette er feil og at det skal være arbeidsgiverperiode kan du
            endre dette.
          </BodyLong>
          <Alert variant='info' className={lokalStyles.infoAlert}>
            <p>
              Arbeidsgiverperiode skal fylles ut hvis sykmeldt har arbeidet i sykmeldingsperioden slik at første dag med
              sykefravær er mer enn 16 dager etter forrige sykefravær.
            </p>
            <p>
              Hvis arbeidsgiverperioden er den samme som tidligere sykmeldingsperiode så skal arbeidsgiverperioden ikke
              fylles ut. Da skal inntekstmeldingen sendes uten arbeidsgiverperiode.
            </p>
          </Alert>
        </>
      )}
      {arbeidsgiverperioder?.map((periode, periodeIndex) => (
        <div key={periode.id} className={lokalStyles.dateWrapper}>
          {!endretArbeidsgiverperiode && (
            <div className={lokalStyles.endrearbeidsgiverperiode}>
              <div className={lokalStyles.datepickerEscape}>
                <TextLabel data-cy={`arbeidsgiverperiode-${periodeIndex}-fra`}>Fra</TextLabel>
                <div
                  data-cy={`arbeidsgiverperiode-${periodeIndex}-fra-dato`}
                  id={ensureValidHtmlId(`agp.perioder.${periodeIndex}.fom`)}
                >
                  {formatDate(periode.fom)}
                </div>
              </div>
              <div className={lokalStyles.datepickerEscape}>
                <TextLabel data-cy={`arbeidsgiverperiode-${periodeIndex}-til`}>Til</TextLabel>
                <div
                  data-cy={`arbeidsgiverperiode-${periodeIndex}-til-dato`}
                  id={ensureValidHtmlId(`agp.perioder.${periodeIndex}.tom`)}
                >
                  {formatDate(periode.tom)}
                </div>
              </div>
            </div>
          )}
          {endretArbeidsgiverperiode && (
            <Periodevelger
              fomTekst='Fra'
              fomID={`agp.perioder.${periodeIndex}.fom`}
              fomError={visFeilmeldingTekst(`agp.perioder.${periodeIndex}.fom`)}
              tomTekst='Til'
              tomID={`agp.perioder.${periodeIndex}.tom`}
              tomError={visFeilmeldingTekst(`agp.perioder.${periodeIndex}.tom`)}
              onRangeChange={(oppdatertPeriode) => setArbeidsgiverperiodeDatofelt(oppdatertPeriode, periode.id)}
              defaultRange={periode}
              kanSlettes={periodeIndex > 0}
              periodeId={periodeIndex.toString()}
              onSlettRad={() => clickSlettArbeidsgiverperiode(periode.id)}
              toDate={maxTomDate ?? new Date()}
              fromDate={minFomDate}
              defaultMonth={
                periodeIndex > 0
                  ? arbeidsgiverperioder?.[periodeIndex - 1].tom
                  : (sykmeldingsperioder?.[0].fom ?? undefined)
              }
            />
          )}
        </div>
      ))}
      {(!arbeidsgiverperioder || arbeidsgiverperioder?.length === 0) && (
        <>
          {!endretArbeidsgiverperiode && (
            <div className={lokalStyles.endrearbeidsgiverperiode}>
              <div className={lokalStyles.datepickerEscape}>
                <TextLabel data-cy={`arbeidsgiverperiode-1-fra`}>Fra</TextLabel>
                <div data-cy={`arbeidsgiverperiode-1-fra-dato`} id={ensureValidHtmlId(`arbeidsgiverperioder[1].fom`)}>
                  -
                </div>
              </div>
              <div className={lokalStyles.datepickerEscape}>
                <TextLabel data-cy={`arbeidsgiverperiode-1-til`}>Til</TextLabel>
                <div data-cy={`arbeidsgiverperiode-1-til-dato`} id={ensureValidHtmlId(`arbeidsgiverperioder[1].tom`)}>
                  -
                </div>
              </div>
            </div>
          )}
          {endretArbeidsgiverperiode && (
            <Periodevelger
              fomTekst='Fra'
              fomID={`arbeidsgiverperioder[ny].fom`}
              fomError={visFeilmeldingTekst(`arbeidsgiverperioder[ny].fom`)}
              tomTekst='Til'
              tomID={`arbeidsgiverperioder[ny].tom`}
              tomError={visFeilmeldingTekst(`arbeidsgiverperioder[ny].tom`)}
              onRangeChange={(oppdatertPeriode) =>
                setArbeidsgiverperiodeDatofelt(oppdatertPeriode, PeriodeType.NY_PERIODE)
              }
              kanSlettes={false}
              periodeId={PeriodeType.NY_PERIODE.toString()}
              onSlettRad={() => clickSlettArbeidsgiverperiode(PeriodeType.NY_PERIODE)}
              toDate={maxTomDate ?? new Date()}
              disabled={arbeidsgiverperiodeDisabled}
              defaultMonth={sykmeldingsperioder?.[0].fom ?? undefined}
              fromDate={minFomDate}
            />
          )}
        </>
      )}
      {!endretArbeidsgiverperiode && (
        <div className={lokalStyles.endreknapp}>
          <ButtonEndre
            onClick={(event) => clickEndreArbeidsgiverperiodeHandler(event)}
            data-cy='endre-arbeidsgiverperiode'
          />
        </div>
      )}
      {visFeilmelding('arbeidsgiverperioder-feil') && (
        <Feilmelding id={ensureValidHtmlId('arbeidsgiverperioder-feil')}>
          {visFeilmeldingTekst('arbeidsgiverperioder-feil')}
        </Feilmelding>
      )}
      {advarselOppholdHelg.length > 0 && (
        <Alert variant='info' id={ensureValidHtmlId('arbeidsgiverperioder-helg')}>
          {advarselOppholdHelg}
        </Alert>
      )}
      {advarselLangPeriode.length > 0 && (
        <Feilmelding id={ensureValidHtmlId('arbeidsgiverperiode-lokal-feil')}>{advarselLangPeriode}</Feilmelding>
      )}
      {visFeilmelding('agp.perioder') && (
        <Feilmelding id={ensureValidHtmlId('agp.perioder')}>{visFeilmeldingTekst('agp.perioder')}</Feilmelding>
      )}
      {advarselKortPeriode.length > 0 && (
        <span className={lokalStyles.arbeidsgiverKortPeriode} id={ensureValidHtmlId('arbeidsgiverperiode-kort-feil')}>
          {advarselKortPeriode}
        </span>
      )}
      {advarselKortPeriode.length > 0 && !arbeidsgiverperiodeDisabled && (
        <>
          <div className={lokalStyles.wrapperUtbetaling}>
            <NumberField
              className={lokalStyles.refusjonBeloep}
              label='Utbetalt under arbeidsgiverperiode'
              onChange={addIsDirtyForm((event) => setBeloepUtbetaltUnderArbeidsgiverperioden(event.target.value))}
              id={ensureValidHtmlId('agp.redusertLoennIAgp.beloep')}
              error={visFeilmeldingTekst('agp.redusertLoennIAgp.beloep')}
              defaultValue={
                !fullLonnIArbeidsgiverPerioden || Number.isNaN(fullLonnIArbeidsgiverPerioden?.utbetalt)
                  ? ''
                  : formatCurrency(fullLonnIArbeidsgiverPerioden.utbetalt)
              }
            />
            <SelectBegrunnelseKortArbeidsgiverperiode
              onChangeBegrunnelse={setBegrunnelseRedusertUtbetaling}
              defaultValue={fullLonnIArbeidsgiverPerioden?.begrunnelse}
              error={visFeilmeldingTekst('agp.redusertLoennIAgp.begrunnelse')}
              ikkeAgp={arbeidsgiverperiodeDisabled}
            />
          </div>
          {betvilerArbeidsevne && <AlertBetvilerArbeidsevne />}
        </>
      )}
      {endretArbeidsgiverperiode && !skalViseArbeidsgiverperiode && (
        <>
          <Checkbox
            value='IngenPeriode'
            onChange={handleIngenArbeidsgiverperiodeChange}
            checked={arbeidsgiverperiodeDisabled}
          >
            Det er ikke arbeidsgiverperiode i dette sykefraværet
          </Checkbox>
          {arbeidsgiverperiodeDisabled && (
            <>
              <SelectBegrunnelseKortArbeidsgiverperiode
                onChangeBegrunnelse={setBegrunnelseRedusertUtbetaling}
                defaultValue={fullLonnIArbeidsgiverPerioden?.begrunnelse}
                error={visFeilmeldingTekst('agp.redusertLoennIAgp.begrunnelse')}
                label='Velg begrunnelse'
                ikkeAgp={arbeidsgiverperiodeDisabled}
              />
              {betvilerArbeidsevne && <AlertBetvilerArbeidsevne />}
            </>
          )}
        </>
      )}

      {endretArbeidsgiverperiode && (
        <div className={lokalStyles.endreknapper}>
          <Button
            variant='secondary'
            className={lokalStyles.leggTilKnapp}
            onClick={(event) => clickLeggTilArbeidsgiverperiodeHandler(event)}
          >
            Legg til periode
          </Button>
          <ButtonTilbakestill onClick={clickTilbakestillArbeidsgiverperiodeHandler} />
        </div>
      )}
    </>
  );
}
