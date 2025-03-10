import { fireEvent, render, screen } from '@testing-library/react';
import TariffendringDato from '../../components/Bruttoinntekt/TariffendringDato';
import { vi } from 'vitest';
import parseIsoDate from '../../utils/parseIsoDate';
import { on } from 'events';

vi.mock('react-hook-form', () => ({
  useController: () => ({
    field: { value: 'test', onChange: vi.fn() },
    formState: { errors: {} }
  }),
  useFieldArray: () => ({
    fields: [
      {
        onChange: vi.fn()
      }
    ],
    append: vi.fn(),
    remove: vi.fn(),
    replace: vi.fn()
  }),
  useFormContext: () => ({
    handleSubmit: () => vi.fn(),
    control: {
      register: vi.fn(),
      unregister: vi.fn(),
      getFieldState: vi.fn(),
      _names: {
        array: new Set('test'),
        mount: new Set('test'),
        unMount: new Set('test'),
        watch: new Set('test'),
        focus: 'test',
        watchAll: false
      },
      _subjects: {
        watch: vi.fn(),
        array: vi.fn(),
        state: vi.fn()
      },
      _getWatch: vi.fn(),
      _formValues: ['test'],
      _defaultValues: ['test']
    },
    getValues: () => {
      return [];
    },
    setValue: () => vi.fn(),
    formState: () => vi.fn(),
    watch: () => vi.fn(),
    register: vi.fn()
  }),
  Controller: () => [],
  useSubscribe: () => ({
    r: { current: { subject: { subscribe: () => vi.fn() } } }
  })
}));

describe('TariffendringDato', () => {
  const changeTariffEndretDato = vi.fn();
  const changeTariffKjentDato = vi.fn();

  it('should render two date pickers', () => {
    render(<TariffendringDato name='test' />);

    const datePickers = screen.getAllByRole('textbox');
    expect(datePickers).toHaveLength(2);
  });

  it.skip('should call changeTariffEndretDato when the first date picker is changed', () => {
    render(<TariffendringDato name='test' />);

    const firstDatePicker = screen.getAllByRole('textbox')[0];
    fireEvent.change(firstDatePicker, { target: { value: '01.01.2022' } });
    expect(changeTariffEndretDato).toHaveBeenCalledWith(parseIsoDate('2022-01-01'));
  });

  it.skip('should call changeTariffKjentDato when the second date picker is changed', () => {
    render(<TariffendringDato name='test' />);

    const secondDatePicker = screen.getAllByRole('textbox')[1];
    fireEvent.change(secondDatePicker, { target: { value: '01.01.2022' } });
    expect(changeTariffKjentDato).toHaveBeenCalledWith(parseIsoDate('2022-01-01'));
  });
});
