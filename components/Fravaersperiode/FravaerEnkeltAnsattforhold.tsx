import { useEffect, useState } from 'react';
import formatDate from '../../utils/formatDate';
import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
import { Button } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';
import { Periode } from '../../state/state';
import Periodevelger from '../Bruttoinntekt/Periodevelger';
import { SkjemaStatus } from '../../state/useSkjemadataStore';
import ButtonEndre from '../ButtonEndre';

interface FravaerEnkeltAnsattforholdProps {
  setIsDirtyForm: (dirty: boolean) => void;
  fravaerPerioder?: Array<Periode>;
  skjemastatus?: SkjemaStatus;
}

export default function FravaerEnkeltAnsattforhold({
  fravaerPerioder,
  skjemastatus,
  setIsDirtyForm
}: Readonly<FravaerEnkeltAnsattforholdProps>) {
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
    if (fravaerPerioder && !fravaerPerioder[0].fom && !endreSykemelding) {
      setEndreSykemelding(true);
    }
  }, [endreSykemelding, fravaerPerioder]);

  const sortertePerioder = fravaerPerioder
    ? [...fravaerPerioder].sort((a, b) => {
        if (a.fom && b.fom) {
          return a.fom.getTime() - b.fom.getTime();
        }
        return 0;
      })
    : [];
  return (
    <>
      {sortertePerioder?.map((periode, periodeIndex) => (
        <div className={styles.periodewrapper} key={periode.id}>
          {!endreSykemelding && (
            <div>
              <div className={styles.datepickerEscape}>
                <TextLabel data-cy={`sykmelding-${periodeIndex}-fra`}>Fra</TextLabel>
                <div data-cy={`sykmelding-${periodeIndex}-fra-dato`}>{formatDate?.(periode.fom)}</div>
              </div>
              <div className={styles.datepickerEscape}>
                <TextLabel data-cy={`sykmelding-${periodeIndex}-til`}>Til</TextLabel>
                <div data-cy={`sykmelding-${periodeIndex}-til-dato`}>{formatDate?.(periode.tom)}</div>
              </div>
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
      {skjemastatus !== SkjemaStatus.SELVBESTEMT && endreSykemelding && (
        <ButtonEndre onClick={(event) => clickEndreFravaersperiodeHandler(event)} />
      )}
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
            variant='tertiary'
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
