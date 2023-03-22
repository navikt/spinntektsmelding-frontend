import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import Heading1 from '../../components/Heading1/Heading1';

describe('Heading1', () => {
  it('renders a title text', async () => {
    const { container } = render(<Heading1>Innholdstekst</Heading1>);

    const HeadingTitle = screen.getByRole('heading', {
      level: 1,
      name: /Innholdstekst/i
    });

    expect(HeadingTitle).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('still renders a title text', () => {
    render(<Heading1 className='Test'>Innholdstekst</Heading1>);

    const HeadingTitle = screen.getByRole('heading', {
      level: 1,
      name: /Innholdstekst/i
    });

    expect(HeadingTitle).toBeInTheDocument();
    expect(HeadingTitle).toHaveClass('Test');
  });
});
