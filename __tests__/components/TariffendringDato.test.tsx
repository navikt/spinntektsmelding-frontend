import { fireEvent, render, screen } from '@testing-library/react';
import TariffendringDato from '../../components/Bruttoinntekt/TariffendringDato';
import { vi } from 'vitest';
import parseIsoDate from '../../utils/parseIsoDate';

const onChangeMock = vi.fn();

vi.mock('react-hook-form', () => ({
  useController: () => ({
    field: { value: new Date(), onChange: onChangeMock },
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render two date pickers', () => {
    render(<TariffendringDato name='test' />);

    const datePickers = screen.getAllByRole('textbox');
    expect(datePickers).toHaveLength(2);
  });

  it('should call changeTariffEndretDato when the first date picker is changed', () => {
    render(<TariffendringDato name='test' />);

    const firstDatePicker = screen.getAllByRole('textbox')[0];
    fireEvent.change(firstDatePicker, { target: { value: '01.01.2022' } });
    expect(onChangeMock).toHaveBeenCalledWith(parseIsoDate('2022-01-01'));
  });

  it('should call changeTariffKjentDato when the second date picker is changed', () => {
    render(<TariffendringDato name='test' />);

    const secondDatePicker = screen.getAllByRole('textbox')[1];
    fireEvent.change(secondDatePicker, { target: { value: '01.01.2022' } });
    expect(onChangeMock).toHaveBeenCalledWith(parseIsoDate('2022-01-01'));
  });
});
