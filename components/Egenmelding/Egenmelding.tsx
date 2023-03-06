import { Alert, BodyLong, Button } from '@navikt/ds-react';
import styles from '../../styles/Home.module.css';
import localStyles from './Egenmelding.module.css';
import Heading3 from '../Heading3/Heading3';
import useBoundStore from '../../state/useBoundStore';
import EgenmeldingPeriode from './EgenmeldingPeriode';
import ButtonEndre from '../ButtonEndre';
import { useMemo } from 'react';
import Feilmelding from '../Feilmelding';

export default function Egenmelding() {
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);

  const forsteFravaersdag = useMemo(
    () =>
      !fravaersperioder
        ? new Date()
        : fravaersperioder
            .map((periode) => periode.fom)
            .reduce(
              (prevDate, curDate) => ((curDate || new Date()) <= (prevDate || new Date()) ? curDate : prevDate),
              new Date()
            ),
    [fravaersperioder]
  );

  const slettEgenmeldingsperiode = useBoundStore((state) => state.slettEgenmeldingsperiode);
  const leggTilEgenmeldingsperiode = useBoundStore((state) => state.leggTilEgenmeldingsperiode);
  const endretArbeidsgiverperiode = useBoundStore((state) => state.endretArbeidsgiverperiode);
  const endreEgenmeldingsperiode = useBoundStore((state) => state.endreEgenmeldingsperiode);
  const setEndreEgenmelding = useBoundStore((state) => state.setEndreEgenmelding);
  const setEgenmeldingDato = useBoundStore((state) => state.setEgenmeldingDato);
  const tilbakestillEgenmelding = useBoundStore((state) => state.tilbakestillEgenmelding);
  const visFeilmeldingsTekst = useBoundStore((state) => state.visFeilmeldingsTekst);
  const visFeilmelding = useBoundStore((state) => state.visFeilmelding);

  const clickLeggTilFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    leggTilEgenmeldingsperiode();
  };

  const clickEndreFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setEndreEgenmelding(!endreEgenmeldingsperiode);
  };

  const clickTilbakestillFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    tilbakestillEgenmelding();
  };

  return (
    <div className={localStyles.egenmeldingswrapper}>
      <Heading3>Egenmelding</Heading3>
      <BodyLong>
        Hvis den ansatte har oppgitt at egenmeldingsdager ble benyttet i forkant av sykmeldingen, er disse
        forhåndsutfylt her og må kontrolleres av dere. Alle egenmeldingsperioder med mindre enn 16 dagers mellomrom før
        sykmeldingen skal inkluderes. Dere kan endre og legge til egenmeldingsperioder.
      </BodyLong>
      {endretArbeidsgiverperiode && (
        <Alert variant='info'>
          Hvis du overstyrer arbeidsgiverperioden er det ikke mulig å også endre eller legge til egenmeldingsperioder.
        </Alert>
      )}

      <div>
        <div className={localStyles.egenmeldingswrapper}>
          {egenmeldingsperioder &&
            egenmeldingsperioder.map((egenmeldingsperiode, index) => (
              <div key={egenmeldingsperiode.id} className={styles.periodewrapper} data-cy='egenmelding'>
                <EgenmeldingPeriode
                  periodeId={egenmeldingsperiode.id}
                  egenmeldingsperiode={egenmeldingsperiode}
                  endreEgenmeldingsperiode={endreEgenmeldingsperiode}
                  setEgenmeldingDato={setEgenmeldingDato}
                  toDate={forsteFravaersdag || new Date()}
                  kanSlettes={index !== 0}
                  onSlettRad={() => slettEgenmeldingsperiode(egenmeldingsperiode.id)}
                  disabled={endretArbeidsgiverperiode}
                />
              </div>
            ))}
        </div>
        {visFeilmelding('egenmeldingsperiode-feil') && (
          <Feilmelding id='egenmeldingsperiode-feil'>{visFeilmeldingsTekst('egenmeldingsperiode-feil')}</Feilmelding>
        )}
        {!endreEgenmeldingsperiode && (
          <div>
            <ButtonEndre onClick={clickEndreFravaersperiodeHandler} disabled={endretArbeidsgiverperiode} />
          </div>
        )}
        {endreEgenmeldingsperiode && (
          <div className={styles.endresykemeldingknapper}>
            <Button
              variant='secondary'
              className={styles.kontrollerknapp}
              onClick={clickLeggTilFravaersperiodeHandler}
              disabled={endretArbeidsgiverperiode}
            >
              Legg til egenmeldingsperiode
            </Button>

            <Button
              className={styles.kontrollerknapp}
              onClick={clickTilbakestillFravaersperiodeHandler}
              disabled={endretArbeidsgiverperiode}
            >
              Tilbakestill
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
