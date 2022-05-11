import { render, screen } from '@testing-library/react';
import ButtonSlette from '../../components/ButtonSlette/ButtonSlette';
import '@testing-library/jest-dom';

describe('ButtonSlette', () => {
  it('renders a title text', () => {
    render(<ButtonSlette title='Slette' />);

    const buttonTitle = screen.getByRole('button', {
      name: /Slette/i
    });

    expect(buttonTitle).toBeInTheDocument();
  });
});
