import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import Feilmelding from '../../components/Feilmelding';

describe('TidligereInntekt', () => {
  it('should have no violations and show some text', async () => {
    const { container } = render(<Feilmelding id='Feil'>Feilmeldingstekst</Feilmelding>);

    const HeadingTitle = screen.getByText(/Feilmeldingstekst/i);

    expect(HeadingTitle).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
