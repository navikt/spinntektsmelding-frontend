import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import LesMer from '../../components/LesMer';

describe('LesMer', () => {
  it('renders a title text', async () => {
    const { container } = render(<LesMer header='Overskrift'>Innholdstekst</LesMer>);

    const HeadingTitle = screen.getByRole('button', {
      name: /Overskrift/i
    });

    expect(HeadingTitle).toBeInTheDocument();

    const bodyText = screen.getByText(/Innholdstekst/i);

    expect(bodyText).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
