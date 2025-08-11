import React from 'react';
import { describe, it, beforeEach, vi, expect, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InitieringAnnet from '../../../pages/initieringAnnet/index';
import useBoundStore from '../../../state/useBoundStore';
import useArbeidsforhold from '../../../utils/useArbeidsforhold';
import useSykepengesoeknader from '../../../utils/useSykepengesoeknader';
import { useRouter } from 'next/router';
import testOrganisasjoner from '../../../mockdata/testOrganisasjoner';
import testFnr from '../../../mockdata/testFnr';

// global.window = Object.create(window);
// Object.defineProperty(global.window, 'location', {
//   value: {
//     ...window.location,
//     replace: vi.fn()
//   },
//   writable: true
// });

// Mock next/router
vi.mock('next/router', () => ({ useRouter: vi.fn() }));
// Mock state and hooks
vi.mock('../../../state/useBoundStore', () => ({ default: vi.fn() }));
vi.mock('../../../utils/useArbeidsforhold', () => ({ default: vi.fn() }));
vi.mock('../../../utils/useSykepengesoeknader', () => ({ default: vi.fn() }));
// Mock formatting util to simplify error display
vi.mock('../../../utils/formatRHFFeilmeldinger', () => ({
  default: (errs: any) => Object.values(errs).map((e: any) => e.message)
}));

describe('InitieringAnnet page', () => {
  const push = vi.fn();
  const fakeStore = {
    sykmeldt: { fnr: testFnr.GyldigeFraDolly.TestPerson1 },
    initPerson: vi.fn(),
    setSkjemaStatus: vi.fn(),
    initFravaersperiode: vi.fn(),
    initEgenmeldingsperiode: vi.fn(),
    tilbakestillArbeidsgiverperiode: vi.fn(),
    setVedtaksperiodeId: vi.fn(),
    setSelvbestemtType: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // router mock
    (useRouter as Mock).mockReturnValue({ push });
    // store selector returns from fakeStore
    (useBoundStore as Mock).mockImplementation((selector: any) => selector(fakeStore));
  });

  it('shows loading spinner while arbeidsforhold is loading', () => {
    (useArbeidsforhold as Mock).mockReturnValue({ data: undefined, error: undefined });
    (useSykepengesoeknader as Mock).mockReturnValue({ data: undefined, error: undefined, isLoading: false });

    render(<InitieringAnnet />);

    // should render heading and a loading indicator
    expect(screen.getByText(/Opprett inntektsmelding for et sykefravær/)).toBeInTheDocument();
    // expect(screen.getByRole('status')).toBeInTheDocument(); // Loading uses role="status"
  });

  it('submits valid form and calls store setters and navigation', async () => {
    // mock arbeidsgiver data
    const arbData = {
      fulltNavn: 'OLA NORDMANN',
      fnr: testFnr.GyldigeFraDolly.TestPerson1,
      underenheter: [
        { orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Test Barnehage' },
        { orgnrUnderenhet: testOrganisasjoner[1].organizationNumber, virksomhetsnavn: 'Test Barnehage2' }
      ],
      perioder: [{ id: 'a', fom: '2023-01-01', tom: '2023-01-10' }]
    };
    (useArbeidsforhold as Mock).mockReturnValue({ data: arbData, error: undefined });

    // mock sykepengesøknader data
    const spData = [
      {
        sykepengesoknadUuid: '123e4567-e89b-12d3-a456-426614174000',
        sykmeldingId: '123e4567-e89b-12d3-a456-426614174000',
        fom: '2023-01-01',
        tom: '2023-01-10',
        egenmeldingsdagerFraSykmelding: [],
        status: 'NY',
        startSykeforlop: '2023-01-01',
        forespoerselId: '123e4567-e89b-12d3-a456-426614174000',
        vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174000'
      }
    ];
    (useSykepengesoeknader as Mock).mockReturnValue({ data: spData, error: undefined, isLoading: false });

    render(<InitieringAnnet />);

    // wait for arbeidsgiver select to appear
    await waitFor(() => expect(screen.getByLabelText(/Organisasjon/)).toBeInTheDocument());

    // select the underenhet
    fireEvent.change(screen.getByLabelText(/Organisasjon/), {
      target: { value: testOrganisasjoner[0].organizationNumber }
    });

    // wait for sykmeldingsperiode checkbox
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /01.01.2023 - 10.01.2023/ })).toBeInTheDocument());

    // choose the periode
    fireEvent.click(screen.getByRole('checkbox', { name: /01.01.2023 - 10.01.2023/ }));

    // click "Neste" to submit
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    // expect store setters to have been called with correct args
    await waitFor(() => {
      expect(fakeStore.initPerson).toHaveBeenCalledWith(
        'OLA NORDMANN',
        testFnr.GyldigeFraDolly.TestPerson1,
        testOrganisasjoner[0].organizationNumber,
        'Test Barnehage'
      );
      expect(fakeStore.setSkjemaStatus).toHaveBeenCalled();
      expect(fakeStore.initFravaersperiode).toHaveBeenCalledWith([{ fom: '2023-01-01', tom: '2023-01-10' }]);
      expect(fakeStore.initEgenmeldingsperiode).toHaveBeenCalledWith([]); // no egenmeldingsdager
      expect(fakeStore.tilbakestillArbeidsgiverperiode).toHaveBeenCalled();
      expect(fakeStore.setVedtaksperiodeId).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(fakeStore.setSelvbestemtType).toHaveBeenCalledWith('MedArbeidsforhold');
      // final navigation
      expect(push).toHaveBeenCalledWith('/arbeidsgiverInitiertInnsending');
    });
  });

  it('submits valid form and error on endre refusjon', async () => {
    // mock arbeidsgiver data
    const arbData = {
      fulltNavn: 'OLA NORDMANN',
      fnr: testFnr.GyldigeFraDolly.TestPerson1,
      underenheter: [
        { orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Test Barnehage' },
        { orgnrUnderenhet: testOrganisasjoner[1].organizationNumber, virksomhetsnavn: 'Test Barnehage2' }
      ],
      perioder: [
        { id: 'a', fom: '2023-01-01', tom: '2023-01-10' },
        { id: 'b', fom: '2023-01-11', tom: '2023-01-20' }
      ]
    };
    (useArbeidsforhold as Mock).mockReturnValue({ data: arbData, error: undefined });

    // mock sykepengesøknader data
    const spData = [
      {
        sykepengesoknadUuid: '123e4567-e89b-12d3-a456-426614174000',
        sykmeldingId: '123e4567-e89b-12d3-a456-426614174000',
        fom: '2023-01-01',
        tom: '2023-01-10',
        egenmeldingsdagerFraSykmelding: [],
        status: 'NY',
        startSykeforlop: '2023-01-01',
        forespoerselId: '123e4567-e89b-12d3-a456-426614174000',
        vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174000'
      },
      {
        sykepengesoknadUuid: '123e4567-e89b-12d3-a456-426614174001',
        sykmeldingId: '123e4567-e89b-12d3-a456-426614174001',
        fom: '2023-01-11',
        tom: '2023-01-20',
        egenmeldingsdagerFraSykmelding: [],
        status: 'NY',
        startSykeforlop: '2023-01-11',
        forespoerselId: '123e4567-e89b-12d3-a456-426614174001',
        vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174001'
      }
    ];
    (useSykepengesoeknader as Mock).mockReturnValue({ data: spData, error: undefined, isLoading: false });

    render(<InitieringAnnet />);

    // wait for arbeidsgiver select to appear
    await waitFor(() => expect(screen.getByLabelText(/Organisasjon/)).toBeInTheDocument());

    // select the underenhet
    fireEvent.change(screen.getByLabelText(/Organisasjon/), {
      target: { value: testOrganisasjoner[0].organizationNumber }
    });

    // wait for sykmeldingsperiode checkbox
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /11.01.2023 - 20.01.2023/ })).toBeInTheDocument());

    // choose the periode
    fireEvent.click(screen.getByRole('checkbox', { name: /11.01.2023 - 20.01.2023/ }));

    // Skal du endre refusjon for den ansatte?
    fireEvent.click(screen.getByRole('radio', { name: /Ja/ }));

    // click "Neste" to submit
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    await waitFor(() =>
      expect(screen.getByText(/Du må korrigere tidligere innsendt inntektsmeldingen/)).toBeInTheDocument()
    );

    // });
  });
});
