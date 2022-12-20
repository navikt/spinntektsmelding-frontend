import { useEffect, useState } from 'react';
import formatDate from '../../utils/formatDate';

import ButtonSlette from '../ButtonSlette';

import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
import { Button } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';
import EnkeltArbeidsforholdPeriode from './EnkeltArbeidsforholdPeriode';
import ButtonEndre from '../ButtonEndre';
import { Periode } from '../../state/state';

interface FravaerEnkeltAnsattforholdProps {
  fravaersperioder: Array<Periode>;
}

export default function FravaerEnkeltAnsattforhold({ fravaersperioder }: FravaerEnkeltAnsattforholdProps) {
  const [endreSykemelding, setEndreSykemelding] = useState<boolean>(false);
  const slettFravaersperiode = useBoundStore((state) => state.slettFravaersperiode);
  const leggTilFravaersperiode = useBoundStore((state) => state.leggTilFravaersperiode);
  const tilbakestillFravaersperiode = useBoundStore((state) => state.tilbakestillFravaersperiode);

  const clickTilbakestillFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    tilbakestillFravaersperiode();
  };

  const clickLeggTilFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    leggTilFravaersperiode();
  };

  const clickEndreFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setEndreSykemelding(!endreSykemelding);
  };

  useEffect(() => {
    if (fravaersperioder && !fravaersperioder[0].fom && !endreSykemelding) {
      setEndreSykemelding(true);
    }
  }, [endreSykemelding, fravaersperioder]);

  return (
    <>
      {fravaersperioder &&
        fravaersperioder.map((periode, periodeIndex) => (
          <div className={styles.periodewrapper} key={periode.id}>
            {!endreSykemelding && (
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
            {endreSykemelding && (
              <div className={styles.datepickerescape}>
                <EnkeltArbeidsforholdPeriode periodeId={periode.id} fravaersperiode={periode} />
              </div>
            )}

            {endreSykemelding && periodeIndex > 0 && (
              <div className={styles.endresykemelding}>
                <ButtonSlette onClick={() => slettFravaersperiode(periode.id)} title='Slett fraværsperiode' />
              </div>
            )}
          </div>
        ))}
      {endreSykemelding && <ButtonEndre onClick={(event) => clickEndreFravaersperiodeHandler(event)} />}
      {endreSykemelding && (
        <div className={styles.endresykemeldingknapper}>
          <Button
            variant='secondary'
            className={styles.kontrollerknapp}
            onClick={(event) => clickLeggTilFravaersperiodeHandler(event)}
          >
            Legg til periode
          </Button>

          <Button
            className={styles.kontrollerknapp}
            onClick={(event) => clickTilbakestillFravaersperiodeHandler(event)}
          >
            Tilbakestill
          </Button>
        </div>
      )}
    </>
  );
}
