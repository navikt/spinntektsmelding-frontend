import { Datepicker } from '@navikt/ds-datepicker';
import { BodyLong, Radio, RadioGroup, Select, TextField } from '@navikt/ds-react';
import Heading3 from '../Heading3';
import LabelLabel from '../LabelLabel';
import styles from '../../styles/Home.module.css';
import {
  IArbeidsforhold,
  LonnIArbeidsgiverperioden,
  LonnISykefravaeret,
  RefusjonskravetOpphoerer
} from '../../state/state';
import Heading4 from '../Heading4';
import localStyles from './RefusjonArbeidsgiver.module.css';

interface RefusjonArbeidsgiverProps {
  clickArbeidsgiverBetalerFullLonnIArbeidsgiverperioden: (
    event: React.MouseEvent<HTMLInputElement>,
    arbeidsforholdId: string
  ) => void;
  clickArbeidsgiverBetalerHeleEllerDeler: (event: React.MouseEvent<HTMLInputElement>, arbeidsforholdId: string) => void;
  clickRefusjonskravetOpphoerer: (event: React.MouseEvent<HTMLInputElement>, arbeidsforholdId: string) => void;
  setRefusjonskravOpphoersdato: (dateValue: string, arbeidsforholdId: string) => void;
  onChangeBegrunnelseRedusertUtbetaling: (
    event: React.ChangeEvent<HTMLSelectElement>,
    arbeidsforholdId: string
  ) => void;
  changeArbeidsgiverBetalerBelop: (event: React.ChangeEvent<HTMLInputElement>, belop: string) => void;
  lonnISykefravaeret?: { [key: string]: LonnISykefravaeret };
  fullLonnIArbeidsgiverPerioden?: { [key: string]: LonnIArbeidsgiverperioden };
  refusjonskravetOpphoerer?: { [key: string]: RefusjonskravetOpphoerer };
  arbeidsforhold?: Array<IArbeidsforhold>;
}

export default function RefusjonArbeidsgiver({
  clickArbeidsgiverBetalerFullLonnIArbeidsgiverperioden,
  clickArbeidsgiverBetalerHeleEllerDeler,
  clickRefusjonskravetOpphoerer,
  setRefusjonskravOpphoersdato,
  onChangeBegrunnelseRedusertUtbetaling,
  changeArbeidsgiverBetalerBelop,
  lonnISykefravaeret,
  fullLonnIArbeidsgiverPerioden,
  refusjonskravetOpphoerer,
  arbeidsforhold
}: RefusjonArbeidsgiverProps) {
  if (!arbeidsforhold) return null;

  const flereArbeidsforhold: boolean = arbeidsforhold.length > 1;
  return (
    <>
      <Heading3>Refusjon til arbeidsgiver</Heading3>
      <BodyLong>
        Vi må vite om arbeidsgiver betaler ut lønn under sykemeldingsperioden til arbeidstakeren, eller om NAV skal
        betale ut sykepenger til den sykemeldte etter arbeidsgiverperioden.
      </BodyLong>
      {arbeidsforhold
        .filter((forhold) => forhold.aktiv)
        .map((forhold) => (
          <div key={forhold.arbeidsforholdId}>
            {flereArbeidsforhold && (
              <Heading4 className={localStyles.flerforholdheader}>Refusjon - {forhold.arbeidsforhold}</Heading4>
            )}
            <RadioGroup
              legend='Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?'
              className={styles.radiobuttonwrapper}
            >
              <Radio
                value='Ja'
                onClick={(event) =>
                  clickArbeidsgiverBetalerFullLonnIArbeidsgiverperioden(event, forhold.arbeidsforholdId)
                }
                name='fullLonnIArbeidsgiverPerioden'
              >
                Ja
              </Radio>
              <Radio
                value='Nei'
                onClick={(event) =>
                  clickArbeidsgiverBetalerFullLonnIArbeidsgiverperioden(event, forhold.arbeidsforholdId)
                }
                name='fullLonnIArbeidsgiverPerioden'
              >
                Nei
              </Radio>
            </RadioGroup>
            {fullLonnIArbeidsgiverPerioden?.[forhold.arbeidsforholdId]?.status === 'Nei' && (
              <Select
                label='Velg begrunnelse for ingen eller redusert utbetaling'
                className={styles.halfsize}
                onChange={(event) => onChangeBegrunnelseRedusertUtbetaling(event, forhold.arbeidsforholdId)}
              >
                <option value=''>Velg</option>
                <option value='annet'>Annet</option>
              </Select>
            )}

            <RadioGroup
              legend='Betaler arbeidsgiver lønn under hele eller deler av sykefraværet?'
              className={styles.radiobuttonwrapper}
            >
              <Radio
                value='Ja'
                onClick={(event) => clickArbeidsgiverBetalerHeleEllerDeler(event, forhold.arbeidsforholdId)}
              >
                Ja
              </Radio>
              <Radio
                value='Nei'
                onClick={(event) => clickArbeidsgiverBetalerHeleEllerDeler(event, forhold.arbeidsforholdId)}
              >
                Nei
              </Radio>
            </RadioGroup>
            {lonnISykefravaeret?.[forhold.arbeidsforholdId]?.status === 'Ja' && (
              <>
                <TextField
                  label='Oppgi refusjonsbeløpet per måned'
                  className={styles.halfsize}
                  onChange={(event) => changeArbeidsgiverBetalerBelop(event, forhold.arbeidsforholdId)}
                />
                <BodyLong className={styles.opphrefkravforklaring}>
                  Refusjonsbeløpet gjelder fra den første dagen arbeidstakeren har rett til utbetaling fra NAV
                </BodyLong>
                <RadioGroup legend='Opphører refusjonkravet i perioden?' className={styles.radiobuttonwrapper}>
                  <Radio value='Ja' onClick={(event) => clickRefusjonskravetOpphoerer(event, forhold.arbeidsforholdId)}>
                    Ja
                  </Radio>
                  <Radio
                    value='Nei'
                    onClick={(event) => clickRefusjonskravetOpphoerer(event, forhold.arbeidsforholdId)}
                  >
                    Nei
                  </Radio>
                </RadioGroup>
                {refusjonskravetOpphoerer?.[forhold.arbeidsforholdId]?.status && (
                  <div className={styles.datepickerescape}>
                    <LabelLabel htmlFor='datepicker-input-fra-dato' className={styles.datepickerlabel}>
                      Angi siste dag dere krever refusjon for
                    </LabelLabel>
                    <Datepicker
                      onChange={(dateString) => setRefusjonskravOpphoersdato(dateString, forhold.arbeidsforholdId)}
                      inputLabel='Egenmelding fra dato'
                    />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
    </>
  );
}
