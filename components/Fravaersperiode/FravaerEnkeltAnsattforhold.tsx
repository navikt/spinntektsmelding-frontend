import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';

import formatDate from '../../utils/formatDate';

import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
import { Alert, Button } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';
import ButtonEndre from '../ButtonEndre';
import { Periode } from '../../state/state';
import Periodevelger from '../Bruttoinntekt/Periodevelger';
import localStyles from './FravaerEnkeltAnsattforhold.module.css';

interface FravaerEnkeltAnsattforholdProps {
  fravaersperioder?: Array<Periode>;
  startSisteAktivePeriode?: Date;
  setIsDirtyForm: (dirty: boolean) => void;
}

export default function FravaerEnkeltAnsattforhold({
  fravaersperioder,
  setIsDirtyForm,
  startSisteAktivePeriode
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

  const isNotDisabled = (periode: Periode, startSisteAktivePeriode?: Date) => {
    return periode.fom && startSisteAktivePeriode && periode.fom < startSisteAktivePeriode;
  };
  const cx = classNames.bind(localStyles);

  return (
    <>
      {fravaersperioder?.map((periode, periodeIndex) => (
        <div className={styles.periodewrapper} key={periode.id}>
          {!endreSykemelding && (
            <div>
              <div className={styles.datepickerescape}>
                <TextLabel
                  data-cy={`sykmelding-${periodeIndex}-fra`}
                  className={cx({ isDisabled: !isNotDisabled?.(periode, startSisteAktivePeriode) })}
                >
                  Fra
                </TextLabel>
                <div
                  data-cy={`sykmelding-${periodeIndex}-fra-dato`}
                  className={cx({ isDisabled: !isNotDisabled?.(periode, startSisteAktivePeriode) })}
                >
                  {formatDate?.(periode.fom)}
                </div>
              </div>
              <div className={styles.datepickerescape}>
                <TextLabel
                  data-cy={`sykmelding-${periodeIndex}-til`}
                  className={cx({ isDisabled: !isNotDisabled?.(periode, startSisteAktivePeriode) })}
                >
                  Til
                </TextLabel>
                <div
                  data-cy={`sykmelding-${periodeIndex}-til-dato`}
                  className={cx({ isDisabled: !isNotDisabled?.(periode, startSisteAktivePeriode) })}
                >
                  {formatDate?.(periode.tom)}
                </div>
              </div>
              {!isNotDisabled?.(periode, startSisteAktivePeriode) && (
                <div className={localStyles.alertEscape}>
                  <Alert variant='info'>
                    Dere vil motta en separat forespørsel om inntektsmelding for denne perioden.
                  </Alert>
                </div>
              )}
            </div>
          )}
          {endreSykemelding && (
            <Periodevelger
              fomTekst='Fra'
              fomID={`fom-${periode.id}`}
              tomTekst='Til'
              tomID={`tom-${periode.id}`}
              onRangeChange={(oppdatertPeriode) => setFravaersperiodeDato?.(periode.id, oppdatertPeriode)}
              defaultRange={periode}
              kanSlettes={periodeIndex > 0}
              periodeId={periode.id}
              onSlettRad={() => slettFravaersperiode?.(periode.id)}
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
