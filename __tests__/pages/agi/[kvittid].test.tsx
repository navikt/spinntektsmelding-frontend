import { cleanup, render, screen } from '@testing-library/react';
import Kvittering from '../../../pages/kvittering/agi/[kvittid]';
import { expect, vi } from 'vitest';
import useBoundStore from '../../../state/useBoundStore';
import env from '../../../config/environment';

import kvitteringsdata from '../../../mockdata/kvittering-ferie.json';
import kvitteringsdataUtenAgp from '../../../mockdata/kvittering-uten-agp.json';
import kvitteringsdataEksterntSystem from '../../../mockdata/kvittering-eksternt-system.json';

const mockPush = vi.fn();
const mockGet = vi.fn();

vi.mock('next/navigation', () => ({
  default: {},
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet })
}));

const initialState = useBoundStore.getState();

describe('Kvittering', () => {
  beforeEach(() => {
    const spy = vi.spyOn(window, 'print');
    vi.spyOn(env, 'minSideArbeidsgiver', 'get').mockReturnValue('https://mocked.nav.no');

    spy.mockImplementation(vi.fn());

    useBoundStore.setState(initialState, true);
  });

  afterEach(() => {
    // You can chose to set the store's state to a default value here.
    vi.resetAllMocks();
    cleanup();
  });

  it('renders a title text', () => {
    render(<Kvittering kvittid='8d50ef20-37b5-4829-ad83-56219e70b375' kvittering={kvitteringsdata} />);

    const buttonTitle = screen.getByRole('button', {
      name: /Skriv ut/i
    });

    expect(buttonTitle).toBeInTheDocument();
  });

  it('renders full arbeidsgiverperiode text', () => {
    render(<Kvittering kvittid='8d50ef20-37b5-4829-ad83-56219e70b375' kvittering={kvitteringsdata} />);

    const textBlock = screen.getByText(/Arbeidsgiverperiode/);

    expect(textBlock).toBeInTheDocument();
  });

  it('renders without arbeidsgiverperiode text', () => {
    render(<Kvittering kvittid='8d50ef20-37b5-4829-ad83-56219e70b375' kvittering={kvitteringsdataUtenAgp} />);

    const textBlock = screen.queryByText(/Det er ikke arbeidsgiverperiode./);

    expect(textBlock).toBeInTheDocument();
  });

  it('renders without kvittering fra eksternt system', () => {
    render(<Kvittering kvittid='8d50ef20-37b5-4829-ad83-56219e70b375' kvittering={kvitteringsdataEksterntSystem} />);

    const textBlock = screen.getByText(/AR123456/i);

    expect(textBlock).toBeInTheDocument();
  });
});
