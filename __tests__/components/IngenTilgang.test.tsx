import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';

import IngenTilgang from '../../components/IngenTilgang';
import { vi } from 'vitest';

describe('IngenTilgang', () => {
  beforeEach(() => {
    document.body.id = 'body';
  });

  it('should have no violations and show some text', async () => {
    const handleCloseModal = vi.fn();
    const { container } = render(
      <div id='body'>
        <IngenTilgang handleCloseModal={handleCloseModal} open={true} />
      </div>
    );

    const HeadingTitle = screen.getByText(/Åpne ID-Porten/i);

    expect(HeadingTitle).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('renders the dialog title', () => {
    render(<IngenTilgang handleCloseModal={vi.fn()} open={true} />);
    expect(
      screen.getByRole('heading', { name: /Du er blitt logget ut, følg instruksjonene for ikke å miste data/i })
    ).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(<IngenTilgang handleCloseModal={vi.fn()} open={false} />);
    expect(screen.queryByText(/Du er blitt logget ut/i)).not.toBeInTheDocument();
  });

  it('calls handleCloseModal when dialog is closed via onOpenChange', () => {
    const handleCloseModal = vi.fn();
    render(<IngenTilgang handleCloseModal={handleCloseModal} open={true} />);

    const closeButton = screen.getByRole('button', { name: /lukk/i });
    fireEvent.click(closeButton);

    expect(handleCloseModal).toHaveBeenCalledTimes(1);
  });

  it('renders all instruction steps', () => {
    render(<IngenTilgang handleCloseModal={vi.fn()} open={true} />);
    expect(screen.getByText('Ikke lukk dette vinduet')).toBeInTheDocument();
    expect(screen.getByText('Logg inn på nytt i ID-porten.')).toBeInTheDocument();
    expect(screen.getByText('Returner til dette vinduet.')).toBeInTheDocument();
  });

  it('renders the ID-Porten link with correct attributes', () => {
    render(<IngenTilgang handleCloseModal={vi.fn()} open={true} />);
    const link = screen.getByText(/ID-Porten \(innlogging\)/i).closest('a');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
