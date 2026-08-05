import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'jest-axe';
import { FormProvider, useForm } from 'react-hook-form';
import { Behandlingsdager } from '../../components/Behandlingsdager/Behandlingsdager';
import parseIsoDate from '../../utils/parseIsoDate';

function TestWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  const methods = useForm({
    defaultValues: {
      agp: {
        perioder: []
      }
    }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('Behandlingsdager', () => {
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
