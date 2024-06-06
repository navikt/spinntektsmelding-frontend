import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import AlertBetvilerArbeidsevne from '../../components/AlertBetvilerArbeidsevne/AlertBetvilerArbeidsevne';

describe('TidligereInntekt', () => {
  it('should have no violations and show some text', async () => {
    const { container } = render(<AlertBetvilerArbeidsevne></AlertBetvilerArbeidsevne>);

    const HeadingTitle = screen.getByText(/Innen 14 dager må dere sende/i);

    expect(HeadingTitle).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
