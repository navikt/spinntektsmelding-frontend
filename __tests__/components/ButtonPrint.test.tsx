import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ButtonPrint from '../../components/ButtonPrint';

describe('ButtonPrint', () => {
  it('renders a title text', () => {
    const spy = vi.spyOn(window, 'print');

    render(<ButtonPrint />);

    const buttonTitle = screen.getByRole('button', {
      name: /Skriv ut/i
    });

    buttonTitle.click();

    expect(spy).toHaveBeenCalled();

    expect(buttonTitle).toBeInTheDocument();
  });
});
