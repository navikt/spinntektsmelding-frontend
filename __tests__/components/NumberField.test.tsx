import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import NumberField from '../../components/NumberField/NumberField';

describe('NumberField', () => {
  it('renders with a label', () => {
    render(<NumberField label='Beløp' />);

    const input = screen.getByLabelText(/Beløp/i);
    expect(input).toBeInTheDocument();
  });

  it('should have inputMode decimal', () => {
    render(<NumberField label='Beløp' />);

    const input = screen.getByLabelText(/Beløp/i);
    expect(input).toHaveAttribute('inputMode', 'decimal');
  });

  it('converts dot to comma in displayed value (norsk tallformat)', () => {
    render(<NumberField label='Beløp' value='1234.56' />);

    const input = screen.getByLabelText(/Beløp/i);
    expect(input).toHaveValue('1234,56');
  });

  it('displays value with comma as-is', () => {
    render(<NumberField label='Beløp' value='1234,56' />);

    const input = screen.getByLabelText(/Beløp/i);
    expect(input).toHaveValue('1234,56');
  });

  it('displays value with just one comma', () => {
    render(<NumberField label='Beløp' value='12,34,56' />);

    const input = screen.getByLabelText(/Beløp/i);
    expect(input).toHaveValue('12,3456');
  });

  it('allows only numbers and comma in input', async () => {
    const handleChange = vi.fn();
    render(<NumberField label='Beløp' onChange={handleChange} />);

    const input = screen.getByLabelText(/Beløp/i);

    fireEvent.change(input, { target: { value: '123abc,45def' } });

    expect(input).toHaveValue('123,45');
    expect(handleChange).toHaveBeenCalled();
  });

  it('removes letters and special characters from input', async () => {
    const handleChange = vi.fn();
    render(<NumberField label='Beløp' onChange={handleChange} />);

    const input = screen.getByLabelText(/Beløp/i);

    fireEvent.change(input, { target: { value: 'abc!@#123' } });

    expect(input).toHaveValue('123');
  });

  it('allows pure numeric input', async () => {
    const handleChange = vi.fn();
    render(<NumberField label='Beløp' onChange={handleChange} />);

    const input = screen.getByLabelText(/Beløp/i);

    fireEvent.change(input, { target: { value: '12345' } });

    expect(input).toHaveValue('12345');
    expect(handleChange).toHaveBeenCalled();
  });

  it('handles undefined value (uncontrolled)', () => {
    render(<NumberField label='Beløp' value={undefined} />);

    const input = screen.getByLabelText(/Beløp/i);
    expect(input).toBeInTheDocument();
  });

  it('handles null value', () => {
    render(<NumberField label='Beløp' value={null as unknown as string} />);

    const input = screen.getByLabelText(/Beløp/i);
    expect(input).toBeInTheDocument();
  });

  it('handles empty string value', () => {
    render(<NumberField label='Beløp' value='' />);

    const input = screen.getByLabelText(/Beløp/i);
    expect(input).toHaveValue('');
  });

  it('handles numeric value', () => {
    render(<NumberField label='Beløp' value={1234.56 as unknown as string} />);

    const input = screen.getByLabelText(/Beløp/i);
    expect(input).toHaveValue('1234,56');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<NumberField label='Beløp' />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('passes additional props to TextField', () => {
    render(<NumberField label='Beløp' id='test-id' data-testid='number-field' />);

    const input = screen.getByTestId('number-field');
    expect(input).toHaveAttribute('id', 'test-id');
  });
});
