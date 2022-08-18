import formatDate from '../../utils/formatDate';
import Heading3 from '../Heading3/Heading3';
import styles from '../../styles/Home.module.css';
import localStyles from './Behandlingsdager.module.css';
import TextLabel from '../TextLabel/TextLabel';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useState } from 'react';
import nb from 'date-fns/locale/nb';
import { eachMonthOfInterval, getWeek } from 'date-fns';
import { Alert } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';

export default function Behandlingsdager() {
  const [behandlingsdager, behandlingsperiode, setBehandlingsdager] = useBoundStore((state) => [
    state.behandlingsdager,
    state.behandlingsperiode,
    state.setBehandlingsdager
  ]);

  const [footer, setFooter] = useState<string>('');
  const maaneder = eachMonthOfInterval({
    start: behandlingsperiode?.fra || new Date(),
    end: behandlingsperiode?.til || new Date()
  });

  const handleSelectDays = (selectedDays: Date[] | undefined) => {
    const weeks: Array<number> | undefined = selectedDays?.map((day) => getWeek(day));
    const uniqueWeeks: Array<number> = Array.from(new Set(weeks));

    if (weeks && weeks.length !== uniqueWeeks.length) {
      setFooter('Man kan kun ha en behandling per uke.');
    } else {
      setFooter('');
    }

    setBehandlingsdager(selectedDays);
  };
  if (!behandlingsperiode) return null;
  return (
    <>
      <Heading3>Fraværsperiode - behandlingsdager</Heading3>
      <p>
        I følge sykmeldingen hadde den ansatte sykmelding for enkeltstående behandlingsdager, i perioden som er
        ferdigutfylt her. Angi de 12 dager som den ansatte vært borte fra jobbet for behandling. Det kan kun være en
        behandlingsdag per uke. I tillegg kan det ikke være mer enn 15 dager mellom to behandlinger.
      </p>
      <div className={styles.periodewrapper}>
        <div className={styles.datepickerescape}>
          <TextLabel>Behandlingsperiode start</TextLabel>
          <div>{formatDate(behandlingsperiode.fra)}</div>
        </div>
        <div className={styles.datepickerescape}>
          <TextLabel>Behandlingsperiode slutt</TextLabel>
          <div>{formatDate(behandlingsperiode.til)}</div>
        </div>
      </div>
      <TextLabel>Velg behandlingsdager</TextLabel>
      <p>Kun en en behandlingsdag per uke. Det kan ikke være med enn 15 dager mellom to behandlingsdager.</p>
      <div className={localStyles.multicalwrapper}>
        <DayPicker
          mode='multiple'
          min={1}
          selected={behandlingsdager}
          onSelect={handleSelectDays}
          locale={nb}
          numberOfMonths={maaneder.length}
          month={maaneder[0]}
          fromDate={behandlingsperiode.fra}
          toDate={behandlingsperiode.til}
        />
      </div>
      {footer && footer.length > 0 && (
        <Alert fullWidth={false} inline={false} size='medium' variant='error'>
          {footer}
        </Alert>
      )}
    </>
  );
}
