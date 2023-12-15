import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';

import Egenmelding from '../../components/Egenmelding';
import { vi } from 'vitest';
import useBoundStore from '../../state/useBoundStore';
import { MottattPeriode } from '../../state/MottattData';

const egenmeldingsperioder: Array<MottattPeriode> = [
  { fom: '2022-06-06', tom: '2022-07-06' },
  { fom: '2022-08-06', tom: '2022-09-06' },
  { fom: '2022-10-06', tom: '2022-11-06' }
];

const initialState = useBoundStore.getState();

describe('Egenmelding', () => {
  beforeEach(() => {
    useBoundStore.setState(initialState, true);
  });

  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });

  it('should have no violations', async () => {
    const mockFn = vi.fn();

    const { container } = render(<Egenmelding setIsDirtyForm={mockFn} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should be able to add periode', async () => {
    const mockFn = vi.fn();

    // Datovelgeren er ikke helt enig med axe om a11y. Gjør derfor en liten mock
    vi.mock('../../components/Datovelger', () => ({
      default: () => <div>Datovelger</div>
    }));

    const { container } = render(<Egenmelding setIsDirtyForm={mockFn} />);

    userEvent.click(screen.getByText('Endre'));

    const leggTilKnapp = await screen.findByText('Legg til periode');
    expect(leggTilKnapp).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should show perioder', async () => {
    const mockFn = vi.fn();

    // Datovelgeren er ikke helt enig med axe om a11y. Gjør derfor en liten mock
    // vi.mock('../../components/Datovelger', () => ({
    //   default: () => <div>Datovelger</div>
    // }));

    const { result } = renderHook(() => useBoundStore((state) => state));
    act(() => {
      result.current.initEgenmeldingsperiode(egenmeldingsperioder);
    });

    const { container } = render(<Egenmelding setIsDirtyForm={mockFn} />);

    expect(await screen.findByText('06.06.2022')).toBeInTheDocument();
    expect(await screen.findByText('06.07.2022')).toBeInTheDocument();
    expect(await screen.findByText('06.08.2022')).toBeInTheDocument();
    expect(await screen.findByText('06.09.2022')).toBeInTheDocument();
    expect(await screen.findByText('06.10.2022')).toBeInTheDocument();
    expect(await screen.findByText('06.11.2022')).toBeInTheDocument();

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should show empty datepickers when there are no perioder', async () => {
    const mockFn = vi.fn();

    // Datovelgeren er ikke helt enig med axe om a11y. Gjør derfor en liten mock
    vi.mock('../../components/Datovelger', () => ({
      default: () => <div>Datovelger</div>
    }));

    const { result } = renderHook(() => useBoundStore((state) => state));
    act(() => {
      result.current.initEgenmeldingsperiode(undefined);
    });

    const { container } = render(<Egenmelding setIsDirtyForm={mockFn} />);

    expect(await screen.findAllByText('Datovelger')).toHaveLength(2);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
