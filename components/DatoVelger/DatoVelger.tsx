import { DatePicker, useDatepicker } from '@navikt/ds-react';
import { isValid } from 'date-fns';
import { useEffect, useEffectEvent, useState, useCallback, useRef } from 'react';
import { FieldPath, FieldValues, useController, useFormContext } from 'react-hook-form';
import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';

interface DatoVelgerProps {
  defaultSelected?: Date;
  toDate?: Date;
  fromDate?: Date;
  label?: string;
  hideLabel?: boolean;
  disabled?: boolean;
  defaultMonth?: Date;
  name: FieldPath<FieldValues>;
}

export default function DatoVelger({
  defaultSelected,
  toDate,
  fromDate,

  label,
  hideLabel,
  disabled,
  defaultMonth,
  name
}: Readonly<DatoVelgerProps>) {
  if (!defaultSelected || !isValid(defaultSelected)) {
    defaultSelected = undefined;
  }

  const { control } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const preventCloseRef = useRef(false);

  const {
    field,
    // fieldState: { invalid, isTouched, isDirty },
    formState: { errors }
    // formState: { touchedFields, dirtyFields }
  } = useController({
    name,
    control

    // rules: { required: true },
  });
  const error = findErrorInRHFErrors(name, errors);

  const handleDateChange = useCallback(
    (date?: Date) => {
      field.onChange(date);
      if (date) {
        setIsOpen(false);
      }
    },
    [field]
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

  const { datepickerProps, inputProps, reset } = useDatepicker({
    toDate: toDate,
    fromDate: fromDate,
    onDateChange: handleDateChange,
    defaultSelected: defaultSelected ?? field.value,
    defaultMonth: defaultMonth
  });

  const onReset = useEffectEvent(() => {
    reset();
  });

  useEffect(() => {
    if (defaultSelected === undefined) {
      onReset();
    }
  }, [defaultSelected]);

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
          id={ensureValidHtmlId(name)}
          hideLabel={hideLabel}
          disabled={disabled}
          error={error}
        />
      </DatePicker>
    </div>
  );
}
