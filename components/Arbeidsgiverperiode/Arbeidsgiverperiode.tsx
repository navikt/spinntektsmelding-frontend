import formatDate from '../../utils/formatDate';

import TextLabel from '../TextLabel';
import { Alert, BodyLong, Button, Checkbox, TextField } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';
import ButtonEndre from '../ButtonEndre';
import Periodevelger, { PeriodeParam } from '../Bruttoinntekt/Periodevelger';
import { LonnIArbeidsgiverperioden, Periode } from '../../state/state';
import Heading3 from '../Heading3';
import lokalStyles from './Arbeidsgiverperiode.module.css';
import Feilmelding from '../Feilmelding';
import ButtonTilbakestill from '../ButtonTilbakestill/ButtonTilbakestill';
import LenkeEksternt from '../LenkeEksternt/LenkeEksternt';
import { useEffect, useMemo, useState } from 'react';
import LesMer from '../LesMer';
import logEvent from '../../utils/logEvent';
import { differenceInCalendarDays, differenceInDays } from 'date-fns';
import PeriodeType from '../../config/PeriodeType';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import SelectBegrunnelseKortArbeidsgiverperiode from './SelectBegrunnelseKortArbeidsgiverperiode';
import formatCurrency from '../../utils/formatCurrency';
import {
  finnSammenhengendePeriode,
  finnSammenhengendePeriodeManuellJustering
} from '../../utils/finnArbeidsgiverperiode';
import perioderInneholderHelgeopphold from '../../utils/perioderInneholderHelgeopphold';
import AlertBetvilerArbeidsevne from '../AlertBetvilerArbeidsevne/AlertBetvilerArbeidsevne';

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
  const leggTilArbeidsgiverperiode = useBoundStore((state) => state.leggTilArbeidsgiverperiode);
  const slettArbeidsgiverperiode = useBoundStore((state) => state.slettArbeidsgiverperiode);
  const setArbeidsgiverperiodeDato = useBoundStore((state) => state.setArbeidsgiverperiodeDato);
  const endretArbeidsgiverperiode = useBoundStore((state) => state.endretArbeidsgiverperiode);
  const setEndreArbeidsgiverperiode = useBoundStore((state) => state.setEndreArbeidsgiverperiode);
  const visFeilmeldingTekst = useBoundStore((state) => state.visFeilmeldingTekst);
  const visFeilmelding = useBoundStore((state) => state.visFeilmelding);
  const tilbakestillArbeidsgiverperiode = useBoundStore((state) => state.tilbakestillArbeidsgiverperiode);
  const slettAlleArbeidsgiverperioder = useBoundStore((state) => state.slettAlleArbeidsgiverperioder);
  const setBeloepUtbetaltUnderArbeidsgiverperioden = useBoundStore(
    (state) => state.setBeloepUtbetaltUnderArbeidsgiverperioden
  );
  const begrunnelseRedusertUtbetaling = useBoundStore((state) => state.begrunnelseRedusertUtbetaling);
  const [arbeidsgiverBetalerFullLonnIArbeidsgiverperioden, slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden] =
    useBoundStore((state) => [
      state.arbeidsgiverBetalerFullLonnIArbeidsgiverperioden,
      state.slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden
    ]);
  const inngangFraKvittering = useBoundStore((state) => state.inngangFraKvittering);
  const fullLonnIArbeidsgiverPerioden: LonnIArbeidsgiverperioden | undefined = useBoundStore(
    (state) => state.fullLonnIArbeidsgiverPerioden
  );

  const [manuellEndring, setManuellEndring] = useState<boolean>(false);
  const [advarselOppholdHelg, setAdvarselOppholdHelg] = useState<string>('');
  const amplitudeComponent = 'Arbeidsgiverperiode';

  const [arbeidsgiverperiodeDisabled, setArbeidsgiverperiodeDisabled, setArbeidsgiverperiodeKort] = useBoundStore(
    (state) => [
      state.arbeidsgiverperiodeDisabled,
      state.setArbeidsgiverperiodeDisabled,
      state.setArbeidsgiverperiodeKort
    ]
  );

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
      .filter((periode) => periode.fom && periode.tom)
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

  const [readMoreOpen, setReadMoreOpen] = useState<boolean>(false);

  const clickLesMerOpenHandler = () => {
    logEvent(readMoreOpen ? 'readmore lukket' : 'readmore åpnet', {
      tittel: 'Informasjon om arbeidsgiverperioden',
      component: amplitudeComponent
    });

    setReadMoreOpen(!readMoreOpen);
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
    antallDager < 16 && !arbeidsgiverperiodeDisabled
      ? `Du har lagt inn arbeidsgiverperiode på ${antallDager} dager. Angi begrunnelse for kort arbeidsgiverperiode hvis dette er korrekt.`
      : '';

  useEffect(() => {
    if (skjemastatus === SkjemaStatus.SELVBESTEMT) {
      setArbeidsgiverperiodeKort(antallDager < 16 && !arbeidsgiverperiodeDisabled);
      if (antallDager < 16) {
        arbeidsgiverBetalerFullLonnIArbeidsgiverperioden('Nei');
      } else {
        slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden();
      }
    }
  }, [
    antallDager,
    setArbeidsgiverperiodeKort,
    skjemastatus,
    arbeidsgiverBetalerFullLonnIArbeidsgiverperioden,
    slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden,
    arbeidsgiverperiodeDisabled
  ]);

  useEffect(() => {
    if (!manuellEndring) {
      return;
    }

    if (arbeidsgiverperioder && arbeidsgiverperioder?.length > 0) {
      setArbeidsgiverperiodeKort(antallDager < 16 && !arbeidsgiverperiodeDisabled);
      if (antallDager < 16) {
        arbeidsgiverBetalerFullLonnIArbeidsgiverperioden('Nei');
      } else {
        slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden();
      }
    }

    if (arbeidsgiverperioder && arbeidsgiverperioder?.length > 1) {
      if (perioderInneholderHelgeopphold(arbeidsgiverperioder)) {
        setAdvarselOppholdHelg(
          'Normalt inkluderes lørdag og søndag i arbeidsgiverperioden uansett om arbeid  i helgen har vært planlagt eller ikke. Dere skal kun legge inn opphold i arbeidsgiverperioden i helgen de dagene den ansatte har vært på jobb.'
        );
      } else {
        setAdvarselOppholdHelg('');
      }
    } else {
      setAdvarselOppholdHelg('');
    }
  }, [
    antallDager,
    setArbeidsgiverperiodeKort,
    arbeidsgiverperioder,
    arbeidsgiverBetalerFullLonnIArbeidsgiverperioden,
    slettArbeidsgiverBetalerFullLonnIArbeidsgiverperioden,
    manuellEndring,
    arbeidsgiverperiodeDisabled
  ]);

  useEffect(() => {
    if (inngangFraKvittering && arbeidsgiverperioder?.length === 0) {
      setArbeidsgiverperiodeDisabled(true);
    }
  }, [inngangFraKvittering, arbeidsgiverperioder, setArbeidsgiverperiodeDisabled]);

  const betvilerArbeidsevne = fullLonnIArbeidsgiverPerioden?.begrunnelse === 'BetvilerArbeidsufoerhet';

  return (
    <>
      <Heading3 unPadded id='arbeidsgiverperioder'>
        Arbeidsgiverperiode
      </Heading3>
      <BodyLong>
        Vi har brukt egenmeldinger og sykmeldingsperiode til foreslå en arbeidsgiverperiode. Du kan bruke forslaget
        eller endre til det du mener er riktig periode.
        <LenkeEksternt href='https://www.nav.no/arbeidsgiver/sykepenger-i-arbeidsgiverperioden#arbeidsgiverperioden'>
          Les mer om arbeidsgiverperiode.
        </LenkeEksternt>
      </BodyLong>
      {arbeidsgiverperioder?.map((periode, periodeIndex) => (
        <div key={periode.id} className={lokalStyles.dateWrapper}>
          {!endretArbeidsgiverperiode && (
            <div className={lokalStyles.endrearbeidsgiverperiode}>
              <div className={lokalStyles.datepickerEscape}>
                <TextLabel data-cy={`arbeidsgiverperiode-${periodeIndex}-fra`}>Fra</TextLabel>
                <div
                  data-cy={`arbeidsgiverperiode-${periodeIndex}-fra-dato`}
                  id={`arbeidsgiverperioder[${periodeIndex}].fom`}
                >
                  {formatDate(periode.fom)}
                </div>
              </div>
              <div className={lokalStyles.datepickerEscape}>
                <TextLabel data-cy={`arbeidsgiverperiode-${periodeIndex}-til`}>Til</TextLabel>
                <div
                  data-cy={`arbeidsgiverperiode-${periodeIndex}-til-dato`}
                  id={`arbeidsgiverperioder[${periodeIndex}].tom`}
                >
                  {formatDate(periode.tom)}
                </div>
              </div>
            </div>
          )}
          {endretArbeidsgiverperiode && (
            <Periodevelger
              fomTekst='Fra'
              fomID={`arbeidsgiverperioder[${periodeIndex}].fom`}
              fomError={visFeilmeldingTekst(`arbeidsgiverperioder[${periodeIndex}].fom`)}
              tomTekst='Til'
              tomID={`arbeidsgiverperioder[${periodeIndex}].tom`}
              tomError={visFeilmeldingTekst(`arbeidsgiverperioder[${periodeIndex}].tom`)}
              onRangeChange={(oppdatertPeriode) => setArbeidsgiverperiodeDatofelt(oppdatertPeriode, periode.id)}
              defaultRange={periode}
              kanSlettes={periodeIndex > 0}
              periodeId={periodeIndex.toString()}
              onSlettRad={() => clickSlettArbeidsgiverperiode(periode.id)}
              toDate={new Date()}
              disabled={arbeidsgiverperiodeDisabled}
              defaultMonth={periodeIndex > 0 ? arbeidsgiverperioder?.[periodeIndex - 1].tom : undefined}
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
                <div data-cy={`arbeidsgiverperiode-1-fra-dato`} id={`arbeidsgiverperioder[1].fom`}>
                  -
                </div>
              </div>
              <div className={lokalStyles.datepickerEscape}>
                <TextLabel data-cy={`arbeidsgiverperiode-1-til`}>Til</TextLabel>
                <div data-cy={`arbeidsgiverperiode-1-til-dato`} id={`arbeidsgiverperioder[1].tom`}>
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
              toDate={new Date()}
              disabled={arbeidsgiverperiodeDisabled}
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
        <Feilmelding id='arbeidsgiverperioder-feil'>{visFeilmeldingTekst('arbeidsgiverperioder-feil')}</Feilmelding>
      )}
      {advarselOppholdHelg.length > 0 && (
        <Alert variant='info' id='arbeidsgiverperioder-helg'>
          {advarselOppholdHelg}
        </Alert>
      )}
      {advarselLangPeriode.length > 0 && (
        <Feilmelding id='arbeidsgiverperiode-lokal-feil'>{advarselLangPeriode}</Feilmelding>
      )}
      {advarselKortPeriode.length > 0 && (
        <span className={lokalStyles.arbeidsgiverKortPeriode} id='arbeidsgiverperiode-kort-feil'>
          {advarselKortPeriode}
        </span>
      )}
      {advarselKortPeriode.length > 0 && (
        <>
          <div className={lokalStyles.wrapperUtbetaling}>
            <TextField
              className={lokalStyles.refusjonBeloep}
              label='Utbetalt under arbeidsgiverperiode'
              onChange={addIsDirtyForm((event) => setBeloepUtbetaltUnderArbeidsgiverperioden(event.target.value))}
              id={'agp.redusertLoennIAgp.beloep'}
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
            />
          </div>
          {betvilerArbeidsevne && <AlertBetvilerArbeidsevne />}
        </>
      )}
      {endretArbeidsgiverperiode && (
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
            disabled={arbeidsgiverperiodeDisabled}
          >
            Legg til periode
          </Button>
          <ButtonTilbakestill onClick={clickTilbakestillArbeidsgiverperiodeHandler} />
        </div>
      )}
    </>
  );
}
