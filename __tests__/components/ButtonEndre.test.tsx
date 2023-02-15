import { render, screen } from '@testing-library/react';
import ButtonEndre from '../../components/ButtonEndre';

describe('ButtonEndre', () => {
  it('renders a title text', () => {
    render(<ButtonEndre />);

    const buttonTitle = screen.getByRole('button', {
      name: /Endre/i
    });
    expect(buttonTitle).toBeInTheDocument();
  });
});
