import { render, screen } from '@testing-library/react';
// import { FormProvider, useForm } from 'react-hook-form';
import { vi } from 'vitest';
import AarsakDetaljer from '../../../components/Bruttoinntekt/AarsakDetaljer';
const watchMock = vi.fn();
vi.mock('react-hook-form', () => {
  // const actual = await importOriginal();
  return {
    // ...actual,
    useFieldArray: () => ({
      fields: [{}],
      append: vi.fn(),
      remove: vi.fn(),
      replace: vi.fn()
    }),
    useFormContext: () => ({
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
      watch: watchMock,
      register: vi.fn()
    }),
    Controller: () => [],
    useSubscribe: () => ({
      r: { current: { subject: { subscribe: () => vi.fn() } } }
    }),
    useController: () => ({
      // field: { value: 'test' },
      formState: { errors: {} }
    })
  };
});

vi.mock('../../../components/DatoVelger/DatoVelger.tsx', () => ({
  default: ({ label }) => <div>Datovelger {label}</div>
}));

const WithFormProvider = ({ children }: { children: React.ReactNode }) => {
  // const methods = useForm();
  // return <FormProvider {...methods}>{children}</FormProvider>;
  return <div>{children}</div>;
};

const id = 'test-id';
const bestemmendeFravaersdag = new Date();

describe('AarsakDetaljer', () => {
  it('renders Tariffendring gjelder fra when aarsak is Tariffendring', () => {
    watchMock.mockReturnValue({ aarsak: 'Tariffendring' });
    render(
      <WithFormProvider>
        <AarsakDetaljer bestemmendeFravaersdag={bestemmendeFravaersdag} id={id} />
      </WithFormProvider>
    );

    expect(screen.getByText(/Tariffendring gjelder fra/)).toBeInTheDocument();
  });

  it('renders PeriodeListevelger when aarsak is Ferie', () => {
    watchMock.mockReturnValue({ aarsak: 'Ferie' });
    render(
      <WithFormProvider>
        <AarsakDetaljer bestemmendeFravaersdag={bestemmendeFravaersdag} id={id} />
      </WithFormProvider>
    );

    expect(screen.getByText(/Ferie fra/)).toBeInTheDocument();
    expect(screen.getByText(/Ferie til/)).toBeInTheDocument();
  });

  it('renders DatoVelger when aarsak is VarigLoennsendring', () => {
    watchMock.mockReturnValue({ aarsak: 'VarigLoennsendring' });
    render(
      <WithFormProvider>
        <AarsakDetaljer bestemmendeFravaersdag={bestemmendeFravaersdag} id={id} />
      </WithFormProvider>
    );

    expect(screen.getByText(/Lønnsendring gjelder fra/)).toBeInTheDocument();
  });

  it('renders PeriodeListevelger when aarsak is Permisjon', () => {
    watchMock.mockReturnValue({ aarsak: 'Permisjon' });
    render(
      <WithFormProvider>
        <AarsakDetaljer bestemmendeFravaersdag={bestemmendeFravaersdag} id={id} />
      </WithFormProvider>
    );

    expect(screen.getByText(/Permisjon fra/)).toBeInTheDocument();
    expect(screen.getByText(/Permisjon til/)).toBeInTheDocument();
  });

  it('renders PeriodeListevelger when aarsak is Permittering', () => {
    watchMock.mockReturnValue({ aarsak: 'Permittering' });
    render(
      <WithFormProvider>
        <AarsakDetaljer bestemmendeFravaersdag={bestemmendeFravaersdag} id={id} />
      </WithFormProvider>
    );

    expect(screen.getByText(/Permittering fra/)).toBeInTheDocument();
    expect(screen.getByText(/Permittering til/)).toBeInTheDocument();
  });

  it('renders DatoVelger when aarsak is NyStilling', () => {
    watchMock.mockReturnValue({ aarsak: 'NyStilling' });
    render(
      <WithFormProvider>
        <AarsakDetaljer bestemmendeFravaersdag={bestemmendeFravaersdag} id={id} />
      </WithFormProvider>
    );

    expect(screen.getByText(/Ny stilling fra/)).toBeInTheDocument();
  });

  it('renders DatoVelger when aarsak is NyStillingsprosent', () => {
    watchMock.mockReturnValue({ aarsak: 'NyStillingsprosent' });
    render(
      <WithFormProvider>
        <AarsakDetaljer bestemmendeFravaersdag={bestemmendeFravaersdag} id={id} />
      </WithFormProvider>
    );

    expect(screen.getByText(/Ny stillingsprosent fra/)).toBeInTheDocument();
  });

  it('renders PeriodeListevelger when aarsak is Sykefravaer', () => {
    watchMock.mockReturnValue({ aarsak: 'Sykefravaer' });
    render(
      <WithFormProvider>
        <AarsakDetaljer bestemmendeFravaersdag={bestemmendeFravaersdag} id={id} />
      </WithFormProvider>
    );

    expect(screen.getByText(/Sykefravær fra/)).toBeInTheDocument();
    expect(screen.getByText(/Sykefravær til/)).toBeInTheDocument();
  });
});
