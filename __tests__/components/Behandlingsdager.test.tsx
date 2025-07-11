import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Behandlingsdager } from '../../components/Behandlingsdager/Behandlingsdager';

// Mock utilities before importing the component
vi.mock('../../utils/parseIsoDate', () => ({
  default: (iso: string) => `parsed-${iso}`
}));
vi.mock('../../utils/formatDate', () => ({
  default: (parsed: string) => `formatted-${parsed}`
}));

describe('Behandlingsdager', () => {
  it('renders nothing when behandlingsdager is undefined', () => {
    const { container } = render(<Behandlingsdager />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when behandlingsdager is an empty array', () => {
    const { container } = render(<Behandlingsdager behandlingsdager={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a heading and sorted, formatted dates', () => {
    const dates = ['2023-02-01', '2022-01-01', '2023-01-01'];
    render(<Behandlingsdager behandlingsdager={dates} />);

    // Heading
    expect(screen.getByText('Behandlingsdager')).toBeInTheDocument();

    // Formatted dates
    const items = screen.getAllByText(/^formatted-parsed-/);
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toBe('formatted-parsed-2022-01-01');
    expect(items[1].textContent).toBe('formatted-parsed-2023-01-01');
    expect(items[2].textContent).toBe('formatted-parsed-2023-02-01');
  });
});
