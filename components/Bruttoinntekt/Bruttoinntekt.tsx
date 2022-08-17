import { BodyLong, BodyShort, Button, Checkbox, CheckboxGroup, Link, Select, TextField } from '@navikt/ds-react';
import { useState } from 'react';
import { HistoriskInntekt } from '../../state/state';
import useBruttoinntektStore from '../../state/useBruttoinntektStore';
import styles from '../../styles/Home.module.css';
import lokalStyles from './Bruttoinntekt.module.css';
import formatCurrency from '../../utils/formatCurrency';
import useFeilmeldingerStore from '../../state/useFeilmeldingerStore';
import Heading3 from '../Heading3/Heading3';
import TextLabel from '../TextLabel/TextLabel';

export default function Bruttoinntekt() {
  const [endreMaanedsinntekt, setEndreMaanedsinntekt] = useState<boolean>(false);
  const clickTilbakestillMaanedsinntektHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setEndreMaanedsinntekt(false);
    tilbakestillMaanedsinntekt();
  };
  const bruttoinntekt = useBruttoinntektStore((state) => state.bruttoinntekt);
  const tidligereinntekt: Array<HistoriskInntekt> | undefined = useBruttoinntektStore(
    (state) => state.tidligereInntekt
  );
  const bekreftKorrektInntekt = useBruttoinntektStore((state) => state.bekreftKorrektInntekt);
  const setNyMaanedsinntekt = useBruttoinntektStore((state) => state.setNyMaanedsinntekt);
  const setEndringsaarsak = useBruttoinntektStore((state) => state.setEndringsaarsak);
  const tilbakestillMaanedsinntekt = useBruttoinntektStore((state) => state.tilbakestillMaanedsinntekt);

  const [visFeilmeldingsTekst, visFeilmelding] = useFeilmeldingerStore((state) => [
    state.visFeilmeldingsTekst,
    state.visFeilmelding
  ]);

  return (
    <>
      <Heading3>Bruttoinntekt siste 3 måneder</Heading3>
      <BodyLong>
        Vi har brukt opplysninger fra skatteetaten (a-ordningen) for å anslå månedsinntekten her. Desom det ikke stemmer
        må dere endre dette. Dersom inntekten har gått opp pga. varig lønnsforhøyelse, og ikke for eksempel
        representerer uforutsett overtid må dette korrigeres.
      </BodyLong>
      <TextLabel className={styles.tbmargin}>Vi har registrert en inntekt på</TextLabel>
      <div className={lokalStyles.belopwrapper}>
        {!endreMaanedsinntekt && (
          <TextLabel className={lokalStyles.maanedsinntekt} id='bruttoinntekt-belop'>
            {(bruttoinntekt ? bruttoinntekt.bruttoInntekt : 0).toString()} kr/måned
          </TextLabel>
        )}
        {endreMaanedsinntekt && (
          <div className={lokalStyles.endremaaanedsinntekt}>
            <TextField
              label='Inntekt per måned'
              onChange={(event) => setNyMaanedsinntekt(event.target.value)}
              defaultValue={formatCurrency(bruttoinntekt ? bruttoinntekt.bruttoInntekt : 0)}
              id='bruttoinntekt-endringsbelop'
              error={visFeilmeldingsTekst('bruttoinntekt-endringsbelop')}
            />
            <Select
              label='Forklaring til endring'
              onChange={(event) => setEndringsaarsak(event.target.value)}
              id='bruttoinntekt-endringsaarsak'
              error={visFeilmeldingsTekst('bruttoinntekt-endringsaarsak')}
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
          <Button variant='tertiary' className={styles.endrebutton} onClick={() => setEndreMaanedsinntekt(true)}>
            Endre
          </Button>
        )}
      </div>
      <TextLabel className={styles.tbmargin}>Inntekten er basert på følgende måneder</TextLabel>
      <table>
        {tidligereinntekt?.map((inntekt) => (
          <tr key={inntekt.id}>
            <td className={lokalStyles.maanedsnavn}>{inntekt.maanedsnavn}:</td>
            <td className={lokalStyles.maanedsinntekt}>{formatCurrency(inntekt.inntekt)} kr</td>
          </tr>
        ))}
      </table>
      {!tidligereinntekt && <BodyShort>Klarer ikke å finne inntekt for de 3 siste månedene.</BodyShort>}
      <BodyLong className={styles.tbmargin}>
        <strong>
          Beløpet er basert på en beregning av siste tre måneders lønn. Hvis beløpet ikke er korrekt må dere endre
          dette. Det kan være at den ansatte nylig har fått lønnsøkning, redusering i arbeidstid eller har andre
          endringer i lønn som vi ikke registrert. Beregningen er gjort etter{' '}
          <Link href='#'>folketrygdloven $8-28.</Link>
        </strong>
      </BodyLong>
      <CheckboxGroup size='medium' error={visFeilmeldingsTekst('bruttoinntektbekreft')} legend=''>
        <Checkbox
          onClick={(event) => bekreftKorrektInntekt(event.currentTarget.checked)}
          id='bruttoinntektbekreft'
          error={visFeilmelding('bruttoinntektbekreft')}
          value='Ja'
        >
          Jeg bekrefter at registrert inntekt er korrekt
        </Checkbox>
      </CheckboxGroup>
    </>
  );
}
