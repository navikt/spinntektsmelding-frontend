import formatDate from '../../utils/formatDate';

import TextLabel from '../TextLabel';
import { BodyLong, Button, Checkbox } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';
import ButtonEndre from '../ButtonEndre';
import Periodevelger from '../Bruttoinntekt/Periodevelger';
import { Periode } from '../../state/state';
import Heading3 from '../Heading3';
import lokalStyles from './Arbeidsgiverperiode.module.css';
import Feilmelding from '../Feilmelding';
import ButtonTilbakestill from '../ButtonTilbakestill/ButtonTilbakestill';
import LenkeEksternt from '../LenkeEksternt/LenkeEksternt';
import { useEffect, useState } from 'react';
import LesMer from '../LesMer';
import logEvent from '../../utils/logEvent';
import { differenceInCalendarDays } from 'date-fns';
import SelectBegrunnelse from '../RefusjonArbeidsgiver/SelectBegrunnelse';

interface ArbeidsgiverperiodeProps {
  arbeidsgiverperioder: Array<Periode> | undefined;
}

export default function Arbeidsgiverperiode({ arbeidsgiverperioder }: ArbeidsgiverperiodeProps) {
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
  const arbeidsgiverBetalerFullLonnIArbeidsgiverperioden = useBoundStore(
    (state) => state.arbeidsgiverBetalerFullLonnIArbeidsgiverperioden
  );
  const inngangFraKvittering = useBoundStore((state) => state.inngangFraKvittering);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const amplitudeComponent = 'Arbeidsgiverperiode';

  const [arbeidsgiverperiodeDisabled, setArbeidsgiverperiodeDisabled] = useBoundStore((state) => [
    state.arbeidsgiverperiodeDisabled,
    state.setArbeidsgiverperiodeDisabled
  ]);

  const [manuellEndring, setManuellEndring] = useState<boolean>(false);

  const antallDagerIArbeidsgiverperioder = (perioder: Array<Periode> | undefined) => {
    if (typeof perioder === 'undefined') {
      return 0;
    }

    let dagerTotalt = 0;

    perioder.forEach((periode) => {
      if (dagerTotalt < 16) {
        dagerTotalt = differenceInCalendarDays(periode.tom!, periode.fom!) + dagerTotalt + 1;
      }
    });
    return dagerTotalt;
  };

  const clickSlettArbeidsgiverperiode = (periode: string) => {
    logEvent('knapp klikket', {
      tittel: 'Slett arbeidsgiverperiode',
      component: amplitudeComponent
    });

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

  const [valideringsfeil, setValideringsfeil] = useState<string>('');

  const handleIngenArbeidsgiverperiodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setArbeidsgiverperiodeDisabled(event.target.checked);
    setManuellEndring(true);
    setBeloepUtbetaltUnderArbeidsgiverperioden('0');
    arbeidsgiverBetalerFullLonnIArbeidsgiverperioden('Nei');
    if (event.target.checked === true) {
      slettAlleArbeidsgiverperioder();
    }
  };

  useEffect(() => {
    const antallDager = antallDagerIArbeidsgiverperioder(arbeidsgiverperioder);
    if (antallDager > 16) {
      setValideringsfeil(
        `Arbeidsgiverperioden er oppgitt til ${antallDager} dager, men kan ikke være mer enn 16 dager totalt.`
      );
    } else {
      setValideringsfeil('');
    }
  }, [arbeidsgiverperioder]);

  useEffect(() => {
    if (
      arbeidsgiverperioder?.length === 1 &&
      !arbeidsgiverperioder[0].fom &&
      !arbeidsgiverperioder[0].tom &&
      !manuellEndring
    ) {
      setArbeidsgiverperiodeDisabled(true);
    }
  }, [arbeidsgiverperioder, manuellEndring]);

  useEffect(() => {
    if (inngangFraKvittering && arbeidsgiverperioder?.length === 0) {
      setArbeidsgiverperiodeDisabled(true);
    }
  }, [inngangFraKvittering, arbeidsgiverperioder]);

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

      {arbeidsgiverperioder &&
        arbeidsgiverperioder.map((periode, periodeIndex) => (
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
                onRangeChange={(oppdatertPeriode) => setArbeidsgiverperiodeDato(oppdatertPeriode, periode.id)}
                defaultRange={periode}
                kanSlettes={periodeIndex > 0}
                periodeId={periodeIndex.toString()}
                onSlettRad={() => clickSlettArbeidsgiverperiode(periode.id)}
                toDate={new Date()}
                disabled={arbeidsgiverperiodeDisabled}
              />
            )}
          </div>
        ))}
      {endretArbeidsgiverperiode && (
        <>
          <Checkbox
            value='IngenPeriode'
            onChange={handleIngenArbeidsgiverperiodeChange}
            checked={arbeidsgiverperiodeDisabled}
          >
            Det er ikke arbeidsgiverperiode
          </Checkbox>
          {arbeidsgiverperiodeDisabled && (
            <SelectBegrunnelse
              onChangeBegrunnelse={begrunnelseRedusertUtbetaling}
              defaultValue={fullLonnIArbeidsgiverPerioden?.begrunnelse}
              error={visFeilmeldingsTekst('lia-select')}
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

      {visFeilmelding('arbeidsgiverperiode-feil') && (
        <Feilmelding id='arbeidsgiverperiode-feil'>{visFeilmeldingsTekst('arbeidsgiverperiode-feil')}</Feilmelding>
      )}

      {valideringsfeil.length > 0 && <Feilmelding id='arbeidsgiverperiode-lokal-feil'>{valideringsfeil}</Feilmelding>}
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
