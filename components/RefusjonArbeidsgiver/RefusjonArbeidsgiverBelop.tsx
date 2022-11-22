import { Button, TextField } from '@navikt/ds-react';
import { useState } from 'react';
import formatCurrency from '../../utils/formatCurrency';
import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
import localStyles from './RefusjonArbeidsgiver.module.css';

interface RefusjonArbeidsgiverBelopProps {
  bruttoinntekt: number;
  onOppdaterBelop: (beloep: string) => void;
  visFeilmeldingsTekst: (feilmelding: string) => string;
}

export default function RefusjonArbeidsgiverBelop({
  bruttoinntekt,
  onOppdaterBelop,
  visFeilmeldingsTekst
}: RefusjonArbeidsgiverBelopProps) {
  const [erEditerbar, setEditerbar] = useState<boolean>(false);

  if (!erEditerbar) {
    return (
      <>
        <TextLabel>Refusjonsbeløpet per måned</TextLabel>
        <div className={localStyles.belopswrapper}>
          <div className={localStyles.belop}>{formatCurrency(bruttoinntekt)} kr</div>
          <Button variant='secondary' className={styles.endrebutton} onClick={() => setEditerbar(true)}>
            Endre
          </Button>
        </div>
      </>
    );
  }

  return (
    <TextField
      className={localStyles.refusjonsbelop}
      label='Oppgi refusjonsbeløpet per måned'
      // className={styles.halfsize}
      onChange={(event) => onOppdaterBelop(event.target.value)}
      id={'lus-input'}
      error={visFeilmeldingsTekst('lus-input')}
    />
  );
}
