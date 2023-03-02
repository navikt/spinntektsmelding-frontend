import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import BannerUtenVelger from '../../components/BannerUtenVelger/BannerUtenVelger';

describe('TidligereInntekt', () => {
  it('should have no violations and show some text', async () => {
    const { container } = render(<BannerUtenVelger tittelMedUnderTittel='Tittelfelt'></BannerUtenVelger>);

    const HeadingTitle = screen.getByText(/Tittelfelt/i);

    expect(HeadingTitle).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
