import { render, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import Person from '../../components/Person/Person';

const mockFormErrors = vi.hoisted(() => ({ avsenderTlf: undefined as string | undefined }));

vi.mock('react-hook-form', () => ({
  useController: () => ({
    formState: { errors: { avsenderTlf: mockFormErrors.avsenderTlf } }
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
    formState: { errors: { avsenderTlf: mockFormErrors.avsenderTlf } },
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
    mockFormErrors.avsenderTlf = 'Dette er feil';
    const { queryByText } = render(<Person />);
    expect(queryByText('Dette er feil')).not.toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    mockFormErrors.avsenderTlf = undefined;
    const { container } = render(<Person />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
