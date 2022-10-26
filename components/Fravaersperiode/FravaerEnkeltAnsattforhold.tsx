import { useState } from 'react';
import { IArbeidsforhold } from '../../state/state';
import formatDate from '../../utils/formatDate';

import ButtonSlette from '../ButtonSlette';
import Heading4 from '../Heading4';

import TextLabel from '../TextLabel';
import localStyles from './Fravaersperiode.module.css';
import styles from '../../styles/Home.module.css';
import { Button, Checkbox } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';
import EnkeltArbeidsforholdPeriode from './EnkeltArbeidsforholdPeriode';

interface FravaerEnkeltAnsattforholdProps {
  arbeidsforhold: IArbeidsforhold;
  harFlereArbeidsforhold: boolean;
  forsteArbeidsforhold: boolean;
  flereEnnToArbeidsforhold: boolean;
}

export default function FravaerEnkeltAnsattforhold({
  arbeidsforhold,
  harFlereArbeidsforhold,
  forsteArbeidsforhold,
  flereEnnToArbeidsforhold
}: FravaerEnkeltAnsattforholdProps) {
  const [endreSykemelding, setEndreSykemelding] = useState<boolean>(false);
  const fravaersperiode = useBoundStore((state) => state.fravaersperiode);
  const slettFravaersperiode = useBoundStore((state) => state.slettFravaersperiode);
  const leggTilFravaersperiode = useBoundStore((state) => state.leggTilFravaersperiode);
  const tilbakestillFravaersperiode = useBoundStore((state) => state.tilbakestillFravaersperiode);
  const setSammeFravarePaaArbeidsforhold = useBoundStore((state) => state.setSammeFravarePaaArbeidsforhold);
  const endreFravaersperiode = useBoundStore((state) => state.endreFravaersperiode);
  const sammePeriodeForAlle = useBoundStore((state) => state.sammeFravaersperiode);

  const clickTilbakestillFravaersperiodeHandler = (
    event: React.MouseEvent<HTMLButtonElement>,
    arbeidsforholdId: string
  ) => {
    event.preventDefault();
    tilbakestillFravaersperiode(arbeidsforholdId);
  };

  const clickLeggTilFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>, arbeidsforholdId: string) => {
    event.preventDefault();
    leggTilFravaersperiode(arbeidsforholdId);
  };

  const clickEndreFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    endreFravaersperiode();
    setEndreSykemelding(!endreSykemelding);
  };

  if (
    !harFlereArbeidsforhold &&
    fravaersperiode?.['arbeidsforholdId'] &&
    !fravaersperiode['arbeidsforholdId'][0].fra &&
    !endreSykemelding
  ) {
    setEndreSykemelding(true);
  }

  return (
    <>
      {harFlereArbeidsforhold && (
        <Heading4 className={localStyles.heading4}>Fravær - {arbeidsforhold.arbeidsforhold}</Heading4>
      )}

      {fravaersperiode?.[arbeidsforhold.arbeidsforholdId] &&
        fravaersperiode[arbeidsforhold.arbeidsforholdId].map((periode, periodeIndex) => (
          <div className={styles.periodewrapper} key={periode.id}>
            {!endreSykemelding && (
              <>
                <div className={styles.datepickerescape}>
                  <TextLabel>Fra</TextLabel>
                  <div>{formatDate(periode.fra)}</div>
                </div>
                <div className={styles.datepickerescape}>
                  <TextLabel>Til</TextLabel>
                  <div>{formatDate(periode.til)}</div>
                </div>
              </>
            )}
            {endreSykemelding && (
              <div className={styles.datepickerescape}>
                <EnkeltArbeidsforholdPeriode
                  periodeId={periode.id}
                  fravaersperiode={periode}
                  arbeidsforholdId={arbeidsforhold.arbeidsforholdId}
                />
              </div>
            )}

            {endreSykemelding && periodeIndex > 0 && (
              <div className={styles.endresykemelding}>
                <ButtonSlette
                  onClick={() => slettFravaersperiode(arbeidsforhold.arbeidsforholdId, periode.id)}
                  title='Slett fraværsperiode'
                />
              </div>
            )}
            {harFlereArbeidsforhold && forsteArbeidsforhold && periodeIndex === 0 && (
              <div className={localStyles.sammeperiode}>
                {!flereEnnToArbeidsforhold && (
                  <Checkbox
                    onChange={(event) =>
                      setSammeFravarePaaArbeidsforhold(arbeidsforhold.arbeidsforholdId, event.currentTarget.checked)
                    }
                    checked={sammePeriodeForAlle}
                  >
                    Bruk samme for det andre arbeidsforholdet
                  </Checkbox>
                )}
                {flereEnnToArbeidsforhold && (
                  <Checkbox
                    onChange={(event) =>
                      setSammeFravarePaaArbeidsforhold(arbeidsforhold.arbeidsforholdId, event.currentTarget.checked)
                    }
                    checked={sammePeriodeForAlle}
                  >
                    Bruk samme for de andre arbeidsforholdene
                  </Checkbox>
                )}
              </div>
            )}
          </div>
        ))}
      {!endreSykemelding && (
        <Button
          variant='secondary'
          className={styles.endrebutton}
          onClick={(event) => clickEndreFravaersperiodeHandler(event)}
        >
          Endre
        </Button>
      )}
      {endreSykemelding && (
        <div className={styles.endresykemeldingknapper}>
          <Button
            variant='secondary'
            className={styles.kontrollerknapp}
            onClick={(event) => clickLeggTilFravaersperiodeHandler(event, arbeidsforhold.arbeidsforholdId)}
          >
            Legg til periode
          </Button>

          <Button
            className={styles.kontrollerknapp}
            onClick={(event) => clickTilbakestillFravaersperiodeHandler(event, arbeidsforhold.arbeidsforholdId)}
          >
            Tilbakestill
          </Button>
        </div>
      )}
    </>
  );
}
