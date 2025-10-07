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
import InitieringFritatt from '../../../pages/initieringFiskere/index';
import useBoundStore from '../../../state/useBoundStore';
import useMineTilganger from '../../../utils/useMineTilganger';
import { __mockedRouter as mockedRouter } from 'next/navigation';
import testFnr from '../../../mockdata/testFnr';
import testOrganisasjoner from '../../../mockdata/testOrganisasjoner';

// Mock store and hook
vi.mock('../../../state/useBoundStore', () => ({
  default: vi.fn()
}));
vi.mock('../../../utils/useMineTilganger', () => ({
  default: vi.fn()
}));

describe('InitieringFiskere page', () => {
  const initPerson = vi.fn();
  const setSkjemaStatus = vi.fn();
  const initFravaersperiode = vi.fn();
  const initEgenmeldingsperiode = vi.fn();
  const tilbakestillArbeidsgiverperiode = vi.fn();
  const setSelvbestemtType = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // router mock
    mockedRouter.push.mockClear();

    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn({
        __esModule: true,
        default: vi.fn(),
        sykmeldt: { fnr: testFnr.GyldigeFraDolly.TestPerson1 },
        initPerson: initPerson,
        setSkjemaStatus: setSkjemaStatus,
        initFravaersperiode: initFravaersperiode,
        initEgenmeldingsperiode: initEgenmeldingsperiode,
        tilbakestillArbeidsgiverperiode: tilbakestillArbeidsgiverperiode,
        setIdentitetsnummer: vi.fn(),
        setAarsakSelvbestemtInnsending: vi.fn(),
        setSelvbestemtType: setSelvbestemtType
      })
    );
  });

  it('shows loading when tilganger not yet fetched', () => {
    // simulate hook not returned yet
    (useMineTilganger as Mock).mockReturnValue({ data: undefined, error: undefined });
    render(<InitieringFritatt />);
    expect(screen.getByText(/Opprett inntektsmelding for et sykefravær/)).toBeInTheDocument();
  });

  it('renders select and validates required fields', async () => {
    // one nested underenhet in data
    const mockData = [
      {
        orgnr: '1',
        navn: 'Top Org',
        underenheter: [
          { orgnr: '11', navn: 'Child Org', underenheter: [] },
          { orgnr: '12', navn: 'Child Org 2', underenheter: [] }
        ]
      }
    ];
    (useMineTilganger as Mock).mockReturnValue({ data: mockData, error: undefined });

    render(<InitieringFritatt />);

    // wait for select to appear
    await waitFor(() => expect(screen.getByLabelText(/Hvilken underenhet/)).toBeInTheDocument());

    // Attempt to submit without selection
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));
    // expect validation error message
    const errorMessages = await screen.findAllByText(/Organisasjon er ikke valgt./);
    expect(errorMessages).toHaveLength(2);
  });

  it('submits valid form and navigates to /Fisker', async () => {
    const mockData = [
      {
        orgnr: 'A',
        navn: 'Parent',
        underenheter: [{ orgnr: testOrganisasjoner[0].organizationNumber, navn: 'Child', underenheter: [] }]
      }
    ];
    (useMineTilganger as Mock).mockReturnValue({ data: mockData, error: undefined });

    render(<InitieringFritatt />);

    // click Next
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    // expect navigation
    await waitFor(() => {
      expect(mockedRouter.push).toHaveBeenCalledWith('/Fisker');
    });

    // expect store setters called
    expect(initPerson).toHaveBeenCalledWith(
      expect.any(String), // fulltNavn from schema transform
      testFnr.GyldigeFraDolly.TestPerson1, // personnummer from store
      testOrganisasjoner[0].organizationNumber, // organisasjonsnummer
      'Child' // virksomhetsnavn
    );
    expect(setSkjemaStatus).toHaveBeenCalled();
    expect(initFravaersperiode).toHaveBeenCalled();
    expect(initEgenmeldingsperiode).toHaveBeenCalled();
    expect(tilbakestillArbeidsgiverperiode).toHaveBeenCalled();
    expect(setSelvbestemtType).toHaveBeenCalledWith('Fisker');
  });
});
