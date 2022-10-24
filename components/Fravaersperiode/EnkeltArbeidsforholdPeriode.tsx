import { UNSAFE_DatePicker, UNSAFE_useRangeDatepicker } from '@navikt/ds-react';
import localStyles from './Fravaersperiode.module.css';
import useBoundStore from '../../state/useBoundStore';
import { DateRange } from 'react-day-picker';
import { Periode } from '../../state/state';
import { useEffect } from 'react';

interface EnkeltArbeidsforholdPeriodeInterface {
  periodeId: string;
  fravaersperiode: Periode;
  arbeidsforholdId: string;
}

export default function EnkeltArbeidsforholdPeriode({
  periodeId,
  fravaersperiode,
  arbeidsforholdId
}: EnkeltArbeidsforholdPeriodeInterface) {
  const setFravaersperiodeDato = useBoundStore((state) => state.setFravaersperiodeDato);

  const rangeChangeHandler = (dateRange: DateRange | undefined) => {
    if (dateRange) {
      setFravaersperiodeDato(arbeidsforholdId, periodeId, dateRange);
    }
  };

  const { datepickerProps, toInputProps, fromInputProps, setSelected } = UNSAFE_useRangeDatepicker({
    onRangeChange: (dato) => rangeChangeHandler(dato),
    toDate: new Date()
  });

  useEffect(() => {
    setSelected({ from: fravaersperiode?.fra, to: fravaersperiode?.til });
  }, [fravaersperiode]);

  return (
    <div>
      <UNSAFE_DatePicker {...datepickerProps} id={'datovelger-' + periodeId}>
        <div className={localStyles.datowrapper}>
          <UNSAFE_DatePicker.Input {...fromInputProps} label='Fra' id={`fra-${periodeId}`} />
          <UNSAFE_DatePicker.Input {...toInputProps} label='Til' id={`til-${periodeId}`} />
        </div>
      </UNSAFE_DatePicker>
    </div>
  );
}
