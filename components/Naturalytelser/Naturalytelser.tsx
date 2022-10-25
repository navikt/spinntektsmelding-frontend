import { UNSAFE_DatePicker, UNSAFE_useDatepicker } from '@navikt/ds-react';
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

  // const rangeChangeHandler = (dato) => {
  //   if (dato) {
  //     setNaturalytelseBortfallsdato('dette-er-ikkeriktig-måte', dato);
  //   }
  // };

  const { datepickerProps, inputProps, selectedDay } = UNSAFE_useDatepicker({
    toDate: new Date(),
    onDateChange: console.log
  });
  return (
    <>
      <Heading3>Eventuelle naturalytelser (valgfri)</Heading3>
      <BodyLong>
        Har den ansatte noen naturalytelser som bortfaller ved sykemelding så må de angis, ellers vil den ansatte ikke
        bli tilgoderegnet disse. Hvis den ansatte fotsatt beholder eventuelle naturalyteleser, så trenger dere ikke
        gjøre noe.
      </BodyLong>
      <Checkbox
        value='Naturalytelser'
        checked={naturalytelser && naturalytelser.length > 0}
        onClick={visNaturalytelser}
      >
        Ansatt har naturalytelser som bortfaller ved sykemeldingen
      </Checkbox>
      {naturalytelser && naturalytelser.length > 0 && (
        <table className={lokalStyles.tablenaturalytelse}>
          <thead>
            <th>Naturalytelse</th>
            <th>Dato naturalytelse bortfaller</th>
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
                    <NaturalytelseBortfallsdato naturalytelseId={element.id} />
                    {/* <Datepicker
                      inputId={'naturalytele-input-fra-dato-' + element.id}
                      inputLabel='Dato naturalytelse bortfaller'
                      onChange={(dateString) => setNaturalytelseBortfallsdato(element.id, dateString)}
                      // value={dato}
                      locale={'nb'}
                    /> */}
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
