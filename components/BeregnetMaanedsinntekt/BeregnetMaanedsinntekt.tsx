import { BodyLong, Button, Checkbox, Heading, Modal, Select, TextField } from '@navikt/ds-react';
import { useEffect, useState } from 'react';

import styles from './BeregnetMaanedsinntekt.module.css';

export interface OppdatertMaanedsintekt {
  oppdatertMaanedsinntekt: number;
  oppdatert: boolean;
  endringsaarsak: string;
}

interface BergnetMaanedsinntetProps {
  maanedsinntekt: number;
  maaned1sum: number;
  maaned1navn: string;
  maaned2sum: number;
  maaned2navn: string;
  maaned3sum: number;
  maaned3navn: string;
  open: boolean;
  onClose: (maanedsinntekt: OppdatertMaanedsintekt) => void;
}

export default function BeregnetMaanedsinntekt(props: BergnetMaanedsinntetProps) {
  const [endringsmodus, setEndringsmodus] = useState<boolean>(false);
  const [nyMaanedsinntekt, setNyMaanedsinntekt] = useState<string>('');
  const [endringsaarsak, setEndringsaarsak] = useState<string>('');

  const changeEndringsmodus = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndringsmodus(event.currentTarget.checked);
  };

  const closeModalOppdater = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setEndringsmodus(false);

    props.onClose({
      oppdatertMaanedsinntekt: Number(nyMaanedsinntekt),
      oppdatert: true,
      endringsaarsak: endringsaarsak
    });
  };

  const closeModalUtenOppdater = () => {
    setEndringsmodus(false);

    props.onClose({
      oppdatertMaanedsinntekt: props.maanedsinntekt,
      oppdatert: false,
      endringsaarsak: endringsaarsak
    });
  };

  useEffect(() => {
    if (Modal && Modal.setAppElement) {
      Modal.setAppElement('.main-content');
    }
  }, []);

  return (
    <>
      <Modal open={props.open} onClose={closeModalUtenOppdater} className={styles.modalwrapper}>
        <Modal.Content>
          <Heading size='medium' className={styles.modalheading}>
            Beregnet månedsinntekt
          </Heading>
          <BodyLong className={styles.ingress}>
            Vi har brukt opplysninger fra Altinn for å anslå månedsinntekten her. Desom det ikke stemmer må dere endre
            dette. Dersom inntekten har gått opp pga. varig lønnsforhøyelse, og ikke for eksempel representerer
            uforutsett overtid må dette angis.
          </BodyLong>
          <Heading size='small' className={styles.beregnetinntektheader}>
            Vi har registrert en inntekt på
          </Heading>
          <Heading size='large' className={styles.beregnetinntekt}>
            {props.maanedsinntekt} kr/måned
          </Heading>
          <Heading size='small'>Inntekten er basert på følgende måneder</Heading>
          <table className={styles.tablewrapper}>
            <thead>
              <tr>
                <th>
                  <Heading size='small'>{props.maaned1navn}</Heading>
                </th>
                <th>
                  <Heading size='small'>{props.maaned2navn}</Heading>
                </th>
                <th>
                  <Heading size='small'>{props.maaned3navn}</Heading>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Heading size='small'>{props.maaned1sum} kr/måned</Heading>
                </td>
                <td>
                  <Heading size='small'>{props.maaned2sum} kr/måned</Heading>
                </td>
                <td>
                  <Heading size='small'>{props.maaned3sum} kr/måned</Heading>
                </td>
              </tr>
            </tbody>
          </table>
          <BodyLong className={styles.bekrefttekst}>
            Hvis dette er korrekt kan dere bare bekrefte inntekten. Om beregnet månedsinntekt ikke er korrekt velder
            dere å endre på registrert inntekt, sammen med forklaring til endring og bekrefter deretter endringen.
          </BodyLong>
          <Checkbox onChange={changeEndringsmodus}>Jeg vil endre registrert inntekt</Checkbox>
          {endringsmodus && (
            <div className={styles.endringswrapper}>
              <div className={styles.endringsverdier}>
                <TextField label='Inntekt per måned' onChange={(event) => setNyMaanedsinntekt(event.target.value)} />
              </div>
              <div className={styles.endringsverdier}>
                <Select label='Forklaring til endring' onChange={(event) => setEndringsaarsak(event.target.value)}>
                  <option value=''>Velg naturalytelse</option>
                  <option value='ElektroniskKommunikasjon'>Elektronisk kommunikasjon</option>
                  <option value='Aksjeer'>Aksjer / grunnfondsbevis til underkurs</option>
                  <option value='Losji'>Losji</option>
                  <option value='KostDøgn'>Kost (døgn)</option>
                  <option value='Besøksreiser'>Besøksreiser i hjemmet annet</option>
                  <option value='Kostbesparelse'>Kostbesparelse i hjemmet</option>
                  <option value='Rentefordel'>Rentefordel lån</option>
                  <option value='Bil'>Bil</option>
                  <option value='KostDager'>Kost (dager)</option>
                  <option value='Bolig'>Bolig</option>
                  <option value='Forsikringer'>Skattepliktig del av visse forsikringer</option>
                  <option value='FriTransport'>Fri transport</option>
                  <option value='Opsjoner'>Opsjoner</option>
                  <option value='Barnehageplass'>Tilskudd barnehageplass</option>
                  <option value='YrkesbilKilometer'>Yrkesbil tjenestebehov kilometer</option>
                  <option value='YrkesbilListepris'>Yrkesbil tjenestebehov listepris</option>
                  <option value='UtenlandskPensjonsordning'>Innbetaling utenlandsk pensjonsordning</option>
                </Select>
              </div>
            </div>
          )}
          <Button className={styles.bekreftknapp} onClick={closeModalOppdater}>
            Bekreft
          </Button>
        </Modal.Content>
      </Modal>
    </>
  );
}
