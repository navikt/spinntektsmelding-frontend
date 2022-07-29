import { BodyShort, Button, Checkbox, Link, Select, TextField } from '@navikt/ds-react';
import { useState } from 'react';
import { HistoriskInntekt, Inntekt } from '../../state/state';
import useBruttoinntektStore from '../../state/useBruttoinntektStore';
import styles from '../../styles/Home.module.css';
import formatCurrency from '../../utils/formatCurrency';
import Heading3 from '../Heading3/Heading3';
import TextLabel from '../TextLabel/TextLabel';

export default function Bruttoinntekt() {
  const [endreMaanedsinntekt, setEndreMaanedsinntekt] = useState<boolean>(false);
  const clickTilbakestillMaanedsinntektHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setEndreMaanedsinntekt(false);
    tilbakestillMaanedsinntekt();
  };
  const bruttoinntekt: Inntekt = useBruttoinntektStore((state) => state.bruttoinntekt);
  const tidligereinntekt: Array<HistoriskInntekt> | undefined = useBruttoinntektStore(
    (state) => state.tidligereInntekt
  );
  const bekreftKorrektInntekt = useBruttoinntektStore((state) => state.bekreftKorrektInntekt);
  const setNyMaanedsinntekt = useBruttoinntektStore((state) => state.setNyMaanedsinntekt);
  const selectEndringsaarsak = useBruttoinntektStore((state) => state.selectEndringsaarsak);
  const tilbakestillMaanedsinntekt = useBruttoinntektStore((state) => state.tilbakestillMaanedsinntekt);

  return (
    <>
      <Heading3>Bruttoinntekt siste 3 måneder</Heading3>
      <p>
        Vi har brukt opplysninger fra skatteetaten (a-ordningen) for å anslå månedsinntekten her. Desom det ikke stemmer
        må dere endre dette. Dersom inntekten har gått opp pga. varig lønnsforhøyelse, og ikke for eksempel
        representerer uforutsett overtid må dette korrigeres.
      </p>
      <p>
        <strong>Vi har registrert en inntekt på</strong>
      </p>
      <div className={styles.belopwrapper}>
        {!endreMaanedsinntekt && (
          <TextLabel className={styles.maanedsinntekt} id='bruttoinntekt-belop'>
            {(bruttoinntekt ? bruttoinntekt.bruttoInntekt : 0).toString()} kr/måned
          </TextLabel>
        )}
        {endreMaanedsinntekt && (
          <div className={styles.endremaaanedsinntekt}>
            <TextField
              label='Inntekt per måned'
              onChange={(event) => setNyMaanedsinntekt(event.target.value)}
              defaultValue={(bruttoinntekt ? bruttoinntekt.bruttoInntekt : 0).toString()}
            />
            <Select
              label='Forklaring til endring'
              onChange={(event) => selectEndringsaarsak(event.target.value)}
              id='bruttoinntekt-endringsaarsak'
            >
              <option value=''>Velg endringsårsak</option>
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
            <Button
              variant='tertiary'
              className={styles.kontrollerknapp}
              onClick={clickTilbakestillMaanedsinntektHandler}
            >
              Tilbakestill
            </Button>
          </div>
        )}
        {!endreMaanedsinntekt && (
          <Button variant='secondary' className={styles.endrebutton} onClick={() => setEndreMaanedsinntekt(true)}>
            Endre
          </Button>
        )}
      </div>
      <BodyShort>
        <strong>Inntekten er basert på følgende måneder</strong>
      </BodyShort>
      {tidligereinntekt?.map((inntekt) => (
        <div key={inntekt.id}>
          <div className={styles.maanedsnavn}>{inntekt.maanedsnavn}:</div>
          <div className={styles.maanedsinntekt}>{formatCurrency(inntekt.inntekt)} kr</div>
        </div>
      ))}
      {!tidligereinntekt && <BodyShort>Klarer ikke å finne inntekt for de 3 siste månedene.</BodyShort>}
      <p>
        <strong>
          Hvis beløpet ikke er korrekt må dere endre dette. Det kan være at den ansatte nylig har fått lønnsøkning,
          bonus, redusering i arbeidstid eller har andre endringer i lønn som vi ikke registrert. Beregningen er gjort
          etter <Link href='#'>folketrygdloven $8-28.</Link>
        </strong>
      </p>
      <Checkbox onClick={(event) => bekreftKorrektInntekt(event.currentTarget.checked)} id='bruttoinntektbekreft'>
        Jeg bekrefter at registrert inntekt er korrekt
      </Checkbox>
    </>
  );
}
