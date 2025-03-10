import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import SelectEndringBruttoinntekt from '../../components/Bruttoinntekt/SelectEndringBruttoinntekt';
import begrunnelseEndringBruttoinntekt from '../../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import { vi } from 'vitest';
import begrunnelseEndringBruttoinntektTekster from '../../components/Bruttoinntekt/begrunnelseEndringBruttoinntektTekster';

vi.mock('react-hook-form', () => ({
  useController: () => ({
    // field: { value: 'test' },
    formState: { errors: {} }
  }),
  useFieldArray: () => ({
    fields: [{}],
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

describe('SelectEndringBruttoinntekt', () => {
  const onChangeBegrunnelse = vi.fn();
  const props = {
    onChangeBegrunnelse,
    nyInnsending: true,
    register: vi.fn(),
    id: 'id'
  };

  it.skip('should render the component with options', () => {
    render(<SelectEndringBruttoinntekt {...props} />);
    const select = screen.getByLabelText('Velg endringsårsak');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('');
    expect(screen.getByText('Velg begrunnelse')).toBeInTheDocument();
    Object.keys(begrunnelseEndringBruttoinntekt)
      .filter((key) => key !== ('Tariffendring' as keyof typeof begrunnelseEndringBruttoinntekt))
      .forEach((key: keyof typeof begrunnelseEndringBruttoinntekt) => {
        expect(screen.getByText(begrunnelseEndringBruttoinntektTekster[key])).toBeInTheDocument();
      });
  });

  it.skip('should call onChangeBegrunnelse when an option is selected', async () => {
    render(<SelectEndringBruttoinntekt {...props} />);
    const select = screen.getByLabelText('Velg endringsårsak');
    await userEvent.selectOptions(select, 'Bonus');
    expect(onChangeBegrunnelse).toHaveBeenCalledTimes(1);
    expect(onChangeBegrunnelse).toHaveBeenCalledWith('Bonus');
  });

  it.skip('should not render Tariffendring option when nyInnsending is true', () => {
    render(<SelectEndringBruttoinntekt {...props} />);
    expect(screen.queryByText('Tariffendring')).not.toBeInTheDocument();
  });

  it.skip('should render Tariffendring option when nyInnsending is false', () => {
    render(<SelectEndringBruttoinntekt {...props} nyInnsending={false} />);
    expect(screen.getByText('Tariffendring')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<SelectEndringBruttoinntekt {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
