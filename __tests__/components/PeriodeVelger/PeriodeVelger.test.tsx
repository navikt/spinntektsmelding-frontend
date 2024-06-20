import { render, screen } from '@testing-library/react';
import PeriodeVelger from '../../../components/PeriodeVelger/PeriodeVelger';
import { describe, it, vi } from 'vitest';

vi.mock('react-hook-form', () => ({
  useController: () => ({
    // field: { value: 'test' },
    formState: { errors: {} }
  }),
  useFieldArray: () => ({
    fields: [],
    append: vi.fn(),
    remove: vi.fn()
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
    watch: () => vi.fn()
  }),
  Controller: () => [],
  useSubscribe: () => ({
    r: { current: { subject: { subscribe: () => vi.fn() } } }
  })
}));

describe('PeriodeVelger', () => {
  it('renders without errors', async () => {
    const perioder = [
      { fom: new Date('2024-03-03'), tom: new Date('2024-03-06'), id: 'a1' },
      { fom: new Date('2024-03-07'), tom: new Date('2024-03-10'), id: 'a2' },
      { fom: new Date('2024-03-11'), tom: new Date('2024-03-14'), id: 'a3' },
      { fom: new Date('2024-02-04'), tom: new Date('2024-02-08'), id: 'a4' },
      { fom: new Date('2024-01-02'), tom: new Date('2024-01-10'), id: 'a5' },
      { fom: new Date('2023-12-24'), tom: new Date('2023-12-31'), id: 'a6' }
    ];
    render(<PeriodeVelger perioder={perioder} />);

    expect(screen.getByText('03.03.2024 - 14.03.2024')).toBeInTheDocument();
  });

  it('renders without errors when there are no perioder', () => {
    const perioder = undefined;
    render(<PeriodeVelger />);

    expect(screen.getByText('Angi sykmeldingsperiode du vil sende inntektsmelding for')).toBeInTheDocument();
  });
});
