import { useEffect, useState } from 'react';
import formatDate from '../../utils/formatDate';

import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
import { BodyLong, Button } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';
import ButtonEndre from '../ButtonEndre';
import Periodevelger, { PeriodeParam } from '../Bruttoinntekt/Periodevelger';
import { Periode } from '../../state/state';
import Heading3 from '../Heading3';
import lokalStyles from './Arbeidsgiverperiode.module.css';

interface ArbeidsgiverperiodeProps {
  arbeidsgiverperioder: Array<Periode> | undefined;
}

export default function Arbeidsgiverperiode({ arbeidsgiverperioder }: ArbeidsgiverperiodeProps) {
  const [endreArbeidsgiverperiode, setEndreArbeidsgiverperiode] = useState<boolean>(false);
  const leggTilArbeidsgiverperiode = useBoundStore((state) => state.leggTilArbeidsgiverperiode);
  const slettArbeidsgiverperiode = useBoundStore((state) => state.slettArbeidsgiverperiode);
  const setArbeidsgiverperiodeDato = useBoundStore((state) => state.setArbeidsgiverperiodeDato);

  const clickLeggTilFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    leggTilArbeidsgiverperiode();
  };

  const clickEndreFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setEndreArbeidsgiverperiode(!endreArbeidsgiverperiode);
  };

  return (
    <>
      <Heading3>Arbeidsgiverperiode</Heading3>
      <BodyLong>
        Vi har brukt eventuell egenmelding og sykmeldingsperiode til å estimere et forslag til arbeidsgiverperiode. Hvis
        du mener dette er feil må dere korrigere perioden. Informasjonen brukes til å avgjøre når Nav skal overta
        betaling av sykepenger etter arbeidsgiverperiodens utløp.
      </BodyLong>
      <div className={lokalStyles.datowrapper}>
        <div>
          {arbeidsgiverperioder &&
            arbeidsgiverperioder.map((periode, periodeIndex) => (
              <div className={styles.periodewrapper} key={periodeIndex}>
                {!endreArbeidsgiverperiode && (
                  <>
                    <div className={styles.datepickerescape}>
                      <TextLabel>Fra</TextLabel>
                      <div>{formatDate(periode.fom)}</div>
                    </div>
                    <div className={styles.datepickerescape}>
                      <TextLabel>Til</TextLabel>
                      <div>{formatDate(periode.tom)}</div>
                    </div>
                  </>
                )}
                {endreArbeidsgiverperiode && (
                  <Periodevelger
                    fomTekst='Fra'
                    fomID={`arbeidsgiverperiode-fom-${periode.id}`}
                    tomTekst='Til'
                    tomID={`arbeidsgiverperiode-tom-${periode.id}`}
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
        {!endreArbeidsgiverperiode && (
          <div className={lokalStyles.endreknapp}>
            <ButtonEndre onClick={(event) => clickEndreFravaersperiodeHandler(event)} />
          </div>
        )}
      </div>
      {endreArbeidsgiverperiode && (
        <Button
          variant='secondary'
          className={styles.kontrollerknapp}
          onClick={(event) => clickLeggTilFravaersperiodeHandler(event)}
        >
          Legg til periode
        </Button>
      )}
    </>
  );
}
