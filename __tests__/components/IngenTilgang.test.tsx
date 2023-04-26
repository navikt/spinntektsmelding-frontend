import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import IngenTilgang from '../../components/IngenTilgang';
import { vi } from 'vitest';

describe('IngenTilgang', () => {
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
});
