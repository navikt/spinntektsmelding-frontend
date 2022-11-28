import { BodyLong, BodyShort, Button, Checkbox, CheckboxGroup, Link, Select, TextField } from '@navikt/ds-react';
import { useState } from 'react';
import { HistoriskInntekt } from '../../state/state';
import useBoundStore from '../../state/useBoundStore';
import styles from '../../styles/Home.module.css';
import lokalStyles from './Bruttoinntekt.module.css';
import formatCurrency from '../../utils/formatCurrency';
import Heading3 from '../Heading3/Heading3';
import TextLabel from '../TextLabel/TextLabel';
import TidligereInntekt from './TidligereInntekt';

export default function Bruttoinntekt() {
  const [endreMaanedsinntekt, setEndreMaanedsinntekt] = useState<boolean>(false);
  const clickTilbakestillMaanedsinntektHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setEndreMaanedsinntekt(false);
    tilbakestillMaanedsinntekt();
  };
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);
  const tidligereinntekt: Array<HistoriskInntekt> | undefined = useBoundStore((state) => state.tidligereInntekt);
  const bekreftKorrektInntekt = useBoundStore((state) => state.bekreftKorrektInntekt);
  const setNyMaanedsinntekt = useBoundStore((state) => state.setNyMaanedsinntekt);
  const setEndringsaarsak = useBoundStore((state) => state.setEndringsaarsak);
  const tilbakestillMaanedsinntekt = useBoundStore((state) => state.tilbakestillMaanedsinntekt);
  const visFeilmeldingsTekst = useBoundStore((state) => state.visFeilmeldingsTekst);
  const visFeilmelding = useBoundStore((state) => state.visFeilmelding);
  const setNyMaanedsinntektBlanktSkjema = useBoundStore((state) => state.setNyMaanedsinntektBlanktSkjema);

  if (tidligereinntekt) {
    return (
      <>
        <Heading3>Brutto månedslønn</Heading3>
        <BodyLong>For å beregne månedslønnen har vi brukt følgende lønnsopplysninger fra A-meldingen:</BodyLong>
        <TidligereInntekt tidligereinntekt={tidligereinntekt} />
        <TextLabel className={styles.tbmargin}>Vi har derfor beregnet månedslønnen til</TextLabel>
        <div className={lokalStyles.belopwrapper}>
          {!endreMaanedsinntekt && (
            <TextLabel className={lokalStyles.maanedsinntekt} id='bruttoinntekt-belop'>
              {formatCurrency(bruttoinntekt && bruttoinntekt.bruttoInntekt ? bruttoinntekt.bruttoInntekt : 0)} kr/måned
            </TextLabel>
          )}
          {endreMaanedsinntekt && (
            <div className={lokalStyles.endremaaanedsinntekt}>
              <div>
                <TextField
                  label='Inntekt per måned'
                  onChange={(event) => setNyMaanedsinntekt(event.target.value)}
                  defaultValue={formatCurrency(
                    bruttoinntekt && bruttoinntekt.bruttoInntekt ? bruttoinntekt.bruttoInntekt : 0
                  )}
                  id='bruttoinntekt-endringsbelop'
                  error={visFeilmeldingsTekst('bruttoinntekt-endringsbelop')}
                  className={lokalStyles.bruttoinntektendringsbelop}
                />
              </div>
              <div>
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
              </div>
              <div>
                <Button
                  variant='tertiary'
                  className={lokalStyles.kontrollerknapp}
                  onClick={clickTilbakestillMaanedsinntektHandler}
                >
                  Tilbakestill
                </Button>
              </div>
            </div>
          )}
          {!endreMaanedsinntekt && (
            <Button variant='secondary' className={styles.endrebutton} onClick={() => setEndreMaanedsinntekt(true)}>
              Endre
            </Button>
          )}
        </div>
        <BodyShort>
          <strong>Stemmer dette?</strong>
        </BodyShort>
        <BodyLong>
          Sjekk nøye at beregnet månedslønn er korrekt. Hvis den ansatte nylig har fått lønnsøkning, endring i
          arbeidstid, hatt ubetalt fri eller har andre endringer i lønn må dette korrigeres. Overtid skal ikke
          inkluderes i beregnet månedslønn. Beregningen er gjort etter <Link href='#'>folketrygdloven $8-28.</Link>
        </BodyLong>
        <CheckboxGroup
          size='medium'
          error={visFeilmeldingsTekst('bruttoinntektbekreft')}
          hideLegend
          legend='Bekreft at månedslønn er korrekt'
        >
          <Checkbox
            onClick={(event) => bekreftKorrektInntekt(event.currentTarget.checked)}
            id='bruttoinntektbekreft'
            error={visFeilmelding('bruttoinntektbekreft')}
            value='Ja'
          >
            Jeg bekrefter at jeg har kontrollert inntekten og at beregnet månedslønn er korrekt.
          </Checkbox>
        </CheckboxGroup>
      </>
    );
  } else {
    return (
      <>
        <Heading3>Brutto månedslønn</Heading3>
        <BodyLong>
          Angi bruttoinntekt som snitt av siste tre måneders lønn. Dersom inntekten har gått opp pga. varig
          lønnsforhøyelse, og ikke for eksempel representerer uforutsett overtid kan dette gjøre at inntekten settes som
          høyere enn snitt av siste tre måneder..
        </BodyLong>
        <div className={lokalStyles.prosentbody}>
          <TextField
            label='Gjennomsnittsinntekt per måned'
            onChange={(event) => setNyMaanedsinntektBlanktSkjema(event.target.value)}
            defaultValue={formatCurrency(
              bruttoinntekt && bruttoinntekt.bruttoInntekt ? bruttoinntekt.bruttoInntekt : 0
            )}
            id='bruttoinntekt-endringsbelop'
            error={visFeilmeldingsTekst('bruttoinntekt-endringsbelop')}
            className={lokalStyles.bruttoinntektbelop}
          />
        </div>
        <BodyLong className={lokalStyles.bruttoinntektbelopbeskrivelse}>
          Vanligvis skal beløpet baseres på et gjennomsnitt av siste tre måneders lønn. Unntak kan være at den ansatte
          nylig har fått lønnsøkning, redusering i arbeidstid eller har andre endringer i lønn.
        </BodyLong>
      </>
    );
  }
}
