import Naturalytelser from '../../components/Naturalytelser';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
// import { isValid } from 'date-fns';

// vi.mock('../../../components/DatoVelger/DatoVelger.tsx', () => ({
//   default: ({ label }) => <div>Datovelger {label}</div>
// }));

const mockReplace = vi.fn();
const mockAppend = vi.fn();
const mockRemove = vi.fn();

vi.mock('react-hook-form', () => ({
  useController: () => ({
    field: { value: new Date(), onChange: vi.fn() },
    formState: { errors: {} },
    fieldState: { error: {} }
  }),
  useFieldArray: () => ({
    fields: [{ naturalytelse: 'BIL', sluttdato: new Date(), verdiBeloep: 123, id: 1, onChange: vi.fn() }],
    append: mockAppend,
    remove: mockRemove,
    replace: mockReplace
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
    watch: () => vi.fn().mockReturnValue(true),
    register: vi.fn()
  }),
  Controller: () => [],
  useSubscribe: () => ({
    r: { current: { subject: { subscribe: () => vi.fn() } } }
  })
}));

describe('Naturalytelser', () => {
  const mockStore = {
    naturalytelser: [],

    slettAlleNaturalytelser: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // afterEach(() => {
  //   vi.clearAllMocks();
  // });

  it('renders the component', () => {
    render(<Naturalytelser />);
    expect(screen.getAllByText('Naturalytelser')).toHaveLength(3);
    expect(
      screen.getByLabelText('Har den ansatte naturalytelser som faller bort under sykefraværet?')
    ).toBeInTheDocument();
  });

  it.skip('adds a naturalytelse when checkbox is checked', () => {
    vi.mock('react-hook-form', () => ({
      useController: () => ({
        field: { value: new Date(), onChange: vi.fn() },
        formState: { errors: {} },
        fieldState: { error: {} }
      }),
      useFieldArray: () => ({
        fields: [],
        append: mockAppend,
        remove: mockRemove,
        replace: mockReplace
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
        fieldState: () => vi.fn(),
        watch: () => vi.fn().mockReturnValue(false),
        register: vi.fn()
      }),
      Controller: () => [],
      useSubscribe: () => ({
        r: { current: { subject: { subscribe: () => vi.fn() } } }
      })
    }));

    render(<Naturalytelser />);
    const checkbox = screen.getByLabelText('Har den ansatte naturalytelser som faller bort under sykefraværet?');
    fireEvent.click(checkbox);

    expect(mockReplace).toHaveBeenCalled();
  });

  it.skip('removes all naturalytelser when checkbox is unchecked', () => {
    vi.mock('react-hook-form', () => ({
      useController: () => ({
        field: { value: new Date(), onChange: vi.fn() },
        formState: { errors: {} }
      }),
      useFieldArray: () => ({
        fields: [{ naturalytelse: 'BIL', sluttdato: new Date(), verdiBeloep: 123, id: 1, onChange: vi.fn() }],
        append: mockAppend,
        remove: mockRemove,
        replace: mockReplace
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
        fieldState: () => vi.fn(),
        watch: () => vi.fn().mockReturnValue(true),
        register: vi.fn()
      }),
      Controller: () => [],
      useSubscribe: () => ({
        r: { current: { subject: { subscribe: () => vi.fn() } } }
      })
    }));

    render(<Naturalytelser />);
    const checkbox = screen.getByLabelText('Har den ansatte naturalytelser som faller bort under sykefraværet?');
    fireEvent.click(checkbox);

    expect(mockRemove).toHaveBeenCalled();
  });

  it('adds a new naturalytelse when "Legg til naturalytelse" button is clicked', () => {
    vi.mock('react-hook-form', () => ({
      useController: () => ({
        field: { value: new Date(), onChange: vi.fn() },
        formState: { errors: {} },
        fieldState: { error: {} }
      }),
      useFieldArray: () => ({
        fields: [{ naturalytelse: 'BIL', sluttdato: new Date(), verdiBeloep: 123, id: 1, onChange: vi.fn() }],
        append: mockAppend,
        remove: mockRemove,
        replace: mockReplace
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
        fieldState: () => vi.fn(),
        watch: () => vi.fn().mockReturnValue(true),
        register: vi.fn()
      }),
      Controller: () => [],
      useSubscribe: () => ({
        r: { current: { subject: { subscribe: () => vi.fn() } } }
      })
    }));

    render(<Naturalytelser />);
    const button = screen.getByText('Legg til naturalytelse');
    fireEvent.click(button);

    expect(mockAppend).toHaveBeenCalled();
  });

  it('removes a naturalytelse when "Slett ytelse" button is clicked', () => {
    vi.mock('react-hook-form', () => ({
      useController: () => ({
        field: { value: new Date(), onChange: vi.fn() },
        formState: { errors: {} },
        fieldState: { error: {} }
      }),
      useFieldArray: () => ({
        fields: [
          { naturalytelse: 'BIL', sluttdato: new Date(), verdiBeloep: 123, id: 1, onChange: vi.fn() },
          { naturalytelse: 'BIL', sluttdato: new Date(), verdiBeloep: 123, id: 1, onChange: vi.fn() }
        ],
        append: mockAppend,
        remove: mockRemove,
        replace: mockReplace
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
        fieldState: () => vi.fn(),
        watch: () => vi.fn().mockReturnValue(true),
        register: vi.fn()
      }),
      Controller: () => [],
      useSubscribe: () => ({
        r: { current: { subject: { subscribe: () => vi.fn() } } }
      })
    }));
    // mockStore.naturalytelser = [{ id: '1', type: '', bortfallsdato: '', verdi: '' }];
    render(<Naturalytelser />);
    const button = screen.getByTitle('Slett ytelse');
    fireEvent.click(button);

    expect(mockRemove).toHaveBeenCalled();
  });
});
