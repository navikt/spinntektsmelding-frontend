import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import ButtonEndre from '../../components/ButtonEndre';

describe('ButtonEndre', () => {
  it('renders a title text', () => {
    render(<ButtonEndre />);

    const buttonTitle = screen.getByRole('button', {
      name: /Endre/i
    });
    expect(buttonTitle).toBeInTheDocument();
  });

  it('should have no violations', async () => {
    const { container } = render(<ButtonEndre />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
