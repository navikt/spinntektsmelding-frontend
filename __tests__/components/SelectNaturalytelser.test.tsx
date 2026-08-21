import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import SelectNaturalytelser from '../../components/Naturalytelser/SelectNaturalytelser/SelectNaturalytelser';
import { vi } from 'vitest';

const mockRhf = vi.hoisted(() => ({
  errors: {} as Record<string, unknown>,
  fieldError: {} as Record<string, unknown>
}));

vi.mock('react-hook-form', () => ({
  useController: () => ({
    field: { value: 'BIL', onChange: vi.fn() },
    formState: { errors: mockRhf.errors },
    fieldState: { error: mockRhf.fieldError }
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
        array: new Set('BIL'),
        mount: new Set('BIL'),
        unMount: new Set('BIL'),
        watch: new Set('BIL'),
        focus: 'BIL',
        watchAll: false
      },
      _subjects: {
        watch: vi.fn(),
        array: vi.fn(),
        state: vi.fn()
      },
      _getWatch: vi.fn(),
      _formValues: ['BIL'],
      _defaultValues: ['BIL']
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

describe('SelectNaturalytelser', () => {
  const onChangeYtelseMock = vi.fn();

  beforeEach(() => {
    onChangeYtelseMock.mockClear();
    mockRhf.errors = {};
    mockRhf.fieldError = {};
  });

  it('renders the select component', () => {
    render(<SelectNaturalytelser name='naturalytelse' />);
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
  });

  it('renders the default value if provided', () => {
    render(<SelectNaturalytelser name='naturalytelse' defaultValue='bil' />);
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveValue('BIL');
  });

  it('renders the error message if provided', () => {
    mockRhf.fieldError = { message: 'This is an error' };
    mockRhf.errors = { naturalytelse: { error: 'This is an error' } };
    const errorMessage = 'This is an error';
    render(<SelectNaturalytelser name='naturalytelse' />);
    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<SelectNaturalytelser name='naturalytelse' />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
