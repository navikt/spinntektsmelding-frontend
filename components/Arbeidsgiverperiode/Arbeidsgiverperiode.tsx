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
import SelectBegrunnelse from '../RefusjonArbeidsgiver/SelectBegrunnelse';
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
}

export default function Arbeidsgiverperiode({ arbeidsgiverperioder, setIsDirtyForm }: ArbeidsgiverperiodeProps) {
  const leggTilArbeidsgiverperiode = useBoundStore((state) => state.leggTilArbeidsgiverperiode);
  const slettArbeidsgiverperiode = useBoundStore((state) => state.slettArbeidsgiverperiode);
  const setArbeidsgiverperiodeDato = useBoundStore((state) => state.setArbeidsgiverperiodeDato);
  const endretArbeidsgiverperiode = useBoundStore((state) => state.endretArbeidsgiverperiode);
  const setEndreArbeidsgiverperiode = useBoundStore((state) => state.setEndreArbeidsgiverperiode);
  const visFeilmeldingsTekst = useBoundStore((state) => state.visFeilmeldingsTekst);
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
  const skjemastatus = useBoundStore((state) => state.skjemastatus);
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

    mergeDatePeriods.forEach((periode) => {
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

    mergeDatePeriods.forEach((periode) => {
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
    setArbeidsgiverperiodeDisabled(false);
    tilbakestillArbeidsgiverperiode();
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
    antallDager < 16
      ? `Du har lagt inn arbeidsgiverperiode på ${antallDager} dager. Angi begrunnelse for kort arbeidsgiverperiode hvis dette er korrekt.`
      : '';

  useEffect(() => {
    if (!manuellEndring) {
      return;
    }

    if (arbeidsgiverperioder && arbeidsgiverperioder?.length > 0) {
      setArbeidsgiverperiodeKort(antallDager < 16);
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
    manuellEndring
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
      <LesMer header='Informasjon om arbeidsgiverperioden' open={readMoreOpen} onClick={clickLesMerOpenHandler}>
        Arbeidsgiveren skal vanligvis betale sykepenger i en periode på opptil 16 kalenderdager, også kalt
        arbeidsgiverperioden.{' '}
        <LenkeEksternt
          href='https://www.nav.no/arbeidsgiver/sykepenger-i-arbeidsgiverperioden#arbeidsgiverperioden'
          isHidden={!readMoreOpen}
        >
          Les mer om hvordan arbeidsgiverperioden beregnes.
        </LenkeEksternt>
      </LesMer>
      <BodyLong>
        Vi har brukt eventuell egenmelding og sykmeldingsperiode til å estimere et forslag til arbeidsgiverperiode. Hvis
        du mener dette er feil må dere korrigere perioden. Informasjonen brukes til å avgjøre når Nav skal overta
        betaling av sykepenger etter arbeidsgiverperiodens utløp.{' '}
      </BodyLong>
      {arbeidsgiverperioder?.map((periode, periodeIndex) => (
        <div key={periode.id} className={lokalStyles.datewrapper}>
          {!endretArbeidsgiverperiode && (
            <div className={lokalStyles.endrearbeidsgiverperiode}>
              <div className={lokalStyles.datepickerescape}>
                <TextLabel data-cy={`arbeidsgiverperiode-${periodeIndex}-fra`}>Fra</TextLabel>
                <div
                  data-cy={`arbeidsgiverperiode-${periodeIndex}-fra-dato`}
                  id={`arbeidsgiverperioder[${periodeIndex}].fom`}
                >
                  {formatDate(periode.fom)}
                </div>
              </div>
              <div className={lokalStyles.datepickerescape}>
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
              fomError={visFeilmeldingsTekst(`arbeidsgiverperioder[${periodeIndex}].fom`)}
              tomTekst='Til'
              tomID={`arbeidsgiverperioder[${periodeIndex}].tom`}
              tomError={visFeilmeldingsTekst(`arbeidsgiverperioder[${periodeIndex}].tom`)}
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
              <div className={lokalStyles.datepickerescape}>
                <TextLabel data-cy={`arbeidsgiverperiode-1-fra`}>Fra</TextLabel>
                <div data-cy={`arbeidsgiverperiode-1-fra-dato`} id={`arbeidsgiverperioder[1].fom`}>
                  -
                </div>
              </div>
              <div className={lokalStyles.datepickerescape}>
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
              fomError={visFeilmeldingsTekst(`arbeidsgiverperioder[ny].fom`)}
              tomTekst='Til'
              tomID={`arbeidsgiverperioder[ny].tom`}
              tomError={visFeilmeldingsTekst(`arbeidsgiverperioder[ny].tom`)}
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
        <Feilmelding id='arbeidsgiverperioder-feil'>{visFeilmeldingsTekst('arbeidsgiverperioder-feil')}</Feilmelding>
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
          <div className={lokalStyles.wraputbetaling}>
            <TextField
              className={lokalStyles.refusjonsbeloep}
              label='Utbetalt under arbeidsgiverperiode'
              onChange={addIsDirtyForm((event) => setBeloepUtbetaltUnderArbeidsgiverperioden(event.target.value))}
              id={'lus-uua-input'}
              error={visFeilmeldingsTekst('lus-uua-input')}
              defaultValue={
                !fullLonnIArbeidsgiverPerioden || Number.isNaN(fullLonnIArbeidsgiverPerioden?.utbetalt)
                  ? ''
                  : formatCurrency(fullLonnIArbeidsgiverPerioden.utbetalt)
              }
            />
            <SelectBegrunnelseKortArbeidsgiverperiode
              onChangeBegrunnelse={setBegrunnelseRedusertUtbetaling}
              defaultValue={fullLonnIArbeidsgiverPerioden?.begrunnelse}
              error={visFeilmeldingsTekst('lia-select')}
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
              <SelectBegrunnelse
                onChangeBegrunnelse={setBegrunnelseRedusertUtbetaling}
                defaultValue={fullLonnIArbeidsgiverPerioden?.begrunnelse}
                error={visFeilmeldingsTekst('lia-select')}
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
            className={lokalStyles.leggtilknapp}
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
