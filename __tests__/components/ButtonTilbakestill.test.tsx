import { render, screen } from '@testing-library/react';
import ButtonTilbakestill from '../../components/ButtonTilbakestill';

describe('ButtonTilbakestill', () => {
  it('renders a title text', () => {
    render(<ButtonTilbakestill title='Slette' />);

    const buttonTitle = screen.getByRole('button', {
      name: /Tilbakestill/i
    });

    expect(buttonTitle).toBeInTheDocument();
  });
});
