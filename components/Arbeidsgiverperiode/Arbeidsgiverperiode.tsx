import formatDate from '../../utils/formatDate';

import TextLabel from '../TextLabel';
import { BodyLong, Button, ReadMore } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';
import ButtonEndre from '../ButtonEndre';
import Periodevelger from '../Bruttoinntekt/Periodevelger';
import { Periode } from '../../state/state';
import Heading3 from '../Heading3';
import lokalStyles from './Arbeidsgiverperiode.module.css';
import Feilmelding from '../Feilmelding';
import ButtonTilbakestill from '../ButtonTilbakestill/ButtonTilbakestill';
import LenkeEksternt from '../LenkeEksternt/LenkeEksternt';
import { useState } from 'react';
import LesMer from '../LesMer';
import logEvent from '../../utils/useAmplitude';
import useAmplitude from '../../utils/useAmplitude';

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
  const logEvent = useAmplitude();

  const clickLeggTilFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    leggTilArbeidsgiverperiode();
  };

  const clickEndreFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setEndreArbeidsgiverperiode(!endretArbeidsgiverperiode);
  };

  const clickAngreEndreHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    tilbakestillArbeidsgiverperiode();
  };

  const [readMoreOpen, setReadMoreOpen] = useState<boolean>(false);

  const clickLesMerOpenHandler = () => {
    logEvent(readMoreOpen ? 'readmore lukket' : 'readmore åpnet', {
      tittel: 'Informasjon om arbeidsgiverperioden',
      component: 'Arbeidsgiverperiode'
    });

    setReadMoreOpen(!readMoreOpen);
  };

  return (
    <>
      <Heading3 unPadded>Arbeidsgiverperiode</Heading3>
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
              <>
                <div className={lokalStyles.datepickerescape}>
                  <TextLabel data-cy={`arbeidsgiverperiode-${periodeIndex}-fra`}>Fra</TextLabel>
                  <div data-cy={`arbeidsgiverperiode-${periodeIndex}-fra-dato`}>{formatDate(periode.fom)}</div>
                </div>
                <div className={lokalStyles.datepickerescape}>
                  <TextLabel data-cy={`arbeidsgiverperiode-${periodeIndex}-til`}>Til</TextLabel>
                  <div data-cy={`arbeidsgiverperiode-${periodeIndex}-til-dato`}>{formatDate(periode.tom)}</div>
                </div>
              </>
            )}
            {endretArbeidsgiverperiode && (
              <Periodevelger
                fomTekst='Fra'
                fomID={`arbeidsgiverperiode-fom-${periode.id}`}
                fomError={visFeilmeldingsTekst(`arbeidsgiverperiode-fom-${periode.id}`)}
                tomTekst='Til'
                tomID={`arbeidsgiverperiode-tom-${periode.id}`}
                tomError={visFeilmeldingsTekst(`arbeidsgiverperiode-tom-${periode.id}`)}
                onRangeChange={(oppdatertPeriode) => setArbeidsgiverperiodeDato(oppdatertPeriode, periode.id)}
                defaultRange={periode}
                kanSlettes={periodeIndex > 0}
                periodeId={periodeIndex.toString()}
                onSlettRad={() => slettArbeidsgiverperiode(periode.id)}
                toDate={new Date()}
              />
            )}
          </div>
        ))}

      {!endretArbeidsgiverperiode && (
        <div className={lokalStyles.endreknapp}>
          <ButtonEndre
            onClick={(event) => clickEndreFravaersperiodeHandler(event)}
            data-cy='endre-arbeidsgiverperiode'
          />
        </div>
      )}

      {visFeilmelding('arbeidsgiverperiode-feil') && (
        <Feilmelding id='arbeidsgiverperiode-feil'>{visFeilmeldingsTekst('arbeidsgiverperiode-feil')}</Feilmelding>
      )}
      {endretArbeidsgiverperiode && (
        <div className={lokalStyles.endreknapper}>
          <Button
            variant='secondary'
            className={lokalStyles.leggtilknapp}
            onClick={(event) => clickLeggTilFravaersperiodeHandler(event)}
          >
            Legg til periode
          </Button>
          <ButtonTilbakestill onClick={clickAngreEndreHandler} />
        </div>
      )}
    </>
  );
}
