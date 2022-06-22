import { Datepicker } from '@navikt/ds-datepicker';
import { Button } from '@navikt/ds-react';
import { IArbeidsforhold, Periode } from '../../state/state';
import styles from '../../styles/Home.module.css';
import ButtonSlette from '../ButtonSlette/ButtonSlette';
import Heading3 from '../Heading3/Heading3';
import LabelLabel from '../LabelLabel/LabelLabel';

interface EgenmeldingProps {
  egenmeldingsperioder: Array<Periode>;
  arbeidsforhold?: IArbeidsforhold;
  setEgenmeldingFraDato: (dateValue: string, periodeId: string) => void;
  setEgenmeldingTilDato: (dateValue: string, periodeId: string) => void;
  clickSlettEgenmeldingsperiode: (event: React.MouseEvent<HTMLButtonElement>, periodeId: string) => void;
  clickLeggTilEgenmeldingsperiode: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function Egenmelding({
  egenmeldingsperioder,
  arbeidsforhold,
  setEgenmeldingFraDato,
  setEgenmeldingTilDato,
  clickSlettEgenmeldingsperiode,
  clickLeggTilEgenmeldingsperiode
}: EgenmeldingProps) {
  return (
    <>
      <Heading3>Eventuell egenmelding (valgfri)</Heading3>
      <p>
        Dersom den ansatte var fraværende med egenmelding frem til sykmeldingen ble utstedt skal du oppgi første
        fraværsdag med egenmelding i dette feltet.
      </p>
      {egenmeldingsperioder &&
        egenmeldingsperioder.map((egenmeldingsperiode) => {
          return (
            <div key={egenmeldingsperiode.id} className={styles.periodewrapper}>
              <div className={styles.datepickerescape}>
                <LabelLabel htmlFor='datepicker-input-fra-dato' className={styles.datepickerlabel}>
                  Egenmelding fra dato
                </LabelLabel>
                <Datepicker
                  onChange={(dateString) => setEgenmeldingFraDato(dateString, egenmeldingsperiode.id)}
                  inputLabel='Egenmelding fra dato'
                />
              </div>
              <div className={styles.datepickerescape}>
                <LabelLabel htmlFor='datepicker-input-til-dato' className={styles.datepickerlabel}>
                  Egenmelding til dato
                </LabelLabel>
                <Datepicker
                  inputLabel='Egenmelding til dato'
                  inputId='datepicker-input-til-dato'
                  onChange={(dateString) => setEgenmeldingTilDato(dateString, egenmeldingsperiode.id)}
                  locale={'nb'}
                />
              </div>
              <div className={styles.endresykemelding}>
                <ButtonSlette
                  onClick={(event) => clickSlettEgenmeldingsperiode(event, egenmeldingsperiode.id)}
                  title='Slett egenmeldingsperiode'
                />
              </div>
            </div>
          );
        })}
      <div>
        <Button variant='secondary' className={styles.legtilbutton} onClick={clickLeggTilEgenmeldingsperiode}>
          Legg til egenmeldingsperiode
        </Button>
      </div>
    </>
  );
}
