import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import HentingAvDataFeilet from '../../components/HentingAvDataFeilet/HentingAvDataFeilet';
import { describe, it, expect, vi } from 'vitest';

describe('HentingAvDataFeilet', () => {
  it('renders with default title when open is true', async () => {
    const closeHandler = vi.fn();

    const { container } = render(
      <div id='body'>
        <HentingAvDataFeilet handleCloseModal={closeHandler} open={true} />
      </div>
    );

    const HeadingTitle = screen.getByRole('heading', {
      level: 1,
      name: /Henting av data til inntektsmeldingen feilet./i
    });

    expect(HeadingTitle).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('calls handleCloseModal when close button is clicked', async () => {
    const user = userEvent.setup();
    const closeHandler = vi.fn();

    render(
      <div id='body'>
        <HentingAvDataFeilet handleCloseModal={closeHandler} open={true} />
      </div>
    );

    const buttons = screen.getAllByRole('button', {
      name: 'Lukk'
    });

    await user.click(buttons[1]);

    expect(closeHandler).toHaveBeenCalledTimes(1);
  });

  it('does not render dialog when open is false', () => {
    const closeHandler = vi.fn();

    render(
      <div id='body'>
        <HentingAvDataFeilet handleCloseModal={closeHandler} open={false} />
      </div>
    );

    const HeadingTitle = screen.queryByRole('heading', {
      level: 1,
      name: /Henting av data til inntektsmeldingen feilet./i
    });

    expect(HeadingTitle).not.toBeInTheDocument();
  });

  it('renders custom title when provided', () => {
    const closeHandler = vi.fn();
    const customTitle = 'En tilpasset feiltittel';

    render(
      <div id='body'>
        <HentingAvDataFeilet handleCloseModal={closeHandler} open={true} title={customTitle} />
      </div>
    );

    const HeadingTitle = screen.getByRole('heading', {
      level: 1,
      name: customTitle
    });

    expect(HeadingTitle).toBeInTheDocument();
  });

  it('uses custom ariaLabel when provided', () => {
    const closeHandler = vi.fn();
    const customAriaLabel = 'Tilpasset aria-label';

    render(
      <div id='body'>
        <HentingAvDataFeilet handleCloseModal={closeHandler} open={true} ariaLabel={customAriaLabel} />
      </div>
    );

    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveAttribute('aria-label', customAriaLabel);
  });

  it('uses default title as ariaLabel when ariaLabel is not provided', () => {
    const closeHandler = vi.fn();

    render(
      <div id='body'>
        <HentingAvDataFeilet handleCloseModal={closeHandler} open={true} />
      </div>
    );

    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveAttribute('aria-label', 'Henting av data til inntektsmeldingen feilet.');
  });

  it('renders error alert with correct message content', () => {
    const closeHandler = vi.fn();

    render(
      <div id='body'>
        <HentingAvDataFeilet handleCloseModal={closeHandler} open={true} />
      </div>
    );

    expect(screen.getByText('Noe gikk galt under henting av data.')).toBeInTheDocument();
    expect(screen.getByText('Vennligst prøv igjen ved en senere anledning.')).toBeInTheDocument();
  });

  it('renders icon with correct title', () => {
    const closeHandler = vi.fn();

    render(
      <div id='body'>
        <HentingAvDataFeilet handleCloseModal={closeHandler} open={true} />
      </div>
    );

    const icon = screen.getByTitle('Advarsel');

    expect(icon).toBeInTheDocument();
  });

  it('has accessible close button', async () => {
    const closeHandler = vi.fn();

    const { container } = render(
      <div id='body'>
        <HentingAvDataFeilet handleCloseModal={closeHandler} open={true} />
      </div>
    );

    const buttons = screen.getAllByRole('button', { name: 'Lukk' });

    expect(buttons[1]).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
