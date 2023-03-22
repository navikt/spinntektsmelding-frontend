import { render, screen } from '@testing-library/react';
import Heading2 from '../../components/Heading2/Heading2';

describe('Heading2', () => {
  it('renders a title text', () => {
    render(<Heading2>Innholdstekst</Heading2>);

    const HeadingTitle = screen.getByRole('heading', {
      level: 2,
      name: /Innholdstekst/i
    });

    expect(HeadingTitle).toBeInTheDocument();
  });

  it('still renders a title text', () => {
    render(<Heading2 className='Test'>Innholdstekst</Heading2>);

    const HeadingTitle = screen.getByRole('heading', {
      level: 2,
      name: /Innholdstekst/i
    });

    expect(HeadingTitle).toHaveClass('Test');
    expect(HeadingTitle).toBeInTheDocument();
  });
});
