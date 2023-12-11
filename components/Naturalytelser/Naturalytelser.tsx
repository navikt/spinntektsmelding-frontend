import { BodyLong, Button, Checkbox, TextField } from '@navikt/ds-react';
import ButtonSlette from '../ButtonSlette';
import Heading3 from '../Heading3';
import SelectNaturalytelser from './SelectNaturalytelser/SelectNaturalytelser';
import lokalStyles from './Naturalytelser.module.css';

import styles from '../../styles/Home.module.css';
import useBoundStore from '../../state/useBoundStore';
import NaturalytelseBortfallsdato from './NaturalytelseBortfallsdato';
import formatCurrency from '../../utils/formatCurrency';

export default function Naturalytelser() {
  const naturalytelser = useBoundStore((state) => state.naturalytelser);
  const leggTilNaturalytelse = useBoundStore((state) => state.leggTilNaturalytelse);
  const setNaturalytelseType = useBoundStore((state) => state.setNaturalytelseType);
  const setNaturalytelseBortfallsdato = useBoundStore((state) => state.setNaturalytelseBortfallsdato);
  const setNaturalytelseVerdi = useBoundStore((state) => state.setNaturalytelseVerdi);
  const slettNaturalytelse = useBoundStore((state) => state.slettNaturalytelse);
  const slettAlleNaturalytelser = useBoundStore((state) => state.slettAlleNaturalytelser);
  const visFeilmeldingsTekst = useBoundStore((state) => state.visFeilmeldingsTekst);

  const visNaturalytelser = (event: React.MouseEvent<HTMLInputElement>) => {
    if (event.currentTarget.checked === true) {
      leggTilNaturalytelse();
    } else {
      slettAlleNaturalytelser();
    }
  };

  const leggTilNaturalytelseHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    leggTilNaturalytelse();
  };

  const checkedNaturalytelser = naturalytelser && naturalytelser.length > 0 ? true : false;
  console.log('checkedNaturalytelser', naturalytelser);

  return (
    <>
      <Heading3>Eventuelle naturalytelser</Heading3>
      <BodyLong>
        Har den ansatte naturalytelser som faller bort ved sykmelding, skal disse oppgis her. Hvis den ansatte beholder
        eventuelle naturalytelser, så trenger dere ikke oppgi noe.
      </BodyLong>
      <Checkbox value='Naturalytelser' onClick={visNaturalytelser} checked={checkedNaturalytelser}>
        Den ansatte har naturalytelser som faller bort ved sykmeldingen.
      </Checkbox>
      {naturalytelser && naturalytelser.length > 0 && (
        <table className={lokalStyles.tablenaturalytelse}>
          <thead>
            <tr>
              <th>Naturalytelse</th>
              <th>Dato naturalytelse faller bort</th>
              <th>Verdi naturalytelse - kr/måned</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {naturalytelser.map((element) => {
              return (
                <tr key={element.id}>
                  <td>
                    <SelectNaturalytelser
                      onChangeYtelse={(event) => setNaturalytelseType(element.id, event.target.value)}
                      elementId={element.id}
                      defaultValue={element.type}
                      error={visFeilmeldingsTekst('naturalytelse-type-' + element.id)}
                    />
                  </td>

                  <td className={styles.tddatepickernatural}>
                    <NaturalytelseBortfallsdato
                      naturalytelseId={element.id}
                      setNaturalytelseBortfallsdato={setNaturalytelseBortfallsdato}
                      defaultValue={element.bortfallsdato}
                      error={visFeilmeldingsTekst('naturalytelse-dato-' + element.id)}
                    />
                  </td>
                  <td>
                    <TextField
                      label={''}
                      className={styles.fnr}
                      onChange={(event) => setNaturalytelseVerdi(element.id, event.target.value)}
                      defaultValue={element.verdi ? formatCurrency(element.verdi) : undefined}
                      error={visFeilmeldingsTekst('naturalytelse-belop-' + element.id)}
                    ></TextField>
                  </td>
                  <td>
                    <ButtonSlette onClick={() => slettNaturalytelse(element.id)} title='Slett ytelse' />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <div className={lokalStyles.naturalytelserknapp}>
            <Button variant='secondary' className={styles.legtilbutton} onClick={leggTilNaturalytelseHandler}>
              Legg til naturalytelse
            </Button>
          </div>
        </table>
      )}
    </>
  );
}
