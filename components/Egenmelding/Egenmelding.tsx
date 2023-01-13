import { BodyLong, Button } from '@navikt/ds-react';
import styles from '../../styles/Home.module.css';
import localStyles from './Egenmelding.module.css';
import ButtonSlette from '../ButtonSlette/ButtonSlette';
import Heading3 from '../Heading3/Heading3';
import useBoundStore from '../../state/useBoundStore';
import EgenmeldingPeriode from './EgenmeldingPeriode';
import ButtonEndre from '../ButtonEndre';
import { useMemo } from 'react';

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

  const endreEgenmeldingsperiode = useBoundStore((state) => state.endreEgenmeldingsperiode);
  const setEndreEgenmelding = useBoundStore((state) => state.setEndreEgenmelding);
  const setEgenmeldingDato = useBoundStore((state) => state.setEgenmeldingDato);

  const tilbakestillEgenmelding = useBoundStore((state) => state.tilbakestillEgenmelding);

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
      <Heading3>Eventuell egenmelding</Heading3>
      <BodyLong>
        Oppgi egenmeldingsperiode hvis den ansatte var fraværende med egenmelding i forkant av sykmeldingen. Oppgi kun
        hele fraværsdager. Hvis den ansatte har hatt flere egenmeldingsperioder med mindre enn 16 dagers mellomrom, skal
        alle disse tas med.
      </BodyLong>

      <div>
        <div className={localStyles.egenmeldingswrapper}>
          {egenmeldingsperioder &&
            egenmeldingsperioder.map((egenmeldingsperiode, index) => (
              <div key={egenmeldingsperiode.id} className={styles.periodewrapper}>
                <EgenmeldingPeriode
                  periodeId={egenmeldingsperiode.id}
                  egenmeldingsperiode={egenmeldingsperiode}
                  endreEgenmeldingsperiode={endreEgenmeldingsperiode}
                  setEgenmeldingDato={setEgenmeldingDato}
                  toDate={forsteFravaersdag || new Date()}
                />

                {index > 0 && (
                  <div className={styles.endresykemelding}>
                    <ButtonSlette
                      onClick={() => slettEgenmeldingsperiode(egenmeldingsperiode.id)}
                      title='Slett egenmeldingsperiode'
                    />
                  </div>
                )}
              </div>
            ))}
        </div>
        {!endreEgenmeldingsperiode && (
          <div>
            <ButtonEndre onClick={clickEndreFravaersperiodeHandler} />
          </div>
        )}
        {endreEgenmeldingsperiode && (
          <div className={styles.endresykemeldingknapper}>
            <Button variant='secondary' className={styles.kontrollerknapp} onClick={clickLeggTilFravaersperiodeHandler}>
              Legg til egenmeldingsperiode
            </Button>

            <Button className={styles.kontrollerknapp} onClick={clickTilbakestillFravaersperiodeHandler}>
              Tilbakestill
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
