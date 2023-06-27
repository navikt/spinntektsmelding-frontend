import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { vi, expect } from 'vitest';
import Kvittering from '../../pages/kvittering/[kvittid]';

import env from '../../config/environment';
import useBoundStore from 'state/useBoundStore';
import { Periode } from 'state/state';

vi.mock('next/router', () => require('next-router-mock'));
vi.spyOn(env, 'minSideArbeidsgiver', 'get').mockReturnValue('https://mocked.nav.no');

const initialState = useBoundStore.getState();

describe('kvittering', () => {
  beforeEach(() => {
    const spy = vi.spyOn(window, 'print');

    spy.mockImplementation(vi.fn());

    useBoundStore.setState(initialState, true);
  });

  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });

  it('renders a title text', () => {
    const spy = vi.spyOn(window, 'print');

    render(<Kvittering />);

    const buttonTitle = screen.getByRole('button', {
      name: /Skriv ut/i
    });

    buttonTitle.click();

    expect(spy).toHaveBeenCalled();

    expect(buttonTitle).toBeInTheDocument();
  });

  it('renders full arbeidsgiverperiode text', () => {
    const spy = vi.spyOn(window, 'print');
    const { result } = renderHook(() => useBoundStore((state) => state));

    const datoSpenn: Periode[] = [
      {
        fom: new Date(2022, 4, 14),
        tom: new Date(2022, 5, 15),
        id: '1'
      }
    ];

    act(() => {
      result.current.setArbeidsgiverperioder(datoSpenn);
    });

    render(<Kvittering />);

    const textBlock = screen.getByRole('p', {
      name: /Arbeidsgiver er ansvarlig å betale ut/i
    });

    expect(textBlock).toBeInTheDocument();
  });

  it('should have no violations', async () => {
    const { container } = render(<Kvittering />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
