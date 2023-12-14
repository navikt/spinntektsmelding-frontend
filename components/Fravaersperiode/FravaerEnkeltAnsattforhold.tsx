import { useEffect, useState } from 'react';
import formatDate from '../../utils/formatDate';

import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
import { Button } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';
import ButtonEndre from '../ButtonEndre';
import { Periode } from '../../state/state';
import Periodevelger from '../Bruttoinntekt/Periodevelger';

interface FravaerEnkeltAnsattforholdProps {
  fravaersperioder: Array<Periode>;
  setIsDirtyForm: (dirty: boolean) => void;
}

export default function FravaerEnkeltAnsattforhold({
  fravaersperioder,
  setIsDirtyForm
}: FravaerEnkeltAnsattforholdProps) {
  const [endreSykemelding, setEndreSykemelding] = useState<boolean>(false);
  const slettFravaersperiode = useBoundStore((state) => state.slettFravaersperiode);
  const leggTilFravaersperiode = useBoundStore((state) => state.leggTilFravaersperiode);
  const tilbakestillFravaersperiode = useBoundStore((state) => state.tilbakestillFravaersperiode);
  const setFravaersperiodeDato = useBoundStore((state) => state.setFravaersperiodeDato);

  const clickTilbakestillFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    tilbakestillFravaersperiode();
  };

  const clickLeggTilFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDirtyForm(true);
    leggTilFravaersperiode();
  };

  const clickEndreFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDirtyForm(true);
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
                  <TextLabel data-cy={`sykmelding-${periodeIndex}-fra`}>Fra</TextLabel>
                  <div data-cy={`sykmelding-${periodeIndex}-fra-dato`}>{formatDate(periode.fom)}</div>
                </div>
                <div className={styles.datepickerescape}>
                  <TextLabel data-cy={`sykmelding-${periodeIndex}-til`}>Til</TextLabel>
                  <div data-cy={`sykmelding-${periodeIndex}-til-dato`}>{formatDate(periode.tom)}</div>
                </div>
              </>
            )}
            {endreSykemelding && (
              <Periodevelger
                fomTekst='Fra'
                fomID={`fom-${periode.id}`}
                tomTekst='Til'
                tomID={`tom-${periode.id}`}
                onRangeChange={(oppdatertPeriode) => setFravaersperiodeDato(periode.id, oppdatertPeriode)}
                defaultRange={periode}
                kanSlettes={periodeIndex > 0}
                periodeId={periode.id}
                onSlettRad={() => slettFravaersperiode(periode.id)}
                toDate={new Date()}
              />
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
