import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import SelectEndringBruttoinntekt from '../../components/Bruttoinntekt/SelectEndringBruttoinntekt';
import begrunnelseEndringBruttoinntekt from '../../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import { vi } from 'vitest';
import begrunnelseEndringBruttoinntektTekster from '../../components/Bruttoinntekt/begrunnelseEndringBruttoinntektTekster';

describe('SelectEndringBruttoinntekt', () => {
  const onChangeBegrunnelse = vi.fn();
  const props = {
    onChangeBegrunnelse,
    nyInnsending: true
  };

  it('should render the component with options', () => {
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

  it('should call onChangeBegrunnelse when an option is selected', async () => {
    render(<SelectEndringBruttoinntekt {...props} />);
    const select = screen.getByLabelText('Velg endringsårsak');
    await userEvent.selectOptions(select, 'Bonus');
    expect(onChangeBegrunnelse).toHaveBeenCalledTimes(1);
    expect(onChangeBegrunnelse).toHaveBeenCalledWith('Bonus');
  });

  it('should not render Tariffendring option when nyInnsending is true', () => {
    render(<SelectEndringBruttoinntekt {...props} />);
    expect(screen.queryByText('Tariffendring')).not.toBeInTheDocument();
  });

  it('should render Tariffendring option when nyInnsending is false', () => {
    render(<SelectEndringBruttoinntekt {...props} nyInnsending={false} />);
    expect(screen.getByText('Tariffendring')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<SelectEndringBruttoinntekt {...props} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
