import { UNSAFE_DatePicker, UNSAFE_useRangeDatepicker } from '@navikt/ds-react';
import localStyles from './Egenmelding.module.css';
import { DateRange } from 'react-day-picker';
import { Periode } from '../../state/state';
import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
import formatDate from '../../utils/formatDate';

interface EgenmeldingPeriodeInterface {
  periodeId: string;
  egenmeldingsperiode: Periode;
  endreEgenmeldingsperiode: boolean;
  setEgenmeldingDato: (dateValue: DateRange | undefined, periodeId: string) => void;
  toDate: Date;
}

export default function EgenmeldingPeriode({
  periodeId,
  egenmeldingsperiode,
  endreEgenmeldingsperiode,
  setEgenmeldingDato,
  toDate
}: EgenmeldingPeriodeInterface) {
  const rangeChangeHandler = (dateRange: DateRange | undefined) => {
    if (dateRange) {
      setEgenmeldingDato(dateRange, periodeId);
    }
  };

  const { datepickerProps, toInputProps, fromInputProps } = UNSAFE_useRangeDatepicker({
    onRangeChange: (dato) => rangeChangeHandler(dato),
    toDate: toDate,
    defaultSelected: { from: egenmeldingsperiode?.fom, to: egenmeldingsperiode?.tom }
  });

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
      <UNSAFE_DatePicker {...datepickerProps} id={'datovelger-egenmelding-' + periodeId}>
        <div className={localStyles.datowrapper}>
          <UNSAFE_DatePicker.Input {...fromInputProps} label='Fra' id={`fom-${periodeId}`} />
          <UNSAFE_DatePicker.Input {...toInputProps} label='Til' id={`tom-${periodeId}`} />
        </div>
      </UNSAFE_DatePicker>
    </div>
  );
}
