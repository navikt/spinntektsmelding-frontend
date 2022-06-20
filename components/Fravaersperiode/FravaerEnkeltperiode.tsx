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
  setSykemeldingFraDato: (dateValue: string, periodeId: string, arbeidsforholdId: string) => void;
  setSykemeldingTilDato: (dateValue: string, periodeId: string, arbeidsforholdId: string) => void;
  clickSlettFravaersperiode: (event: React.MouseEvent<HTMLButtonElement>, periodeId: string) => void;
  clickLeggTilFravaersperiode: (event: React.MouseEvent<HTMLButtonElement>, arbeidsforholdId: string) => void;
  clickTilbakestillFravaersperiode: (event: React.MouseEvent<HTMLButtonElement>, arbeidsforholdId: string) => void;
  harFlereArbeidsforhold: boolean;
  forsteArbeidsforhold: boolean;
  flereEnnToArbeidsforhold: boolean;
}

export default function FravaerEnkeltperiode({
  perioder,
  arbeidsforhold,
  setSykemeldingFraDato,
  setSykemeldingTilDato,
  clickSlettFravaersperiode,
  clickLeggTilFravaersperiode,
  clickTilbakestillFravaersperiode,
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
              <LabelLabel htmlFor='datepicker-egenmelding-fra' className={styles.datepickerlabel}>
                Fra
              </LabelLabel>
              <Datepicker
                inputLabel='Fra'
                inputId='datepicker-egenmelding-fra'
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
              <LabelLabel htmlFor='datepicker-egenmelding-til' className={styles.datepickerlabel}>
                Til
              </LabelLabel>
              <Datepicker
                inputLabel='Til'
                inputId='datepicker-egenmelding-til'
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
              {!flereEnnToArbeidsforhold && <Checkbox>Bruk samme for det andre arbeidsforholdet</Checkbox>}
              {flereEnnToArbeidsforhold && <Checkbox>Bruk samme for de andre arbeidsforholdene</Checkbox>}
            </div>
          )}
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
