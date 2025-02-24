import { BodyLong, Button, Checkbox, TextField } from '@navikt/ds-react';
import ButtonSlette from '../ButtonSlette';
import Heading3 from '../Heading3';
import SelectNaturalytelser from './SelectNaturalytelser/SelectNaturalytelser';
import lokalStyles from './Naturalytelser.module.css';

import styles from '../../styles/Home.module.css';
import useBoundStore from '../../state/useBoundStore';
import NaturalytelseBortfallsdato from './NaturalytelseBortfallsdato';
import formatCurrency from '../../utils/formatCurrency';

interface NaturalytelseProps {
  setIsDirtyForm: (dirty: boolean) => void;
}

export default function Naturalytelser({ setIsDirtyForm }: Readonly<NaturalytelseProps>) {
  const naturalytelser = useBoundStore((state) => state.naturalytelser);
  const leggTilNaturalytelse = useBoundStore((state) => state.leggTilNaturalytelse);
  const setNaturalytelseType = useBoundStore((state) => state.setNaturalytelseType);
  const setNaturalytelseBortfallsdato = useBoundStore((state) => state.setNaturalytelseBortfallsdato);
  const setNaturalytelseVerdi = useBoundStore((state) => state.setNaturalytelseVerdi);
  const slettNaturalytelse = useBoundStore((state) => state.slettNaturalytelse);
  const slettAlleNaturalytelser = useBoundStore((state) => state.slettAlleNaturalytelser);
  const visFeilmeldingTekst = useBoundStore((state) => state.visFeilmeldingTekst);

  const visNaturalytelser = (event: React.MouseEvent<HTMLInputElement>) => {
    if (event.currentTarget.checked === true) {
      setIsDirtyForm(true);
      leggTilNaturalytelse();
    } else {
      setIsDirtyForm(true);
      slettAlleNaturalytelser();
    }
  };

  const leggTilNaturalytelseHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDirtyForm(true);
    leggTilNaturalytelse();
  };

  const slettNaturalytelseHandler = (event: React.MouseEvent<HTMLButtonElement>, elementId: string) => {
    event.preventDefault();
    setIsDirtyForm(true);
    slettNaturalytelse(elementId);
  };

  const checkedNaturalytelser = naturalytelser && naturalytelser.length > 0;

  return (
    <>
      <Heading3>Naturalytelser</Heading3>
      <Checkbox value='Naturalytelser' onClick={visNaturalytelser} checked={checkedNaturalytelser}>
        Har den ansatte naturalytelser som faller bort under sykefraværet?
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
                      error={visFeilmeldingTekst('naturalytelse-type-' + element.id)}
                    />
                  </td>

                  <td className={styles.tddatepickernatural}>
                    <NaturalytelseBortfallsdato
                      naturalytelseId={element.id}
                      setNaturalytelseBortfallsdato={setNaturalytelseBortfallsdato}
                      defaultValue={element.bortfallsdato}
                      error={visFeilmeldingTekst('naturalytelse-dato-' + element.id)}
                    />
                  </td>
                  <td>
                    <TextField
                      label={''}
                      className={styles.fnr}
                      onChange={(event) => setNaturalytelseVerdi(element.id, event.target.value)}
                      defaultValue={element.verdi ? formatCurrency(element.verdi) : undefined}
                      error={visFeilmeldingTekst('naturalytelse-beloep-' + element.id)}
                    ></TextField>
                  </td>
                  <td>
                    <ButtonSlette onClick={(e) => slettNaturalytelseHandler(e, element.id)} title='Slett ytelse' />
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
