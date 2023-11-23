import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { vi, expect } from 'vitest';
import Sporreundersokelse from '../../components/Sporreundersokelse';

describe('Sporreundersokelse', () => {
  it('should have no violations', async () => {
    const { container } = render(<Sporreundersokelse />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
