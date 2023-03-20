import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { vi, expect } from 'vitest';
import Kvittering from '../../pages/kvittering/[kvittid]';

vi.mock('next/router', () => require('next-router-mock'));

describe('kvittering', () => {
  it('renders a title text', () => {
    const spy = vi.spyOn(window, 'print');

    render(<Kvittering />);

    const buttonTitle = screen.getByRole('button', {
      name: /Skriv ut/i
    });

    buttonTitle.click();

    expect(spy).toHaveBeenCalled();

    expect(buttonTitle).toBeInTheDocument();
  });

  it('should have no violations', async () => {
    const { container } = render(<Kvittering />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
