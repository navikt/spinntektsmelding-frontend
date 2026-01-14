import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import ButtonSlette from '../../components/ButtonSlette/ButtonSlette';

describe('ButtonSlette', () => {
  it('renders a title text', () => {
    render(<ButtonSlette title='Slette' />);

    const buttonTitle = screen.getByRole('button', {
      name: /Slette/i
    });

    expect(buttonTitle).toBeInTheDocument();
  });

  it('uses "Slette" as icon title when title is empty', () => {
    render(<ButtonSlette title='' />);

    const button = screen.getByRole('button', { name: 'Slette' });

    expect(button).toBeInTheDocument();
  });

  it('uses provided title for icon', () => {
    render(<ButtonSlette title='Fjern element' />);

    const button = screen.getByRole('button', { name: 'Fjern element' });

    expect(button).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<ButtonSlette title='Slette' onClick={handleClick} />);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<ButtonSlette title='Slette' onClick={handleClick} disabled />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<ButtonSlette title='Slette' className='custom-class' />);

    const button = screen.getByRole('button');

    expect(button).toHaveClass('custom-class');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<ButtonSlette title='Slette' />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when title is empty', async () => {
    const { container } = render(<ButtonSlette title='' />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
