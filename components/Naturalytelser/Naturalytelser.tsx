import { BodyLong, Button, Checkbox, TextField } from '@navikt/ds-react';
import ButtonSlette from '../ButtonSlette';
import Heading3 from '../Heading3';
import SelectNaturalytelser from './SelectNaturalytelser/SelectNaturalytelser';
import lokalStyles from './Naturalytelser.module.css';

import styles from '../../styles/Home.module.css';
import useBoundStore from '../../state/useBoundStore';
import NaturalytelseBortfallsdato from './NaturalytelseBortfallsdato';

export default function Naturalytelser() {
  const naturalytelser = useBoundStore((state) => state.naturalytelser);
  const leggTilNaturalytelse = useBoundStore((state) => state.leggTilNaturalytelse);
  const setNaturalytelseType = useBoundStore((state) => state.setNaturalytelseType);
  const setNaturalytelseBortfallsdato = useBoundStore((state) => state.setNaturalytelseBortfallsdato);
  const setNaturalytelseVerdi = useBoundStore((state) => state.setNaturalytelseVerdi);
  const slettNaturalytelse = useBoundStore((state) => state.slettNaturalytelse);
  const slettAlleNaturalytelser = useBoundStore((state) => state.slettAlleNaturalytelser);

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

  return (
    <>
      <Heading3>Eventuelle naturalytelser (valgfri)</Heading3>
      <BodyLong>
        Har den ansatte naturalytelser som faller bort ved sykmelding, skal disse oppgis her. Hvis den ansatte beholder
        eventuelle naturalytelser, så trenger dere ikke oppgi noe.
      </BodyLong>
      <Checkbox
        value='Naturalytelser'
        checked={naturalytelser && naturalytelser.length > 0}
        onClick={visNaturalytelser}
      >
        Den ansatte har naturalytelser som faller bort ved sykmeldingen.
      </Checkbox>
      {naturalytelser && naturalytelser.length > 0 && (
        <table className={lokalStyles.tablenaturalytelse}>
          <thead>
            <th>Naturalytelse</th>
            <th>Dato naturalytelse faller bort</th>
            <th>Verdi naturalytelse - kr/måned</th>
            <th></th>
          </thead>
          <tbody>
            {naturalytelser.map((element) => {
              return (
                <tr key={element.id}>
                  <td>
                    <SelectNaturalytelser
                      onChangeYtelse={(event) => setNaturalytelseType(element.id, event.target.value)}
                      elementId={element.id}
                    />
                  </td>

                  <td className={styles.tddatepickernatural}>
                    <NaturalytelseBortfallsdato
                      naturalytelseId={element.id}
                      setNaturalytelseBortfallsdato={setNaturalytelseBortfallsdato}
                    />
                  </td>
                  <td>
                    <TextField
                      label={''}
                      className={styles.fnr}
                      onChange={(event) => setNaturalytelseVerdi(element.id, event.target.value)}
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
