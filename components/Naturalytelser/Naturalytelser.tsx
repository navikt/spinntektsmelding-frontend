import { Datepicker } from '@navikt/ds-datepicker';
import { Button, Checkbox, TextField } from '@navikt/ds-react';
import ButtonSlette from '../ButtonSlette';
import Heading3 from '../Heading3';
import SelectNaturalytelser from '../SelectNaturalytelser/SelectNaturalytelser';

import styles from '../../styles/Home.module.css';
import useNaturalytelserStore from '../../state/useNaturalytelserStore';

export default function Naturalytelser() {
  const naturalytelser = useNaturalytelserStore((state) => state.naturalytelser);
  const leggTilNaturalytelse = useNaturalytelserStore((state) => state.leggTilNaturalytelse);
  const setNaturalytelseType = useNaturalytelserStore((state) => state.setNaturalytelseType);
  const setNaturalytelseBortfallsdato = useNaturalytelserStore((state) => state.setNaturalytelseBortfallsdato);
  const setNaturalytelseVerdi = useNaturalytelserStore((state) => state.setNaturalytelseVerdi);
  const slettNaturalytelse = useNaturalytelserStore((state) => state.slettNaturalytelse);
  const slettAlleNaturalytelser = useNaturalytelserStore((state) => state.slettAlleNaturalytelser);

  const visNaturalytelser = (event: React.MouseEvent<HTMLInputElement>) => {
    if (event.currentTarget.checked === true) {
      leggTilNaturalytelse();
    } else {
      slettAlleNaturalytelser();
    }
  };

  return (
    <>
      <Heading3>Eventuelle naturalytelser (valgfri)</Heading3>
      <p>
        Har den ansatte noen naturalytelser som bortfaller ved sykemelding så må de angis, ellers vil den ansatte ikke
        bli tilgoderegnet disse. Hvis den ansatte fotsatt beholder eventuelle naturalyteleser, så trenger dere ikke
        gjøre noe.
      </p>
      <Checkbox
        value='Naturalytelser'
        // checked={state.naturalytelser && state.naturalytelser.length > 0}
        onClick={visNaturalytelser}
      >
        Ansatt har naturalytelser som bortfaller ved sykemeldingen
      </Checkbox>
      {naturalytelser && naturalytelser.length > 0 && (
        <table className={styles.tablenaturalytelse}>
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
                    <Datepicker
                      inputId={'naturalytele-input-fra-dato-' + element.id}
                      inputLabel='Dato naturalytelse bortfaller'
                      onChange={(dateString) => setNaturalytelseBortfallsdato(element.id, dateString)}
                      // value={dato}
                      locale={'nb'}
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
          <div className={styles.naturalytelserknapp}>
            <Button variant='secondary' className={styles.legtilbutton} onClick={() => leggTilNaturalytelse()}>
              Legg til naturalytelse
            </Button>
          </div>
        </table>
      )}
    </>
  );
}
