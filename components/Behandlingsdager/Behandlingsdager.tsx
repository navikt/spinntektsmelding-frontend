import formatDate from '../../utils/formatDate';
import Heading3 from '../Heading3/Heading3';
import styles from '../../styles/Home.module.css';
import localStyles from './Behandlingsdager.module.css';
import TextLabel from '../TextLabel/TextLabel';
import { UNSAFE_DatePicker, UNSAFE_useDatepicker, Alert } from '@navikt/ds-react';
import { useState } from 'react';
import { eachMonthOfInterval } from 'date-fns';
import useBoundStore from '../../state/useBoundStore';
import Skillelinje from '../Skillelinje/Skillelinje';
import ukeNr from '../../utils/ukeNr';

export default function Behandlingsdager() {
  const [behandlingsperiode, setBehandlingsdager, behandlingsdager] = useBoundStore((state) => [
    state.behandlingsperiode,
    state.setBehandlingsdager,
    state.behandlingsdager
  ]);

  const [footer, setFooter] = useState<string>('');
  const maaneder = eachMonthOfInterval({
    start: behandlingsperiode?.fom || new Date(),
    end: behandlingsperiode?.tom || new Date()
  });

  function handleSelectDays(selectedDays: Date[] | undefined) {
    const weeks: Array<number> | undefined = selectedDays?.map((day) => ukeNr(day));

    const uniqueWeeks: Array<number> = Array.from(new Set(weeks));

    if (weeks && weeks.length !== uniqueWeeks.length) {
      setFooter('Man kan kun ha en behandling per uke.');
    } else {
      setFooter('');
    }

    if (selectedDays && selectedDays?.length > 12) {
      setFooter('Man kan ikke ha mer enn 12 behandlinger.');
    }

    setBehandlingsdager(selectedDays);
  }

  const { datepickerProps, inputProps } = UNSAFE_useDatepicker({
    defaultSelected: new Date()
  });
  console.log(behandlingsperiode);
  if (!behandlingsperiode) return null;
  return (
    <>
      <Skillelinje />
      <Heading3>Fraværsperiode - behandlingsdager</Heading3>
      <p>
        I følge sykmeldingen hadde den ansatte sykmelding for enkeltstående behandlingsdager, i perioden som er
        ferdigutfylt her. Angi de 12 dager som den ansatte vært borte fom jobbet for behandling. Det kan kun være en
        behandlingsdag per uke. I tillegg kan det ikke være mer enn 15 dager mellom to behandlinger.
      </p>
      <div className={styles.periodewrapper}>
        <div className={styles.datepickerescape}>
          <TextLabel>Behandlingsperiode start</TextLabel>
          <div>{formatDate(behandlingsperiode.fom)}</div>
        </div>
        <div className={styles.datepickerescape}>
          <TextLabel>Behandlingsperiode slutt</TextLabel>
          <div>{formatDate(behandlingsperiode.tom)}</div>
        </div>
      </div>
      <TextLabel>Velg behandlingsdager</TextLabel>
      <p>Kun en en behandlingsdag per uke. Det kan ikke være med enn 15 dager mellom to behandlingsdager.</p>
      <div className={localStyles.multicalwrapper}>
        <UNSAFE_DatePicker {...datepickerProps}>
          <UNSAFE_DatePicker.Standalone
            {...inputProps}
            fromDate={behandlingsperiode.fom}
            toDate={behandlingsperiode.tom}
            mode='multiple'
            onSelect={handleSelectDays}
            numberOfMonths={maaneder.length}
            disableNavigation
            defaultSelected={behandlingsdager}
          />
        </UNSAFE_DatePicker>
      </div>
      {footer && footer.length > 0 && (
        <Alert fullWidth={false} inline={false} size='medium' variant='error'>
          {footer}
        </Alert>
      )}
    </>
  );
}
