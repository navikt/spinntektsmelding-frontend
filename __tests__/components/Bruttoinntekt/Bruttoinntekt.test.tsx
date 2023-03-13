import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import Bruttoinntekt from '../../../components/Bruttoinntekt/Bruttoinntekt';

describe('Bruttoinntekt', () => {
  it('should have no violations', async () => {
    const { container } = render(<Bruttoinntekt />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
