import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import Egenmelding from '../../components/Egenmelding';
import { vi } from 'vitest';
import useBoundStore from '../../state/useBoundStore';

const initialState = useBoundStore.getState();

describe('Egenmelding', () => {
  beforeEach(() => {
    useBoundStore.setState(initialState, true);
  });

  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
  });

  it('should have no violations', async () => {
    const { container } = render(<Egenmelding />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should show perioder when egenmeldingsperioder exist', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    act(() => {
      result.current.initEgenmeldingsperiode([
        { fom: '2022-06-06', tom: '2022-07-06' },
        { fom: '2022-08-06', tom: '2022-09-06' },
        { fom: '2022-10-06', tom: '2022-11-06' }
      ]);
    });

    const { container } = render(<Egenmelding />);

    expect(screen.getByText('Egenmelding')).toBeInTheDocument();
    expect(screen.getByText('06.06.2022')).toBeInTheDocument();
    expect(screen.getByText('06.07.2022')).toBeInTheDocument();
    expect(screen.getByText('06.08.2022')).toBeInTheDocument();
    expect(screen.getByText('06.09.2022')).toBeInTheDocument();
    expect(screen.getByText('06.10.2022')).toBeInTheDocument();
    expect(screen.getByText('06.11.2022')).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should show message when there are no egenmeldingsperioder', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    act(() => {
      result.current.initEgenmeldingsperiode(undefined);
    });

    const { container } = render(<Egenmelding />);

    expect(
      screen.getByText('Den sykmeldte har ikke registrert egenmeldingsperioder for denne sykepengesøknaden.')
    ).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should show message when egenmeldingsperioder is an empty array', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    act(() => {
      result.current.initEgenmeldingsperiode([]);
    });

    const { container } = render(<Egenmelding />);

    expect(
      screen.getByText('Den sykmeldte har ikke registrert egenmeldingsperioder for denne sykepengesøknaden.')
    ).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should show loader when lasterData is true', async () => {
    const { container } = render(<Egenmelding lasterData={true} />);

    expect(screen.getByText('Egenmelding')).toBeInTheDocument();
    // EgenmeldingLoader should be rendered, not the perioder or empty message
    expect(
      screen.queryByText('Den sykmeldte har ikke registrert egenmeldingsperioder for denne sykepengesøknaden.')
    ).not.toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should display Fra and Til labels for each periode', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    act(() => {
      result.current.initEgenmeldingsperiode([{ fom: '2023-01-01', tom: '2023-01-15' }]);
    });

    render(<Egenmelding />);

    expect(screen.getByText('Fra')).toBeInTheDocument();
    expect(screen.getByText('Til')).toBeInTheDocument();
    expect(screen.getByText('01.01.2023')).toBeInTheDocument();
    expect(screen.getByText('15.01.2023')).toBeInTheDocument();
  });

  it('should show multiple Fra/Til labels for multiple perioder', async () => {
    const { result } = renderHook(() => useBoundStore((state) => state));
    act(() => {
      result.current.initEgenmeldingsperiode([
        { fom: '2023-01-01', tom: '2023-01-15' },
        { fom: '2023-02-01', tom: '2023-02-15' }
      ]);
    });

    render(<Egenmelding />);

    const fraLabels = screen.getAllByText('Fra');
    const tilLabels = screen.getAllByText('Til');

    expect(fraLabels).toHaveLength(2);
    expect(tilLabels).toHaveLength(2);
  });
});
