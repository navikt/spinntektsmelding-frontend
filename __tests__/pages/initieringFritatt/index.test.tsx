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
import userEvent from '@testing-library/user-event';
import InitieringFritatt from '../../../pages/initieringFritatt/index';
import useMineTilganger from '../../../utils/useMineTilganger';
import useSykepengesoeknader from '../../../utils/useSykepengesoeknader';
import useBoundStore from '../../../state/useBoundStore';
import { __mockedRouter as mockedRouter } from 'next/navigation';
import testFnr from '../../../mockdata/testFnr';
import testOrganisasjoner from '../../../mockdata/testOrganisasjoner';

// Mock useBoundStore to apply selector on fakeStore
// Mock store and hooks
vi.mock('../../../state/useBoundStore', () => ({
  default: vi.fn()
}));

// Mock useMineTilganger
vi.mock('../../../utils/useMineTilganger', () => ({
  default: vi.fn()
}));

// Mock useSykepengesoeknader
vi.mock('../../../utils/useSykepengesoeknader', () => ({
  default: vi.fn()
}));

describe('InitieringFritatt page', () => {
  const fakeStore = {
    sykmeldt: { fnr: testFnr.GyldigeFraDolly.TestPerson1 },
    initPerson: vi.fn(),
    setSkjemaStatus: vi.fn(),
    initFravaersperiode: vi.fn(),
    initEgenmeldingsperiode: vi.fn(),
    tilbakestillArbeidsgiverperiode: vi.fn(),
    setSelvbestemtType: vi.fn(),
    setVedtaksperiodeId: vi.fn(),
    setHarGradertSykmelding: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedRouter.push.mockClear();

    (useBoundStore as unknown as Mock).mockImplementation((stateFn) => stateFn(fakeStore));
    (useSykepengesoeknader as unknown as Mock).mockReturnValue({ data: undefined, error: undefined });
  });

  it('shows loading spinner before tilganger arrive', () => {
    (useMineTilganger as unknown as Mock).mockReturnValue({ data: undefined, error: undefined });
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
    (useMineTilganger as unknown as Mock).mockReturnValue({ data: mockData, error: undefined });
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
    (useMineTilganger as unknown as Mock).mockReturnValue({ data: mockData, error: undefined });
    render(<InitieringFritatt />);
    // wait for button to mount
    await waitFor(() => screen.getByRole('button', { name: 'Neste' }));
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    expect(await screen.findAllByText('Organisasjon er ikke valgt.')).toHaveLength(2);
  });

  it('validates form and shows error if no enhet', async () => {
    const mockData = [];
    (useMineTilganger as unknown as Mock).mockReturnValue({ data: mockData, error: undefined });
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
    (useMineTilganger as unknown as Mock).mockReturnValue({ data: mockData, error: undefined });
    (useSykepengesoeknader as unknown as Mock).mockReturnValue({ data: undefined, error: new Error('ingen') });
    const user = userEvent.setup();
    render(<InitieringFritatt />);
    // choose the nested unit
    await waitFor(() => screen.getByLabelText(/Hvilken underenhet/));
    await user.click(screen.getByLabelText(/Hvilken underenhet/));
    await user.click(
      await screen.findByRole('option', {
        name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Child Org`
      })
    );
    await waitFor(() => screen.getByRole('button', { name: 'Neste' }));
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    await waitFor(() => {
      expect(mockedRouter.push).toHaveBeenCalledWith('/unntattAaRegisteret');
    });

    // store setters called
    expect(fakeStore.initPerson).toHaveBeenCalledWith(
      'Ukjent navn',
      testFnr.GyldigeFraDolly.TestPerson1,
      testOrganisasjoner[0].organizationNumber,
      'Child Org'
    );
    expect(fakeStore.setSelvbestemtType).toHaveBeenCalledWith('UtenArbeidsforhold');
    // navigation
    await waitFor(() => expect(mockedRouter.push).toHaveBeenCalledWith('/unntattAaRegisteret'));
  });

  it('shows forespurte perioder and navigates to the periode route', async () => {
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
    (useMineTilganger as unknown as Mock).mockReturnValue({ data: mockData, error: undefined });

    const forespoerselId = '123e4567-e89b-12d3-a456-426614174000';
    const spData = [
      {
        sykepengesoknadUuid: forespoerselId,
        sykmeldingId: forespoerselId,
        fom: '2023-01-01',
        tom: '2023-01-10',
        egenmeldingsdagerFraSykmelding: [],
        status: 'NY',
        startSykeforlop: '2023-01-01',
        forespoerselId: forespoerselId,
        vedtaksperiodeId: forespoerselId
      }
    ];
    (useSykepengesoeknader as unknown as Mock).mockReturnValue({ data: spData, error: undefined });

    const user = userEvent.setup();
    render(<InitieringFritatt />);

    await waitFor(() => expect(screen.getByText(/Vi fant sykepengesøknader for disse periodene/)).toBeInTheDocument());

    await user.click(screen.getByLabelText(/Hvilken underenhet/));
    await user.click(
      await screen.findByRole('option', {
        name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Child Org`
      })
    );

    await user.click(await screen.findByRole('radio', { name: /01.01.2023 - 10.01.2023/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    await waitFor(() => expect(mockedRouter.push).toHaveBeenCalledWith(`/${forespoerselId}`));
  });

  it('submits andrePerioder selection and navigates to arbeidsgiverInitiertInnsending', async () => {
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
    (useMineTilganger as unknown as Mock).mockReturnValue({ data: mockData, error: undefined });

    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const spData = [
      {
        sykepengesoknadUuid: uuid,
        sykmeldingId: uuid,
        fom: '2023-01-01',
        tom: '2023-01-10',
        egenmeldingsdagerFraSykmelding: [],
        status: 'NY',
        startSykeforlop: '2023-01-01',
        vedtaksperiodeId: uuid,
        soknadsperioder: [{ fom: '2023-01-01', tom: '2023-01-10', grad: 50 }]
      }
    ];
    (useSykepengesoeknader as unknown as Mock).mockReturnValue({ data: spData, error: undefined });

    const user = userEvent.setup();
    render(<InitieringFritatt />);

    await user.click(await screen.findByLabelText(/Hvilken underenhet/));
    await user.click(
      await screen.findByRole('option', {
        name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Child Org`
      })
    );

    await user.click(await screen.findByRole('radio', { name: /Eller velg en annen periode/ }));
    await user.click(await screen.findByRole('checkbox', { name: /01.01.2023 - 10.01.2023/ }));

    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    await waitFor(() => expect(mockedRouter.push).toHaveBeenCalledWith('/arbeidsgiverInitiertInnsending'));
    expect(fakeStore.setSelvbestemtType).toHaveBeenCalledWith('MedArbeidsforhold');
    expect(fakeStore.setVedtaksperiodeId).toHaveBeenCalledWith(uuid);
    expect(fakeStore.setHarGradertSykmelding).toHaveBeenCalledWith(true);
  });

  it('shows error when andrePerioder is selected without choosing a periode', async () => {
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
    (useMineTilganger as unknown as Mock).mockReturnValue({ data: mockData, error: undefined });

    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const spData = [
      {
        sykepengesoknadUuid: uuid,
        sykmeldingId: uuid,
        fom: '2023-01-01',
        tom: '2023-01-10',
        egenmeldingsdagerFraSykmelding: [],
        status: 'NY',
        startSykeforlop: '2023-01-01',
        vedtaksperiodeId: uuid
      }
    ];
    (useSykepengesoeknader as unknown as Mock).mockReturnValue({ data: spData, error: undefined });

    const user = userEvent.setup();
    render(<InitieringFritatt />);

    await user.click(await screen.findByLabelText(/Hvilken underenhet/));
    await user.click(
      await screen.findByRole('option', {
        name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Child Org`
      })
    );

    await user.click(await screen.findByRole('radio', { name: /Eller velg en annen periode/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    expect(await screen.findAllByText('Du må velge periodene som det skal sendes inntektsmelding for')).toHaveLength(2);
    expect(mockedRouter.push).not.toHaveBeenCalled();
  });
});
