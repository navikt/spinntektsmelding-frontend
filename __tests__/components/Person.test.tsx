import { render, fireEvent } from '@testing-library/react';
import Person from '../../components/Person/Person';

vi.mock('react-hook-form', () => ({
  useController: () => ({
    // field: { value: 'test' },
    formState: { errors: { avsenderTlf: undefined } }
  }),
  useFieldArray: () => ({
    fields: [{ onChange: vi.fn() }],
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
    formState: { errors: { avsenderTlf: undefined } },
    watch: () => vi.fn(),
    register: vi.fn()
  }),
  Controller: () => [],
  useSubscribe: () => ({
    r: { current: { subject: { subscribe: () => vi.fn() } } }
  })
}));

describe('Person component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Person />);
    expect(getByText(/For at vi skal utbetale riktig beløp i forbindelse med sykmelding/)).toBeInTheDocument();
  });

  it('renders correctly with an error', () => {
    vi.mock('react-hook-form', () => ({
      useController: () => ({
        // field: { value: 'test' },
        formState: { errors: { avsenderTlf: undefined } }
      }),
      useFieldArray: () => ({
        fields: [{ onChange: vi.fn() }],
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
        formState: { errors: { avsenderTlf: 'Dette er feil' } },
        watch: () => vi.fn(),
        register: vi.fn()
      }),
      Controller: () => [],
      useSubscribe: () => ({
        r: { current: { subject: { subscribe: () => vi.fn() } } }
      })
    }));
    const { queryByText } = render(<Person />);
    expect(queryByText('Dette er feil')).not.toBeInTheDocument();
  });
});
