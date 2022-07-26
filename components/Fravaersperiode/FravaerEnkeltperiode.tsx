import { Datepicker } from '@navikt/ds-datepicker';
import { useState } from 'react';
import { IArbeidsforhold, Periode } from '../../state/state';
import formatDate from '../../utils/formatDate';
import formatIsoDate from '../../utils/formatIsoDate';
import ButtonSlette from '../ButtonSlette';
import Heading4 from '../Heading4';
import LabelLabel from '../LabelLabel';
import TextLabel from '../TextLabel';
import localStyles from './Fravaersperiode.module.css';
import styles from '../../styles/Home.module.css';
import { Button, Checkbox } from '@navikt/ds-react';

interface FravaerEnkeltperiodeProps {
  perioder: Array<Periode>;
  arbeidsforhold: IArbeidsforhold;
  sammePeriodeForAlle: boolean;
  setSykemeldingFraDato: (dateValue: string, periodeId: string, arbeidsforholdId: string) => void;
  setSykemeldingTilDato: (dateValue: string, periodeId: string, arbeidsforholdId: string) => void;
  setSammeFravarePaaArbeidsforhold: (event: React.ChangeEvent<HTMLInputElement>, arbeidsforholdId: string) => void;
  clickSlettFravaersperiode: (event: React.MouseEvent<HTMLButtonElement>, periodeId: string) => void;
  clickLeggTilFravaersperiode: (event: React.MouseEvent<HTMLButtonElement>, arbeidsforholdId: string) => void;
  clickTilbakestillFravaersperiode: (event: React.MouseEvent<HTMLButtonElement>, arbeidsforholdId: string) => void;
  clickEndreFravaersperiode: (event: React.MouseEvent<HTMLButtonElement>, arbeidsforholdId: string) => void;
  harFlereArbeidsforhold: boolean;
  forsteArbeidsforhold: boolean;
  flereEnnToArbeidsforhold: boolean;
}

export default function FravaerEnkeltperiode({
  perioder,
  arbeidsforhold,
  sammePeriodeForAlle,
  setSykemeldingFraDato,
  setSykemeldingTilDato,
  setSammeFravarePaaArbeidsforhold,
  clickSlettFravaersperiode,
  clickLeggTilFravaersperiode,
  clickTilbakestillFravaersperiode,
  clickEndreFravaersperiode,
  harFlereArbeidsforhold,
  forsteArbeidsforhold,
  flereEnnToArbeidsforhold
}: FravaerEnkeltperiodeProps) {
  const [endreSykemelding, setEndreSykemelding] = useState<boolean>(false);

  const clickTilbakestillFravaersperiodeHandler = (
    event: React.MouseEvent<HTMLButtonElement>,
    arbeidsforholdId: string
  ) => {
    setEndreSykemelding(!endreSykemelding);

    clickTilbakestillFravaersperiode(event, arbeidsforholdId);
  };

  const clickEndreFravaersperiodeHandler = (event: React.MouseEvent<HTMLButtonElement>, arbeidsforholdId: string) => {
    event.preventDefault();
    clickEndreFravaersperiode(event, arbeidsforholdId);
    setEndreSykemelding(!endreSykemelding);
  };

  return (
    <>
      {harFlereArbeidsforhold && (
        <Heading4 className={localStyles.heading4}>Fravær - {arbeidsforhold.arbeidsforhold}</Heading4>
      )}

      {perioder.map((periode: Periode, periodeIndex) => (
        <div className={styles.periodewrapper} key={periode.id}>
          {!endreSykemelding && (
            <div className={styles.datepickerescape}>
              <TextLabel>Fra</TextLabel>
              <div>{formatDate(periode.fra)}</div>
            </div>
          )}
          {endreSykemelding && (
            <div className={styles.datepickerescape}>
              <LabelLabel htmlFor={`fra-${periode.id}`} className={styles.datepickerlabel}>
                Fra
              </LabelLabel>
              <Datepicker
                inputLabel='Fra'
                inputId={`fra-${periode.id}`}
                onChange={(dateString) =>
                  setSykemeldingFraDato(dateString, periode.id, arbeidsforhold.arbeidsforholdId)
                }
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
              <LabelLabel htmlFor={`til-${periode.id}`} className={styles.datepickerlabel}>
                Til
              </LabelLabel>
              <Datepicker
                inputLabel='Til'
                inputId={`til-${periode.id}`}
                onChange={(dateString) =>
                  setSykemeldingTilDato(dateString, periode.id, arbeidsforhold.arbeidsforholdId)
                }
                locale={'nb'}
                value={formatIsoDate(periode.til)}
              />
            </div>
          )}
          {endreSykemelding && perioder.length > 1 && (
            <div className={styles.endresykemelding}>
              <ButtonSlette
                onClick={(event) => clickSlettFravaersperiode(event, periode.id)}
                title='Slett fraværsperiode'
              />
            </div>
          )}
          {harFlereArbeidsforhold && forsteArbeidsforhold && periodeIndex === perioder.length - 1 && (
            <div>
              {!flereEnnToArbeidsforhold && (
                <Checkbox
                  onChange={(event) => setSammeFravarePaaArbeidsforhold(event, arbeidsforhold.arbeidsforholdId)}
                >
                  Bruk samme for det andre arbeidsforholdet
                </Checkbox>
              )}
              {flereEnnToArbeidsforhold && (
                <Checkbox
                  onChange={(event) => setSammeFravarePaaArbeidsforhold(event, arbeidsforhold.arbeidsforholdId)}
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
          onClick={(event) => clickEndreFravaersperiodeHandler(event, arbeidsforhold.arbeidsforholdId)}
        >
          Endre
        </Button>
      )}
      {endreSykemelding && (
        <div className={styles.endresykemeldingknapper}>
          <Button
            variant='secondary'
            className={styles.kontrollerknapp}
            onClick={(event) => clickLeggTilFravaersperiode(event, arbeidsforhold.arbeidsforholdId)}
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
