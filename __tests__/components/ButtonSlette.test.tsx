import { render, screen } from '@testing-library/react';
import ButtonSlette from '../../components/ButtonSlette/ButtonSlette';
import '@testing-library/jest-dom';

jest.mock('uuid', () => {
  const base = '9134e286-6f71-427a-bf00-';
  let current = 100000000000;

  return {
    v4: () => {
      const uuid = base + current.toString();
      current++;

      return uuid;
    }
  };
});

describe('ButtonSlette', () => {
  it('renders a title text', () => {
    render(<ButtonSlette title='Slette' />);

    const buttonTitle = screen.getByRole('button', {
      name: /Slette/i
    });

    expect(buttonTitle).toBeInTheDocument();
  });
});
