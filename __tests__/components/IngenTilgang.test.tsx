import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import IngenTilgang from '../../components/IngenTilgang';
import { vi } from 'vitest';

describe('IngenTilgang', () => {
  it('should have no violations and show some text', async () => {
    const handleCloseModal = vi.fn();
    const { container } = render(<IngenTilgang handleCloseModal={handleCloseModal} open={true} />);

    const HeadingTitle = screen.getByText(/Åpne ID-Porten/i);

    expect(HeadingTitle).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
