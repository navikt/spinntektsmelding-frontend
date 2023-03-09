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

  const forigeMndAaar = egenmeldingsperiode?.fom
    ? subDays(egenmeldingsperiode?.fom, 1).getFullYear()
    : new Date().getFullYear();
  const forigeMndMnd = egenmeldingsperiode?.fom
    ? subDays(egenmeldingsperiode?.fom, 1).getMonth()
    : new Date().getMonth();

  const defaultMnd = new Date(forigeMndAaar, forigeMndMnd);

  return (
    <div data-cy='egenmelding'>
      <Periodevelger
        fomTekst='Fra'
        fomID={`egenmeldingsperiode-fom-${periodeId}`}
        tomTekst='Til'
        tomID={`egenmeldingsperiode-tom-${periodeId}`}
        onRangeChange={rangeChangeHandler}
        defaultRange={egenmeldingsperiode}
        kanSlettes={kanSlettes}
        periodeId={periodeId}
        onSlettRad={onSlettRad}
        toDate={toDate}
        disabled={disabled}
        defaultMonth={defaultMnd}
      />
    </div>
  );
}
