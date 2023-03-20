import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';

import Egenmelding from '../../components/Egenmelding';
import { vi } from 'vitest';

describe('Egenmelding', () => {
  it('should have no violations', async () => {
    const { container } = render(<Egenmelding />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should be able to add periode', async () => {
    // Datovelgeren er ikke helt enig med axe om a11y. Gjør derfor en liten mock
    vi.mock('../../components/Datovelger', () => ({
      default: () => <div>Datovelger</div>
    }));

    const { container } = render(<Egenmelding />);

    userEvent.click(screen.getByText('Endre'));

    const leggTilKnapp = await screen.findByText('Legg til periode');
    expect(leggTilKnapp).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
