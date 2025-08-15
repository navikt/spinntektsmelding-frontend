// Mock next/navigation
const router = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn()
};

vi.mock('next/navigation', () => {
  const push = vi.fn();
  const replace = vi.fn();
  const prefetch = vi.fn();
  const router = { push, replace, prefetch };
  return {
    useRouter: () => router,
    __mockedRouter: router
  };
});

import React from 'react';
import { describe, it, beforeEach, vi, expect, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InitieringBehandlingsdager from '../../../pages/initieringBehandlingsdager/index';
import useArbeidsforhold from '../../../utils/useArbeidsforhold';
import useBehandlingsdager from '../../../utils/useBehandlingsdager';
import { __mockedRouter as mockedRouter } from 'next/navigation';
import useBoundStore from '../../../state/useBoundStore';
import testFnr from '../../../mockdata/testFnr';

// Mock store and hooks
vi.mock('../../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn(),
  useBoundStore: vi.fn()
}));
vi.mock('../../../utils/useArbeidsforhold');
vi.mock('../../../utils/useBehandlingsdager');

describe('InitieringBehandlingsdager', () => {
  const setError = vi.fn();
  const initPerson = vi.fn();
  const setSkjemaStatus = vi.fn();
  const initFravaersperiode = vi.fn();
  const setBehandlingsdager = vi.fn();
  const tilbakestillArbeidsgiverperiode = vi.fn();
  const setForeslaattBestemmendeFravaersdag = vi.fn();
  const initArbeidsgiverperioder = vi.fn();
  const setSelvbestemtType = vi.fn();
  beforeEach(() => {
    // reset mocks
    vi.clearAllMocks();

    mockedRouter.push.mockClear();

    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn({
        __esModule: true,
        default: vi.fn(),
        sykmeldt: { fnr: testFnr.GyldigeFraDolly.TestPerson1 },
        initPerson: initPerson,
        setSkjemaStatus: setSkjemaStatus,
        initFravaersperiode: initFravaersperiode,
        setBehandlingsdager: setBehandlingsdager,
        tilbakestillArbeidsgiverperiode: tilbakestillArbeidsgiverperiode,
        setForeslaattBestemmendeFravaersdag: setForeslaattBestemmendeFravaersdag,
        initArbeidsgiverperioder: initArbeidsgiverperioder,
        setIdentitetsnummer: vi.fn(),
        setAarsakSelvbestemtInnsending: vi.fn(),
        setSelvbestemtType: setSelvbestemtType
      })
    );

    // arbeidsforhold hook: one underenhet
    (useArbeidsforhold as Mock).mockReturnValue({
      data: {
        fulltNavn: 'Test Enhet',
        underenheter: [{ orgnrUnderenhet: '810007842', virksomhetsnavn: 'Test Enhet' }],
        perioder: [{ id: 'a', fom: '2023-01-01', tom: '2023-01-05' }]
      },
      error: undefined
    });

    // behandlingsdager hook: two periods, second has > 12 days
    (useBehandlingsdager as Mock).mockReturnValue({
      data: [
        {
          sykepengesoknadUuid: '123e4567-e89b-12d3-a456-426614174000',
          sykmeldingId: '123e4567-e89b-12d3-a456-426614174000',
          fom: '2023-01-01',
          tom: '2023-01-05',
          behandlingsdager: ['2023-01-01', '2023-01-02'],
          egenmeldingsdagerFraSykmelding: [],
          status: 'NY',
          startSykeforlop: '2023-01-01',
          vedtaksperiodeId: null
        },
        {
          sykepengesoknadUuid: '123e4567-e89b-12d3-a456-426614174001',
          sykmeldingId: '123e4567-e89b-12d3-a456-426614174001',
          fom: '2023-02-01',
          tom: '2023-02-15',
          behandlingsdager: Array(14).fill('2023-02-01'),
          egenmeldingsdagerFraSykmelding: [],
          status: 'NY',
          startSykeforlop: '2023-02-01',
          vedtaksperiodeId: null
        }
      ],
      error: undefined,
      isLoading: false
    });
  });

  it('renders loading state then form controls', async () => {
    (useArbeidsforhold as Mock).mockReturnValue({
      data: {
        fulltNavn: 'Test Enhet',
        underenheter: [
          { orgnrUnderenhet: '810007842', virksomhetsnavn: 'Test Enhet' },
          { orgnrUnderenhet: '810007843', virksomhetsnavn: 'Test Enhet 2' }
        ],
        perioder: [{ id: 'a', fom: '2023-01-01', tom: '2023-01-05' }]
      },
      error: undefined
    });

    render(<InitieringBehandlingsdager />);
    // initial heading
    expect(screen.getByText(/Opprett inntektsmelding for et sykefravær/)).toBeInTheDocument();
    // wait for select to appear
    await waitFor(() =>
      expect(screen.getByLabelText(/Hvilken underenhet er personen sykmeldt fra/)).toBeInTheDocument()
    );
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<InitieringBehandlingsdager />);
    // wait for Next button
    await waitFor(() => screen.getByRole('button', { name: 'Neste' }));
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));
    // expect radio-group error
    const tekster = await screen.findAllByText(/Du må velge en periode for behandlingsdager/);
    expect(tekster.length).toBeGreaterThan(1);
  });

  it('navigates to /behandlingsdager after valid selections', async () => {
    render(<InitieringBehandlingsdager />);

    await waitFor(() => screen.getByRole('radio', { name: /01\.01\.2023 - 05\.01\.2023/ }));
    // pick the period with >12 behandlingsdager (second period)
    fireEvent.click(screen.getByRole('radio', { name: /01\.02\.2023 - 15\.02\.2023/ }));
    // click Next
    await waitFor(() => screen.getByRole('button', { name: 'Neste' }));
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));
    await waitFor(() => {
      expect(mockedRouter.push).toHaveBeenCalledWith('/behandlingsdager');
    });

    expect(setSelvbestemtType).toHaveBeenCalledWith('Behandlingsdager');
  });
});
