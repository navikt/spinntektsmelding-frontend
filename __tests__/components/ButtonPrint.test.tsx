import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { vi, expect } from 'vitest';
import ButtonPrint from '../../components/ButtonPrint';

describe('ButtonPrint', () => {
  it('renders a title text', () => {
    const spy = vi.spyOn(window, 'print');

    spy.mockImplementation(vi.fn());

    render(<ButtonPrint />);

    const buttonTitle = screen.getByRole('button', {
      name: /Skriv ut/i
    });

    buttonTitle.click();

    expect(spy).toHaveBeenCalled();

    expect(buttonTitle).toBeInTheDocument();
  });

  it('should have no violations', async () => {
    const { container } = render(<ButtonPrint />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
