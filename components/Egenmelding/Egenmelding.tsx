import { BodyLong, Button, Checkbox } from '@navikt/ds-react';
import styles from '../../styles/Home.module.css';
import localStyles from './Egenmelding.module.css';
import ButtonSlette from '../ButtonSlette/ButtonSlette';
import Heading3 from '../Heading3/Heading3';
import useBoundStore from '../../state/useBoundStore';
import EgenmeldingPeriode from './EgenmeldingPeriode';

export default function Egenmelding() {
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const slettEgenmeldingsperiode = useBoundStore((state) => state.slettEgenmeldingsperiode);
  const leggTilEgenmeldingsperiode = useBoundStore((state) => state.leggTilEgenmeldingsperiode);

  const endreEgenmeldingsperiode = useBoundStore((state) => state.endreEgenmeldingsperiode);
  const setEndreEgenmelding = useBoundStore((state) => state.setEndreEgenmelding);

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
        Dersom den ansatte var fraværende med egenmelding frem til sykmeldingen ble utstedt skal du oppgi første
        fraværsdag med egenmelding i dette feltet.
      </BodyLong>

      <div>
        <div className={localStyles.egenmeldingswrapper}>
          {egenmeldingsperioder &&
            egenmeldingsperioder.map((egenmeldingsperiode, index) => (
              <div key={egenmeldingsperiode.id} className={styles.periodewrapper}>
                <EgenmeldingPeriode periodeId={egenmeldingsperiode.id} egenmeldingsperiode={egenmeldingsperiode} />

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
            <Button
              variant='secondary'
              className={styles.legtilbutton}
              onClick={(e) => clickEndreFravaersperiodeHandler(e)}
            >
              Endre
            </Button>
          </div>
        )}
        {endreEgenmeldingsperiode && (
          <div className={styles.endresykemeldingknapper}>
            <Button
              variant='secondary'
              className={styles.kontrollerknapp}
              onClick={(event) => clickLeggTilFravaersperiodeHandler(event)}
            >
              Legg til egenmeldingsperiode
            </Button>

            <Button
              className={styles.kontrollerknapp}
              onClick={(event) => clickTilbakestillFravaersperiodeHandler(event)}
            >
              Tilbakestill
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
