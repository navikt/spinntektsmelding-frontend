import { render, screen, fireEvent } from '@testing-library/react';
import SelectNaturalytelser from '../../components/Naturalytelser/SelectNaturalytelser/SelectNaturalytelser';
import { vi } from 'vitest';

vi.mock('react-hook-form', () => ({
  useController: () => ({
    field: { value: 'BIL', onChange: vi.fn() },
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
    vi.mock('react-hook-form', () => ({
      useController: () => ({
        field: { value: 'BIL', onChange: vi.fn() },
        formState: {
          errors: {
            naturalytelse: {
              error: 'This is an error'
            }
          }
        }
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
    const errorMessage = 'This is an error';
    render(<SelectNaturalytelser name='naturalytelse' />);
    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
  });
});
