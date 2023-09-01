import { render, screen } from '@testing-library/react';
import Heading4 from '../../components/Heading4/Heading4';
import { expect } from 'vitest';

describe('Heading4', () => {
  it('renders a title text', () => {
    render(<Heading4>Innholdstekst</Heading4>);

    const HeadingTitle = screen.getByRole('heading', {
      level: 4,
      name: /Innholdstekst/i
    });

    expect(HeadingTitle).toBeInTheDocument();
  });

  it.skip('still renders a title text', () => {
    render(<Heading4 className='Test'>Innholdstekst</Heading4>);

    const HeadingTitle = screen.getByRole('heading', {
      level: 4,
      name: /Innholdstekst/i
    });

    expect(HeadingTitle).toBeInTheDocument();
    expect(HeadingTitle).toHaveClass('Test');
  });
});
