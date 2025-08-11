import React from 'react';
import { describe, it, beforeEach, vi, expect, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InitieringFritatt from '../../../pages/initieringFritatt/index';
import useMineTilganger from '../../../utils/useMineTilganger';
import useBoundStore from '../../../state/useBoundStore';
import { useRouter } from 'next/navigation';
import testFnr from '../../../mockdata/testFnr';
import testOrganisasjoner from '../../../mockdata/testOrganisasjoner';

// global.window = Object.create(window);
// Object.defineProperty(global.window, 'location', {
//   value: {
//     hostname: 'localhost',
//     replace: vi.fn()
//   },
//   writable: true
// });

// Mock next/navigation
vi.mock('next/navigation', { spy: true });

// Mock useBoundStore to apply selector on fakeStore
// Mock store and hooks
vi.mock('../../../state/useBoundStore', () => ({
  default: vi.fn()
}));

// Mock useMineTilganger
vi.mock('../../../utils/useMineTilganger', () => ({
  default: vi.fn()
}));

describe('InitieringFritatt page', () => {
  const push = vi.fn();
  const router = { push: push };
  const initPerson = vi.fn();
  const setSelvbestemtType = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useBoundStore as Mock).mockImplementation((stateFn) =>
      stateFn({
        sykmeldt: { fnr: testFnr.GyldigeFraDolly.TestPerson1 },
        initPerson: initPerson,
        setSkjemaStatus: vi.fn(),
        initFravaersperiode: vi.fn(),
        initEgenmeldingsperiode: vi.fn(),
        tilbakestillArbeidsgiverperiode: vi.fn(),
        setSelvbestemtType: setSelvbestemtType
      })
    );

    // router
    (useRouter as Mock).mockReturnValue(router);
  });

  it('shows loading spinner before tilganger arrive', () => {
    (useMineTilganger as Mock).mockReturnValue({ data: undefined, error: undefined });
    render(<InitieringFritatt />);
    expect(screen.getByText(/Opprett inntektsmelding for et sykefravær/)).toBeInTheDocument();
  });

  it('validates form and shows error if no selection', async () => {
    const mockData = [
      {
        orgnr: '1',
        navn: 'Top Org',
        underenheter: [
          { orgnr: testOrganisasjoner[0].organizationNumber, navn: 'Child Org', underenheter: [] },
          { orgnr: testOrganisasjoner[1].organizationNumber, navn: 'Child Org 2', underenheter: [] }
        ]
      }
    ];
    (useMineTilganger as Mock).mockReturnValue({ data: mockData, error: undefined });
    render(<InitieringFritatt />);
    // wait for select to mount
    await waitFor(() => screen.getByLabelText(/Hvilken underenhet/));
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));
    expect(await screen.findAllByText('Organisasjon er ikke valgt.')).toHaveLength(2);
  });

  it('validates form and shows error if no underenhet', async () => {
    const mockData = [
      {
        orgnr: '1',
        navn: 'Top Org',
        underenheter: []
      }
    ];
    (useMineTilganger as Mock).mockReturnValue({ data: mockData, error: undefined });
    render(<InitieringFritatt />);
    // wait for button to mount
    await waitFor(() => screen.getByRole('button', { name: 'Neste' }));
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    expect(await screen.findAllByText('Organisasjon er ikke valgt.')).toHaveLength(2);
  });

  it('validates form and shows error if no enhet', async () => {
    const mockData = [];
    (useMineTilganger as Mock).mockReturnValue({ data: mockData, error: undefined });
    render(<InitieringFritatt />);
    // wait for select to mount
    // await waitFor(() => screen.getByLabelText(/Hvilken underenhet/));
    // fireEvent.click(screen.getByRole('button', { name: 'Neste' }));
    await waitFor(() => screen.getByRole('button', { name: 'Neste' }));
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    expect(await screen.findAllByText('Organisasjon er ikke valgt.')).toHaveLength(2);
  });

  it('submits valid form and navigates correctly', async () => {
    const mockData = [
      {
        orgnr: '1',
        navn: 'Top Org',
        underenheter: [
          { orgnr: testOrganisasjoner[0].organizationNumber, navn: 'Child Org', underenheter: [] },
          { orgnr: testOrganisasjoner[1].organizationNumber, navn: 'Child Org 2', underenheter: [] }
        ]
      }
    ];
    (useMineTilganger as Mock).mockReturnValue({ data: mockData, error: undefined });
    render(<InitieringFritatt />);
    // choose the nested unit
    await waitFor(() => screen.getByLabelText(/Hvilken underenhet/));
    fireEvent.change(screen.getByLabelText(/Hvilken underenhet/), {
      target: { value: testOrganisasjoner[0].organizationNumber }
    });
    await waitFor(() => screen.getByRole('button', { name: 'Neste' }));
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/unntattAaRegisteret');
    });

    // store setters called
    expect(initPerson).toHaveBeenCalledWith(
      'Ukjent navn',
      testFnr.GyldigeFraDolly.TestPerson1,
      testOrganisasjoner[0].organizationNumber,
      'Child Org'
    );
    expect(setSelvbestemtType).toHaveBeenCalledWith('UtenArbeidsforhold');
    // navigation
    await waitFor(() => expect(push).toHaveBeenCalledWith('/unntattAaRegisteret'));
  });
});
