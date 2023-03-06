import formatDate from '../../utils/formatDate';

import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
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

  return (
    <>
      <Heading3 unPadded>Arbeidsgiverperiode</Heading3>
      <ReadMore header='Mer informasjon om arbeidsgiverperioden'>
        Arbeidsgiveren skal vanligvis betale sykepenger i en periode på opptil 16 kalenderdager, også kalt
        arbeidsgiverperioden.{' '}
        <LenkeEksternt href='https://www.nav.no/arbeidsgiver/sykepenger-i-arbeidsgiverperioden#arbeidsgiverperioden'>
          Les mer om hvordan arbeidsgiverperioden beregnes.
        </LenkeEksternt>
      </ReadMore>
      <BodyLong>
        Vi har brukt eventuell egenmelding og sykmeldingsperiode til å estimere et forslag til arbeidsgiverperiode. Hvis
        du mener dette er feil må dere korrigere perioden. Informasjonen brukes til å avgjøre når Nav skal overta
        betaling av sykepenger etter arbeidsgiverperiodens utløp.{' '}
      </BodyLong>
      <div className={lokalStyles.datowrapper}>
        <div>
          {arbeidsgiverperioder &&
            arbeidsgiverperioder.map((periode, periodeIndex) => (
              <div className={styles.periodewrapper} key={periode.id}>
                {!endretArbeidsgiverperiode && (
                  <>
                    <div className={styles.datepickerescape}>
                      <TextLabel data-cy={`arbeidsgiverperiode-${periodeIndex}-fra`}>Fra</TextLabel>
                      <div data-cy={`arbeidsgiverperiode-${periodeIndex}-fra-dato`}>{formatDate(periode.fom)}</div>
                    </div>
                    <div className={styles.datepickerescape}>
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
        </div>
        {!endretArbeidsgiverperiode && (
          <div className={lokalStyles.endreknapp}>
            <ButtonEndre onClick={(event) => clickEndreFravaersperiodeHandler(event)} />
          </div>
        )}
      </div>
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
