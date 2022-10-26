import { UNSAFE_DatePicker, UNSAFE_useRangeDatepicker } from '@navikt/ds-react';
import localStyles from './Egenmelding.module.css';
import useBoundStore from '../../state/useBoundStore';
import { DateRange } from 'react-day-picker';
import { Periode } from '../../state/state';

interface EgenmeldingPeriodeInterface {
  periodeId: string;
  egenmeldingsperiode: Periode;
}

export default function EgenmeldingPeriode({ periodeId, egenmeldingsperiode }: EgenmeldingPeriodeInterface) {
  const setEgenmeldingDato = useBoundStore((state) => state.setEgenmeldingDato);

  const rangeChangeHandler = (dateRange: DateRange | undefined) => {
    if (dateRange) {
      setEgenmeldingDato(dateRange, periodeId);
    }
  };

  const { datepickerProps, toInputProps, fromInputProps } = UNSAFE_useRangeDatepicker({
    onRangeChange: (dato) => rangeChangeHandler(dato),
    toDate: new Date()
  });

  const selected: DateRange = { from: egenmeldingsperiode?.fra, to: egenmeldingsperiode?.til };

  return (
    <div>
      <UNSAFE_DatePicker {...datepickerProps} id={'datovelger-' + periodeId} selected={selected}>
        <div className={localStyles.datowrapper}>
          <UNSAFE_DatePicker.Input {...fromInputProps} label='Fra' id={`fra-${periodeId}`} />
          <UNSAFE_DatePicker.Input {...toInputProps} label='Til' id={`til-${periodeId}`} />
        </div>
      </UNSAFE_DatePicker>
    </div>
  );
}
