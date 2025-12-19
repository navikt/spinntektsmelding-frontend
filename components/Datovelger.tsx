import { DatePicker, useDatepicker } from '@navikt/ds-react';
import { isValid } from 'date-fns';
import { useState, useCallback, useRef } from 'react';
import ensureValidHtmlId from '../utils/ensureValidHtmlId';

interface DatovelgerProps {
  onDateChange?: (val?: Date | undefined) => void;
  defaultSelected?: Date;
  toDate?: Date;
  fromDate?: Date;
  id?: string;
  label?: string;
  hideLabel?: boolean;
  disabled?: boolean;
  defaultMonth?: Date;
  error?: React.ReactNode;
}

export default function Datovelger({
  onDateChange,
  defaultSelected,
  toDate,
  fromDate,
  id,
  label,
  hideLabel,
  disabled,
  defaultMonth,
  error
}: Readonly<DatovelgerProps>) {
  if (!defaultSelected || !isValid(defaultSelected)) {
    defaultSelected = undefined;
  }

  const [isOpen, setIsOpen] = useState(false);
  const preventCloseRef = useRef(false);

  const handleDateChange = useCallback(
    (date?: Date) => {
      onDateChange?.(date);
      if (date) {
        setIsOpen(false);
      }
    },
    [onDateChange]
  );

  const handleClose = useCallback(() => {
    if (!preventCloseRef.current) {
      setIsOpen(false);
    }
    preventCloseRef.current = false;
  }, []);

  const handleMouseDownCapture = useCallback((e: React.MouseEvent) => {
    // Sjekk om klikket er på navigasjonsknapper eller select
    const target = e.target as HTMLElement;
    if (
      target.closest('button[class*="caption"]') ||
      target.closest('button[name="previous-month"]') ||
      target.closest('button[name="next-month"]') ||
      target.closest('select') ||
      target.closest('.rdp-nav') ||
      target.closest('.rdp-dropdown')
    ) {
      preventCloseRef.current = true;
    }
  }, []);

  const { datepickerProps, inputProps } = useDatepicker({
    toDate: toDate,
    fromDate: fromDate,
    onDateChange: handleDateChange,
    defaultSelected: defaultSelected,
    defaultMonth: defaultMonth
  });

  return (
    <div onMouseDownCapture={handleMouseDownCapture}>
      <DatePicker
        {...datepickerProps}
        strategy='fixed'
        open={isOpen}
        onOpenToggle={() => setIsOpen((prev) => !prev)}
        onClose={handleClose}
      >
        <DatePicker.Input
          {...inputProps}
          label={label}
          id={ensureValidHtmlId(id)}
          hideLabel={hideLabel}
          disabled={disabled}
          error={error}
        />
      </DatePicker>
    </div>
  );
}
