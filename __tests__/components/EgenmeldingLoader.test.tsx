import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import EgenmeldingLoader from '../../components/Egenmelding/EgenmeldingLoader';
import { vi } from 'vitest';

describe('EgenmeldingLoader', () => {
  it('should have no violations', async () => {
    const { container } = render(<EgenmeldingLoader />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should show perioder', async () => {
    vi.mock('@navikt/ds-react', () => ({
      Skeleton: () => <div>Skeleton</div>
    }));

    const { container } = render(<EgenmeldingLoader />);

    expect(await screen.findAllByText('Skeleton')).toHaveLength(2);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
