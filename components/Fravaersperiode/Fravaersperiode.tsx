import { Datepicker } from '@navikt/ds-datepicker';
import { Button } from '@navikt/ds-react';
import { useState } from 'react';
import { Periode } from '../../state/state';
import formatDate from '../../utils/formatDate';
import formatIsoDate from '../../utils/formatIsoDate';
import ButtonSlette from '../ButtonSlette/ButtonSlette';
import Heading3 from '../Heading3/Heading3';
import LabelLabel from '../LabelLabel/LabelLabel';

import styles from '../../styles/Home.module.css';
import TextLabel from '../TextLabel/TextLabel';

interface FravaersperiodeProps {
  perioder: Array<Periode>;
  setSykemeldingFraDato: (dateValue: string, periodeId: string) => void;
  setSykemeldingTilDato: (dateValue: string, periodeId: string) => void;
  clickSlettFravaersperiode: (event: React.MouseEvent<HTMLButtonElement>, periodeId: string) => void;
  clickLeggTilFravaersperiode: (event: React.MouseEvent<HTMLButtonElement>) => void;
  clickTilbakestillFravaersperiode: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function Fravaersperiode({
  perioder,
  setSykemeldingFraDato,
  setSykemeldingTilDato,
  clickSlettFravaersperiode,
  clickLeggTilFravaersperiode,
  clickTilbakestillFravaersperiode
}: FravaersperiodeProps) {
  const [endreSykemelding, setEndreSykemelding] = useState<boolean>(false);

  const clickTilbakestillFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    setEndreSykemelding(!endreSykemelding);

    clickTilbakestillFravaersperiode(event);
  };

  return (
    <>
      <Heading3>Fraværsperiode</Heading3>
      <p>
        I følge sykmeldingen var den ansatte sykmeldt i perioden som er ferdigutfylt her. Endre fraværsperiode dersom
        den ansatte vært på jobb noen av dagene eller om den på annen måte ikke er korrekt. Du skal ikke ta med
        eventuelle egenmeldingsdager i dette steget.
      </p>

      {perioder.map((periode) => (
        <div className={styles.periodewrapper} key={periode.id}>
          {!endreSykemelding && (
            <div className={styles.datepickerescape}>
              <TextLabel>Fra</TextLabel>
              <div>{formatDate(periode.fra)}</div>
            </div>
          )}
          {endreSykemelding && (
            <div className={styles.datepickerescape}>
              <LabelLabel htmlFor='datepicker-egenmelding-fra' className={styles.datepickerlabel}>
                Fra
              </LabelLabel>
              <Datepicker
                inputLabel='Fra'
                inputId='datepicker-egenmelding-fra'
                onChange={(dateString) => setSykemeldingFraDato(dateString, periode.id)}
                locale={'nb'}
                value={formatIsoDate(periode.fra)}
              />
            </div>
          )}

          {!endreSykemelding && (
            <div className={styles.datepickerescape}>
              <TextLabel>Til</TextLabel>
              <div>{formatDate(periode.til)}</div>
            </div>
          )}
          {endreSykemelding && (
            <div className={styles.datepickerescape}>
              <LabelLabel htmlFor='datepicker-egenmelding-til' className={styles.datepickerlabel}>
                Til
              </LabelLabel>
              <Datepicker
                inputLabel='Til'
                inputId='datepicker-egenmelding-til'
                onChange={(dateString) => setSykemeldingTilDato(dateString, periode.id)}
                locale={'nb'}
                value={formatIsoDate(periode.til)}
              />
            </div>
          )}
          <div className={styles.endresykemelding}>
            {endreSykemelding && perioder.length > 1 && (
              <ButtonSlette
                onClick={(event) => clickSlettFravaersperiode(event, periode.id)}
                title='Slett fraværsperiode'
              />
            )}
          </div>
        </div>
      ))}
      {!endreSykemelding && (
        <Button
          variant='secondary'
          className={styles.endrebutton}
          onClick={() => setEndreSykemelding(!endreSykemelding)}
        >
          Endre
        </Button>
      )}
      {endreSykemelding && (
        <div className={styles.endresykemeldingknapper}>
          <Button variant='secondary' className={styles.kontrollerknapp} onClick={clickLeggTilFravaersperiode}>
            Legg til periode
          </Button>

          <Button className={styles.kontrollerknapp} onClick={clickTilbakestillFravaersperiodeHandler}>
            Tilbakestill
          </Button>
        </div>
      )}
    </>
  );
}
