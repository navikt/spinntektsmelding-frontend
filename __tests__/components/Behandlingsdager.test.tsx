import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { axe } from 'jest-axe';
import { FormProvider, useForm } from 'react-hook-form';
import { Behandlingsdager } from '../../components/Behandlingsdager/Behandlingsdager';
import parseIsoDate from '../../utils/parseIsoDate';
import useBoundStore from '../../state/useBoundStore';

vi.mock('../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn(),
  useBoundStore: vi.fn()
}));

const mockSetArbeidsgiverperioder = vi.fn();

function TestWrapper({
  children,
  defaultPerioder = []
}: Readonly<{
  children: React.ReactNode;
  defaultPerioder?: { fom: string; tom: string }[];
}>) {
  const methods = useForm({
    defaultValues: {
      agp: {
        perioder: defaultPerioder
      }
    }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('Behandlingsdager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useBoundStore as Mock).mockImplementation((selector) =>
      selector({ setArbeidsgiverperioder: mockSetArbeidsgiverperioder })
    );
  });

  it('renders nothing when behandlingsdager is undefined', () => {
    const { container } = render(
      <TestWrapper>
        <Behandlingsdager />
      </TestWrapper>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when behandlingsdager is an empty array', () => {
    const { container } = render(
      <TestWrapper>
        <Behandlingsdager behandlingsdager={[]} />
      </TestWrapper>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a heading and formatted dates', () => {
    const dates = ['2023-02-01', '2023-01-15', '2023-01-01'];
    render(
      <TestWrapper>
        <Behandlingsdager behandlingsdager={dates} />
      </TestWrapper>
    );

    // Heading
    expect(screen.getByText('Behandlingsdager med arbeidsgiverperiode')).toBeInTheDocument();

    // Formatted dates
    const items = screen.getAllByText(/^\d{2}[./-]\d{2}[./-]2023\b/);
    expect(items).toHaveLength(3);
    expect(items[0].textContent.trim()).toBe('01.02.2023');
    expect(items[1].textContent.trim()).toBe('15.01.2023');
    expect(items[2].textContent.trim()).toBe('01.01.2023');
  });

  it('renders a heading and formatted dates and arbeidsgiverperioder', () => {
    const dates = ['2023-02-01', '2023-01-15', '2023-01-01', '2023-02-15', '2023-02-07'];
    const agp = [
      { fom: parseIsoDate('2023-02-01') },
      { fom: parseIsoDate('2023-01-01') },
      { fom: parseIsoDate('2023-01-15') },
      { fom: parseIsoDate('2023-02-07') }
    ];
    render(
      <TestWrapper>
        <Behandlingsdager behandlingsdager={dates} arbeidsgiverperioder={agp} />
      </TestWrapper>
    );

    // Heading
    expect(screen.getByText('Behandlingsdager med arbeidsgiverperiode')).toBeInTheDocument();

    const items = screen.getAllByText(/^\d{2}\.\d{2}\.\d{4}$/);
    expect(items).toHaveLength(5);

    expect(items[0].textContent.trim()).toBe('01.02.2023');
    expect(items[1].textContent.trim()).toBe('15.01.2023');
    expect(items[2].textContent.trim()).toBe('01.01.2023');
    expect(items[3].textContent.trim()).toBe('15.02.2023');
    expect(items[4].textContent.trim()).toBe('07.02.2023');
  });

  it('shows an error message when fewer than 12 days are selected', async () => {
    const dates = ['2023-02-01', '2023-01-15', '2023-01-01'];
    render(
      <TestWrapper>
        <Behandlingsdager behandlingsdager={dates} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Du må velge 12 behandlingsdager i arbeidsgiverperioden.')).toBeInTheDocument();
    });
  });

  it('updates the store when a day is selected', async () => {
    const dates = ['2023-02-01', '2023-01-15', '2023-01-01'];
    render(
      <TestWrapper>
        <Behandlingsdager behandlingsdager={dates} />
      </TestWrapper>
    );

    await userEvent.click(screen.getByRole('checkbox', { name: '01.02.2023' }));

    await waitFor(() => {
      expect(mockSetArbeidsgiverperioder).toHaveBeenCalled();
    });

    const perioder = mockSetArbeidsgiverperioder.mock.calls.at(-1)?.[0];
    expect(perioder).toEqual([
      {
        fom: parseIsoDate('2023-02-01'),
        tom: parseIsoDate('2023-02-01'),
        id: '2023-02-01-2023-02-01'
      }
    ]);
  });

  it('reflects the selected day in the checkbox state', async () => {
    const dates = ['2023-02-01', '2023-01-15', '2023-01-01'];
    render(
      <TestWrapper>
        <Behandlingsdager behandlingsdager={dates} />
      </TestWrapper>
    );

    const checkbox = screen.getByRole('checkbox', { name: '01.02.2023' });
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  it('does not update the store when the last selected day is deselected', async () => {
    const dates = ['2023-02-01', '2023-01-15', '2023-01-01'];
    render(
      <TestWrapper>
        <Behandlingsdager behandlingsdager={dates} />
      </TestWrapper>
    );

    const checkbox = screen.getByRole('checkbox', { name: '01.02.2023' });

    await userEvent.click(checkbox);
    await waitFor(() => expect(mockSetArbeidsgiverperioder).toHaveBeenCalled());

    mockSetArbeidsgiverperioder.mockClear();

    await userEvent.click(checkbox);
    await waitFor(() => expect(checkbox).not.toBeChecked());

    expect(mockSetArbeidsgiverperioder).not.toHaveBeenCalled();
  });

  it('clears the error and pre-selects days when exactly 12 days are selected', async () => {
    const dates = Array.from({ length: 12 }, (_, i) => `2023-01-${String(i + 1).padStart(2, '0')}`);
    const defaultPerioder = dates.map((dag) => ({ fom: dag, tom: dag }));

    render(
      <TestWrapper defaultPerioder={defaultPerioder}>
        <Behandlingsdager behandlingsdager={dates} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByText('Du må velge 12 behandlingsdager i arbeidsgiverperioden.')).not.toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(12);
    expect(checkboxes.every((cb) => (cb as HTMLInputElement).checked)).toBe(true);
  });

  it('should have no accessibility violations', async () => {
    const dates = ['2023-02-01', '2023-01-15', '2023-01-01'];
    const { container } = render(
      <TestWrapper>
        <Behandlingsdager behandlingsdager={dates} />
      </TestWrapper>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
