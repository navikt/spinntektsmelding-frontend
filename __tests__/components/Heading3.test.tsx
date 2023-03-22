import { render, screen } from '@testing-library/react';
import Heading3 from '../../components/Heading3/Heading3';

describe('Heading3', () => {
  it('renders a title text', () => {
    render(<Heading3>Innholdstekst</Heading3>);

    const HeadingTitle = screen.getByRole('heading', {
      level: 3,
      name: /Innholdstekst/i
    });

    expect(HeadingTitle).toBeInTheDocument();
  });

  it('still renders a title text', () => {
    render(<Heading3 className='Test'>Innholdstekst</Heading3>);

    const HeadingTitle = screen.getByRole('heading', {
      level: 3,
      name: /Innholdstekst/i
    });

    expect(HeadingTitle).toBeInTheDocument();
    expect(HeadingTitle).toHaveClass('Test');
  });
});
