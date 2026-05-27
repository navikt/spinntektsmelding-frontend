import React from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DatoVelger from '../../components/DatoVelger/DatoVelger';

const mockReset = vi.fn();
const mockUseDatepicker = vi.fn();

vi.mock('@navikt/ds-react', () => {
  const DatePicker = ({ children }) => <div>{children}</div>;
  DatePicker.Input = (props) => <input {...props} />;

  return {
    DatePicker,
    useDatepicker: (...args) => mockUseDatepicker(...args)
  };
});

vi.mock('react-hook-form', () => ({
  useFormContext: () => ({
    control: {}
  }),
  useController: () => ({
    field: {
      value: new Date('2024-01-15'),
      onChange: vi.fn()
    },
    formState: {
      errors: {}
    }
  })
}));

describe('DatoVelger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDatepicker.mockReturnValue({
      datepickerProps: {},
      inputProps: {},
      reset: mockReset
    });
  });

  it('normalizes invalid defaultSelected to field value and resets', () => {
    render(<DatoVelger name='inntekt.startdato' label='Dato' defaultSelected={new Date('not-a-date')} />);

    expect(mockUseDatepicker).toHaveBeenCalled();
    const options = mockUseDatepicker.mock.calls[0][0];
    expect(options.defaultSelected).toEqual(new Date('2024-01-15'));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('uses valid defaultSelected without resetting', () => {
    const validDate = new Date('2024-02-20');

    render(<DatoVelger name='inntekt.startdato' label='Dato' defaultSelected={validDate} />);

    expect(mockUseDatepicker).toHaveBeenCalled();
    const options = mockUseDatepicker.mock.calls[0][0];
    expect(options.defaultSelected).toEqual(validDate);
    expect(mockReset).not.toHaveBeenCalled();
  });
});
