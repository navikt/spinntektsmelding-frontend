import { screen, render } from '@testing-library/react';
import { axe } from 'jest-axe';
import Bruttoinntekt from '../../../components/Bruttoinntekt/Bruttoinntekt';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('Bruttoinntekt', () => {
  it('should have no violations', async () => {
    const mockFn = vi.fn();
    const { container } = render(<Bruttoinntekt setIsDirtyForm={mockFn} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should render the component correctly', async () => {
    vi.mock('../../utils/logEvent', vi.fn());
    const mockFn = vi.fn();
    render(<Bruttoinntekt setIsDirtyForm={mockFn} />);

    const button = screen.getByRole('button', { name: /Endre/i });

    await userEvent.click(button);

    const dropdown = screen.getByRole('combobox', { name: /Velg endringsårsak/i });

    expect(dropdown).toBeInTheDocument();

    await userEvent.selectOptions(dropdown, 'Permittering');

    // const input = screen.getByRole('textbox', { name: /Månedsinntekt/ });

    // await userEvent.type(input, '10000');
    // await userEvent.tab();

    expect(mockFn).toHaveBeenCalled();

    // Add your assertions here to test the rendering of the component
  });
});

// it('should handle user input correctly', () => {
//   const { getByLabelText } = render(<Bruttoinntekt />);

//   // Add your assertions here to test the handling of user input
// });

// Add more test cases as needed
// });
