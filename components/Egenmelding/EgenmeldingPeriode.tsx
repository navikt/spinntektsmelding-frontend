import localStyles from './Egenmelding.module.css';
import { Periode } from '../../state/state';
import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
import formatDate from '../../utils/formatDate';
import Periodevelger, { PeriodeParam } from '../Bruttoinntekt/Periodevelger';
import { subDays } from 'date-fns';

interface EgenmeldingPeriodeInterface {
  periodeId: string;
  egenmeldingsperiode: Periode;
  endreEgenmeldingsperiode: boolean;
  setEgenmeldingDato: (dateValue: PeriodeParam | undefined, periodeId: string) => void;
  toDate: Date;
  kanSlettes: boolean;
  onSlettRad: () => void;
  disabled?: boolean;
}

export default function EgenmeldingPeriode({
  periodeId,
  egenmeldingsperiode,
  endreEgenmeldingsperiode,
  setEgenmeldingDato,
  toDate,
  kanSlettes,
  onSlettRad,
  disabled
}: EgenmeldingPeriodeInterface) {
  const rangeChangeHandler = (dateRange: PeriodeParam | undefined) => {
    setEgenmeldingDato(dateRange, periodeId);
  };

  if (!endreEgenmeldingsperiode) {
    return (
      <>
        <div className={styles.datepickerescape}>
          <TextLabel>Fra</TextLabel>
          <div>{formatDate(egenmeldingsperiode.fom)}</div>
        </div>
        <div className={styles.datepickerescape}>
          <TextLabel>Til</TextLabel>
          <div>{formatDate(egenmeldingsperiode.tom)}</div>
        </div>
      </>
    );
  }

  return (
    <div>
      <div className={localStyles.datowrapper}>
        <Periodevelger
          fomTekst='Fra'
          fomID={`fom-${periodeId}`}
          tomTekst='Til'
          tomID={`tom-${periodeId}`}
          onRangeChange={rangeChangeHandler}
          defaultRange={{ fom: egenmeldingsperiode?.fom, tom: egenmeldingsperiode?.tom, id: '1' }}
          kanSlettes={kanSlettes}
          periodeId={periodeId}
          onSlettRad={onSlettRad}
          toDate={toDate}
          disabled={disabled}
          defaultMonth={egenmeldingsperiode?.fom ? subDays(egenmeldingsperiode?.fom, 1) : egenmeldingsperiode?.fom}
        />
      </div>
    </div>
  );
}
