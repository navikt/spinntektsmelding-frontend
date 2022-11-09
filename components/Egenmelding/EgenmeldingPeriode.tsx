import { UNSAFE_DatePicker, UNSAFE_useRangeDatepicker } from '@navikt/ds-react';
import localStyles from './Egenmelding.module.css';
import useBoundStore from '../../state/useBoundStore';
import { DateRange } from 'react-day-picker';
import { Periode } from '../../state/state';
import { useEffect } from 'react';
import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
import formatDate from '../../utils/formatDate';

interface EgenmeldingPeriodeInterface {
  periodeId: string;
  egenmeldingsperiode: Periode;
  arbeidsforholdId: string;
}

export default function EgenmeldingPeriode({
  periodeId,
  egenmeldingsperiode,
  arbeidsforholdId
}: EgenmeldingPeriodeInterface) {
  const setEgenmeldingDato = useBoundStore((state) => state.setEgenmeldingDato);
  const endreEgenmeldingsperiode = useBoundStore((state) => state.endreEgenmeldingsperiode);

  const rangeChangeHandler = (dateRange: DateRange | undefined) => {
    if (dateRange) {
      setEgenmeldingDato(dateRange, periodeId);
    }
  };

  const { datepickerProps, toInputProps, fromInputProps, setSelected } = UNSAFE_useRangeDatepicker({
    onRangeChange: (dato) => rangeChangeHandler(dato),
    toDate: new Date()
  });

  useEffect(() => {
    setSelected({ from: egenmeldingsperiode?.fra, to: egenmeldingsperiode?.til });
  }, [egenmeldingsperiode]);

  if (!endreEgenmeldingsperiode[arbeidsforholdId]) {
    return (
      <>
        <div className={styles.datepickerescape}>
          <TextLabel>Egenmelding fra</TextLabel>
          <div>{formatDate(egenmeldingsperiode.fra)}</div>
        </div>
        <div className={styles.datepickerescape}>
          <TextLabel>Egenmelding til</TextLabel>
          <div>{formatDate(egenmeldingsperiode.til)}</div>
        </div>
      </>
    );
  }

  return (
    <div>
      <UNSAFE_DatePicker {...datepickerProps} id={'datovelger-egenmelding-' + periodeId}>
        <div className={localStyles.datowrapper}>
          <UNSAFE_DatePicker.Input {...fromInputProps} label='Egenmelding fra' id={`fra-${periodeId}`} />
          <UNSAFE_DatePicker.Input {...toInputProps} label='Egenmelding til' id={`til-${periodeId}`} />
        </div>
      </UNSAFE_DatePicker>
    </div>
  );
}
