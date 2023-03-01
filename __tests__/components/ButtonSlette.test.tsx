import { render, screen } from '@testing-library/react';
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

  it('should have no violations', async () => {
    const { container } = render(<ButtonSlette title='Slette' />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
