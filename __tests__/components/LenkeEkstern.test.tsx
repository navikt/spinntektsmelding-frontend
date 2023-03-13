import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import LenkeEksternt from '../../components/LenkeEksternt';

describe('LenkeEksternt', () => {
  it('should have no violations', async () => {
    const { container } = render(<LenkeEksternt />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should have no violations when hidden', async () => {
    const { container } = render(<LenkeEksternt isHidden />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
