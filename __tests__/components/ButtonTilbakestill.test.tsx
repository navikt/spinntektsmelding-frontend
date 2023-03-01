import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import ButtonTilbakestill from '../../components/ButtonTilbakestill';

describe('ButtonTilbakestill', () => {
  it('renders a title text', () => {
    render(<ButtonTilbakestill />);

    const buttonTitle = screen.getByRole('button', {
      name: /Tilbakestill/i
    });

    expect(buttonTitle).toBeInTheDocument();
  });

  it('should have no violations', async () => {
    const { container } = render(<ButtonTilbakestill />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
