import { render, screen, fireEvent } from '@testing-library/react';
import SelectNaturalytelser from '../../components/Naturalytelser/SelectNaturalytelser/SelectNaturalytelser';
import { vi } from 'vitest';

describe('SelectNaturalytelser', () => {
  const onChangeYtelseMock = vi.fn();

  beforeEach(() => {
    onChangeYtelseMock.mockClear();
  });

  it('renders the select component', () => {
    render(<SelectNaturalytelser onChangeYtelse={onChangeYtelseMock} elementId='test' />);
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
  });

  it('calls onChangeYtelse when a value is selected', () => {
    render(<SelectNaturalytelser onChangeYtelse={onChangeYtelseMock} elementId='test' />);
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'value1' } });
    expect(onChangeYtelseMock).toHaveBeenCalledTimes(1);
    expect(onChangeYtelseMock).toHaveBeenCalledWith(expect.any(Object), 'test');
  });

  it('renders the default value if provided', () => {
    render(<SelectNaturalytelser onChangeYtelse={onChangeYtelseMock} elementId='test' defaultValue='bil' />);
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveValue('BIL');
  });

  it('renders the error message if provided', () => {
    const errorMessage = 'This is an error';
    render(<SelectNaturalytelser onChangeYtelse={onChangeYtelseMock} elementId='test' error={errorMessage} />);
    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
  });
});
