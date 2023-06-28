import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import HentingAvDataFeilet from '../../components/HentingAvDataFeilet/HentingAvDataFeilet';
import { vi } from 'vitest';

describe('HentingAvDataFeilet', () => {
  it('renders a title text', async () => {
    const closeHandler = vi.fn();

    const { container } = render(
      <div id='body'>
        <HentingAvDataFeilet handleCloseModal={closeHandler} open={true} />
      </div>
    );

    const HeadingTitle = screen.getByRole('heading', {
      level: 2,
      name: /Henting av data til inntektsmeldingen feilet./i
    });

    expect(HeadingTitle).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('still renders a title text', () => {
    const closeHandler = vi.fn();

    render(
      <div id='body'>
        <HentingAvDataFeilet handleCloseModal={closeHandler} open={true} />
      </div>
    );

    const button = screen.getByRole('button', {
      name: /Lukk/i
    });

    button.click();

    expect(closeHandler).toHaveBeenCalled();
  });
});
