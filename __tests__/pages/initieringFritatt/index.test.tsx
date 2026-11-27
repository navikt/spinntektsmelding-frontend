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
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InitieringFritatt from '../../../pages/initieringFritatt/index';
import useArbeidsforhold from '../../../utils/useArbeidsforhold';
import useSykepengesoeknader from '../../../utils/useSykepengesoeknader';
import useBoundStore from '../../../state/useBoundStore';
import { __mockedRouter as mockedRouter } from 'next/navigation';
import testFnr from '../../../mockdata/testFnr';
import testOrganisasjoner from '../../../mockdata/testOrganisasjoner';
import useMineTilganger from '../../../utils/useMineTilganger';
import { logger } from '@navikt/next-logger';

vi.mock('../../../utils/useMineTilganger', () => ({
  default: vi.fn()
}));

// Mock useBoundStore to apply selector on fakeStore
// Mock store and hooks
vi.mock('../../../state/useBoundStore', () => ({
  default: vi.fn()
}));

// Mock useArbeidsforhold
vi.mock('../../../utils/useArbeidsforhold', () => ({
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

  const arbeidsforholdSvar = {
    data: {
      fulltNavn: 'Ukjent navn',
      underenheter: [
        { orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Child Org' },
        { orgnrUnderenhet: testOrganisasjoner[1].organizationNumber, virksomhetsnavn: 'Child Org 2' }
      ]
    },
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn()
  };
  const tommeSoeknaderSvar = {
    data: { forespoersler: [], soeknaderArbeidstaker: [], soeknaderBehandlingsdager: [] },
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn()
  };
  const tilgangerSvar = {
    data: [
      {
        orgnr: '810007702',
        navn: 'Parent Org',
        underenheter: [
          { orgnr: testOrganisasjoner[0].organizationNumber, navn: 'Child Org', underenheter: [] },
          { orgnr: testOrganisasjoner[1].organizationNumber, navn: 'Child Org 2', underenheter: [] }
        ]
      }
    ],
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedRouter.push.mockClear();

    vi.mocked(useMineTilganger).mockReturnValue(tilgangerSvar);

    (useBoundStore as unknown as Mock).mockImplementation((stateFn) => stateFn(fakeStore));
    (useSykepengesoeknader as unknown as Mock).mockReturnValue({ data: undefined, error: undefined });
  });

  it('shows loading spinner before tilganger arrive', () => {
    (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: undefined, error: undefined });
    render(<InitieringFritatt />);
    expect(screen.getByText(/Opprett inntektsmelding for et sykefravær/)).toBeInTheDocument();
  });

  it.each(['tilganger', 'arbeidsforhold'])('waits for %s before showing employer choices', async (venterPaa) => {
    vi.mocked(useArbeidsforhold).mockReturnValue(arbeidsforholdSvar);
    vi.mocked(useSykepengesoeknader).mockReturnValue(tommeSoeknaderSvar);
    if (venterPaa === 'tilganger') {
      vi.mocked(useMineTilganger).mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: true,
        mutate: vi.fn()
      });
    } else {
      vi.mocked(useArbeidsforhold).mockReturnValue({
        ...arbeidsforholdSvar,
        data: undefined,
        isLoading: true,
        isValidating: true
      });
    }
    const { rerender } = render(<InitieringFritatt />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();
    expect(screen.getByTitle('Laster arbeidsforhold...')).toBeInTheDocument();
    expect(mockedRouter.push).not.toHaveBeenCalled();

    vi.mocked(useMineTilganger).mockReturnValue(tilgangerSvar);
    vi.mocked(useArbeidsforhold).mockReturnValue(arbeidsforholdSvar);
    rerender(<InitieringFritatt />);

    expect(screen.getByRole('combobox', { name: /Hvilken underenhet/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();
  });

  it('waits for updated primary data even when cached employment data exists', () => {
    vi.mocked(useArbeidsforhold).mockReturnValue({ ...arbeidsforholdSvar, isValidating: true });
    render(<InitieringFritatt />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();
  });

  it('shows employer choices but waits for sickness-benefit data before showing Next', async () => {
    vi.mocked(useArbeidsforhold).mockReturnValue(arbeidsforholdSvar);
    vi.mocked(useSykepengesoeknader).mockReturnValue({
      ...tommeSoeknaderSvar,
      data: undefined,
      isLoading: true,
      isValidating: true
    });
    const user = userEvent.setup();
    const { rerender } = render(<InitieringFritatt />);

    await user.click(screen.getByRole('combobox', { name: /Hvilken underenhet/ }));
    await user.click(
      await screen.findByRole('option', {
        name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Child Org`
      })
    );
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();

    vi.mocked(useSykepengesoeknader).mockReturnValue(tommeSoeknaderSvar);
    rerender(<InitieringFritatt />);
    await user.click(await screen.findByRole('button', { name: 'Neste' }));

    await waitFor(() => expect(mockedRouter.push).toHaveBeenCalledWith('/unntattAaRegisteret'));
  });

  it('hides old period choices while fetching another employer and requires a new selection afterwards', async () => {
    const soeknaderForPeriode = (id: string, fom: string, tom: string) => ({
      forespoersler: [
        {
          forespoerselId: id,
          vedtaksperiodeId: id,
          sykmeldingsperioder: [{ fom, tom }],
          egenmeldingsperioder: [],
          erBesvart: false
        }
      ],
      soeknaderArbeidstaker: [
        {
          vedtaksperiodeId: id,
          sykmeldingsperiode: { fom, tom },
          egenmeldingsperioder: [],
          erGradert: false
        }
      ],
      soeknaderBehandlingsdager: []
    });
    const gammelId = '123e4567-e89b-12d3-a456-426614174000';
    const nyId = '123e4567-e89b-12d3-a456-426614174001';
    const gammelData = soeknaderForPeriode(gammelId, '2023-01-01', '2023-01-10');
    const nyData = soeknaderForPeriode(nyId, '2023-02-01', '2023-02-10');
    let nyttSvarKlart = false;
    vi.mocked(useArbeidsforhold).mockReturnValue(arbeidsforholdSvar);
    vi.mocked(useSykepengesoeknader).mockImplementation((_fnr, orgnr) => {
      if (orgnr === testOrganisasjoner[1].organizationNumber) {
        return {
          ...tommeSoeknaderSvar,
          data: nyttSvarKlart ? nyData : gammelData,
          isLoading: !nyttSvarKlart,
          isValidating: !nyttSvarKlart
        };
      }
      return { ...tommeSoeknaderSvar, data: gammelData };
    });
    const user = userEvent.setup();
    const { rerender } = render(<InitieringFritatt />);

    await user.click(screen.getByRole('combobox', { name: /Hvilken underenhet/ }));
    await user.click(
      await screen.findByRole('option', {
        name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Child Org`
      })
    );
    await user.click(await screen.findByRole('radio', { name: /01.01.2023 - 10.01.2023/ }));
    await user.click(screen.getByRole('combobox', { name: /Hvilken underenhet/ }));
    await user.click(
      await screen.findByRole('option', {
        name: `Orgnr. ${testOrganisasjoner[1].organizationNumber} - Child Org 2`
      })
    );

    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();

    nyttSvarKlart = true;
    rerender(<InitieringFritatt />);
    const nyPeriode = await screen.findByRole('radio', { name: /01.02.2023 - 10.02.2023/ });
    expect(nyPeriode).not.toBeChecked();
    expect(screen.queryByRole('radio', { name: /01.01.2023 - 10.01.2023/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Neste' }));
    expect(await screen.findAllByText('Du må velge hva du vil gjøre videre')).toHaveLength(2);
    expect(mockedRouter.push).not.toHaveBeenCalled();

    await user.click(nyPeriode);
    await user.click(screen.getByRole('button', { name: 'Neste' }));
    await waitFor(() => expect(mockedRouter.push).toHaveBeenCalledWith(`/${nyId}`));
    expect(mockedRouter.push).not.toHaveBeenCalledWith(`/${gammelId}`);
  });

  it.each([
    { endepunkt: 'tilganger', melding: 'Kunne ikke hente tilganger. Prøv igjen senere.' },
    { endepunkt: 'arbeidsforhold', melding: 'Kunne ikke hente arbeidsforhold. Prøv igjen senere.' },
    { endepunkt: 'soeknader', melding: 'Kunne ikke hente sykepengesøknader. Prøv igjen senere.' }
  ])('shows a completed error from $endepunkt without allowing submission', async ({ endepunkt, melding }) => {
    vi.mocked(useArbeidsforhold).mockReturnValue({
      ...arbeidsforholdSvar,
      data: {
        ...arbeidsforholdSvar.data,
        underenheter: [arbeidsforholdSvar.data.underenheter[0]]
      }
    });
    vi.mocked(useSykepengesoeknader).mockReturnValue(tommeSoeknaderSvar);
    if (endepunkt === 'tilganger') {
      vi.mocked(useMineTilganger).mockReturnValue({
        data: undefined,
        error: { status: 500 },
        isLoading: false,
        isValidating: false,
        mutate: vi.fn()
      });
    } else if (endepunkt === 'arbeidsforhold') {
      vi.mocked(useArbeidsforhold).mockReturnValue({
        ...arbeidsforholdSvar,
        data: undefined,
        error: { status: 500 }
      });
    } else {
      vi.mocked(useSykepengesoeknader).mockReturnValue({
        ...tommeSoeknaderSvar,
        data: undefined,
        error: { status: 500 }
      });
    }
    await act(async () => {
      render(<InitieringFritatt />);
    });

    expect(screen.getByText(melding)).toBeInTheDocument();
    expect(screen.queryByTitle('Laster arbeidsforhold...')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();
    expect(mockedRouter.push).not.toHaveBeenCalled();
  });

  it('waits for employment and sickness-benefit data before allowing submission', async () => {
    vi.mocked(useMineTilganger).mockReturnValue({
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
      data: [
        {
          orgnr: '810007702',
          navn: 'Parent Org',
          underenheter: [
            {
              orgnr: testOrganisasjoner[0].organizationNumber,
              navn: 'Child Org',
              underenheter: []
            }
          ]
        }
      ]
    });
    vi.mocked(useArbeidsforhold).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: true,
      mutate: vi.fn()
    });
    vi.mocked(useSykepengesoeknader).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: true,
      mutate: vi.fn()
    });

    const user = userEvent.setup();
    const { rerender } = render(<InitieringFritatt />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();
    expect(mockedRouter.push).not.toHaveBeenCalled();

    vi.mocked(useArbeidsforhold).mockReturnValue({
      data: {
        fulltNavn: 'Ukjent navn',
        underenheter: [{ orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Child Org' }]
      },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    rerender(<InitieringFritatt />);

    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();
    vi.mocked(useSykepengesoeknader).mockReturnValue({
      ...tommeSoeknaderSvar,
      data: undefined,
      error: { status: 404 }
    });
    await act(async () => {
      rerender(<InitieringFritatt />);
    });

    expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();
    expect(mockedRouter.push).not.toHaveBeenCalled();
  });

  it('automatically selects the sole accessible employer when employment data arrives later', async () => {
    vi.mocked(useArbeidsforhold).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: true,
      mutate: vi.fn()
    });
    vi.mocked(useSykepengesoeknader).mockReturnValue({
      data: undefined,
      error: { status: 404 },
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    const user = userEvent.setup();
    const { rerender } = render(<InitieringFritatt />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();

    vi.mocked(useArbeidsforhold).mockReturnValue({
      data: {
        fulltNavn: 'Ukjent navn',
        underenheter: [
          { orgnrUnderenhet: testOrganisasjoner[1].organizationNumber, virksomhetsnavn: 'Outdated Org' },
          { orgnrUnderenhet: '315609267', virksomhetsnavn: 'Organisation without access' }
        ]
      },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    rerender(<InitieringFritatt />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText(`Orgnr. ${testOrganisasjoner[1].organizationNumber} - Child Org 2`)).toBeInTheDocument();
    expect(vi.mocked(useSykepengesoeknader)).toHaveBeenLastCalledWith(
      testFnr.GyldigeFraDolly.TestPerson1,
      testOrganisasjoner[1].organizationNumber,
      undefined
    );
    await user.click(screen.getByRole('button', { name: 'Neste' }));

    await waitFor(() => expect(mockedRouter.push).toHaveBeenCalledWith('/unntattAaRegisteret'));
    expect(fakeStore.initPerson).toHaveBeenCalledWith(
      'Ukjent navn',
      testFnr.GyldigeFraDolly.TestPerson1,
      testOrganisasjoner[1].organizationNumber,
      'Child Org 2'
    );
  });

  it('replaces the selected employer when only another employer remains after filtering', async () => {
    vi.mocked(useArbeidsforhold).mockReturnValue({
      data: {
        fulltNavn: 'Ukjent navn',
        underenheter: [
          { orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Child Org' },
          { orgnrUnderenhet: testOrganisasjoner[1].organizationNumber, virksomhetsnavn: 'Child Org 2' }
        ]
      },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    vi.mocked(useSykepengesoeknader).mockReturnValue({
      data: undefined,
      error: { status: 404 },
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    const user = userEvent.setup();
    const { rerender } = render(<InitieringFritatt />);

    await user.click(screen.getByRole('combobox', { name: /Hvilken underenhet/ }));
    await user.click(
      await screen.findByRole('option', {
        name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Child Org`
      })
    );
    expect(vi.mocked(useSykepengesoeknader)).toHaveBeenLastCalledWith(
      testFnr.GyldigeFraDolly.TestPerson1,
      testOrganisasjoner[0].organizationNumber,
      undefined
    );

    vi.mocked(useArbeidsforhold).mockReturnValue({
      data: {
        fulltNavn: 'Ukjent navn',
        underenheter: [{ orgnrUnderenhet: testOrganisasjoner[1].organizationNumber, virksomhetsnavn: 'Child Org 2' }]
      },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    rerender(<InitieringFritatt />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(vi.mocked(useSykepengesoeknader)).toHaveBeenLastCalledWith(
      testFnr.GyldigeFraDolly.TestPerson1,
      testOrganisasjoner[1].organizationNumber,
      undefined
    );
    await user.click(screen.getByRole('button', { name: 'Neste' }));

    await waitFor(() => expect(mockedRouter.push).toHaveBeenCalledWith('/unntattAaRegisteret'));
    expect(fakeStore.initPerson).toHaveBeenCalledOnce();
    expect(fakeStore.initPerson).toHaveBeenCalledWith(
      'Ukjent navn',
      testFnr.GyldigeFraDolly.TestPerson1,
      testOrganisasjoner[1].organizationNumber,
      'Child Org 2'
    );
  });

  it('does not select utenKobling when sickness-benefit data arrives later', async () => {
    vi.mocked(useMineTilganger).mockReturnValue({
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
      data: [
        {
          orgnr: '810007702',
          navn: 'Parent Org',
          underenheter: [
            {
              orgnr: testOrganisasjoner[0].organizationNumber,
              navn: 'Child Org',
              underenheter: []
            }
          ]
        }
      ]
    });

    const mockData = {
      fulltNavn: 'Ukjent navn',
      fnr: testFnr.GyldigeFraDolly.TestPerson1,
      underenheter: [{ orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Child Org' }]
    };
    (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: mockData, error: undefined });
    (useSykepengesoeknader as unknown as Mock).mockReturnValue({ data: undefined, error: undefined });

    const { rerender } = render(<InitieringFritatt />);
    const forespoerselId = '123e4567-e89b-12d3-a456-426614174000';
    (useSykepengesoeknader as unknown as Mock).mockReturnValue({
      data: {
        forespoersler: [
          {
            forespoerselId,
            sykmeldingsperioder: [{ fom: '2023-01-01', tom: '2023-01-10' }],
            egenmeldingsperioder: [],
            erBesvart: false,
            vedtaksperiodeId: forespoerselId
          }
        ],
        soeknaderArbeidstaker: [
          {
            sykmeldingsperiode: { fom: '2023-01-01', tom: '2023-01-10' },
            egenmeldingsperioder: [],
            erGradert: false,
            vedtaksperiodeId: forespoerselId
          }
        ],
        soeknaderBehandlingsdager: []
      },
      error: undefined
    });
    rerender(<InitieringFritatt />);

    const user = userEvent.setup();
    const utenKoblingRadio = await screen.findByRole('radio', { name: 'Send inntektsmelding for annen periode' });
    expect(utenKoblingRadio).not.toBeChecked();
    await user.click(utenKoblingRadio);
    expect(utenKoblingRadio).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Neste' }));

    await waitFor(() => expect(mockedRouter.push).toHaveBeenCalledWith('/unntattAaRegisteret'));
  });

  it('keeps utenKobling selected when arbeidsforhold arrive after a 404 response', async () => {
    vi.mocked(useArbeidsforhold).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: true,
      mutate: vi.fn()
    });
    vi.mocked(useSykepengesoeknader).mockReturnValue({
      data: undefined,
      error: { status: 404 },
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    const user = userEvent.setup();
    const { rerender } = render(<InitieringFritatt />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();

    vi.mocked(useArbeidsforhold).mockReturnValue({
      data: {
        fulltNavn: 'Ukjent navn',
        underenheter: [
          { orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Child Org' },
          { orgnrUnderenhet: testOrganisasjoner[1].organizationNumber, virksomhetsnavn: 'Child Org 2' }
        ]
      },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    rerender(<InitieringFritatt />);
    await user.click(screen.getByRole('combobox', { name: /Hvilken underenhet/ }));
    await user.click(
      await screen.findByRole('option', {
        name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Child Org`
      })
    );
    await user.click(screen.getByRole('button', { name: 'Neste' }));

    await waitFor(() => expect(mockedRouter.push).toHaveBeenCalledWith('/unntattAaRegisteret'));
  });

  it('requires an employer selection before showing Next', () => {
    const mockData = {
      fulltNavn: 'Ukjent navn',
      fnr: testFnr.GyldigeFraDolly.TestPerson1,
      underenheter: [
        { orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Child Org' },
        { orgnrUnderenhet: testOrganisasjoner[1].organizationNumber, virksomhetsnavn: 'Child Org 2' }
      ]
    };
    (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: mockData, error: undefined });
    render(<InitieringFritatt />);
    expect(screen.getByRole('combobox', { name: /Hvilken underenhet/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();
    expect(mockedRouter.push).not.toHaveBeenCalled();
  });

  it('shows a completed empty state when the employee has no units', () => {
    const mockData = {
      fulltNavn: 'Ukjent navn',
      fnr: testFnr.GyldigeFraDolly.TestPerson1,
      underenheter: []
    };
    (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: mockData, error: undefined });
    render(<InitieringFritatt />);
    expect(screen.getByText('Ingen tilgjengelige arbeidsgivere for den ansatte.')).toBeInTheDocument();
    expect(screen.queryByTitle('Laster arbeidsforhold...')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();
  });

  it('shows a completed empty state when the access list is empty', () => {
    vi.mocked(useArbeidsforhold).mockReturnValue(arbeidsforholdSvar);
    vi.mocked(useMineTilganger).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    render(<InitieringFritatt />);

    expect(screen.getByText('Ingen tilgjengelige arbeidsgivere for den ansatte.')).toBeInTheDocument();
    expect(screen.queryByTitle('Laster arbeidsforhold...')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();
  });

  it.each([
    { underenheter: [] },
    { underenheter: [{ orgnrUnderenhet: '315609267', virksomhetsnavn: 'Organisation without access' }] }
  ])('blocks submission when no employment matches the access list: %j', async ({ underenheter }) => {
    vi.mocked(useArbeidsforhold).mockReturnValue({
      data: { fulltNavn: 'Ukjent navn', underenheter },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    vi.mocked(useSykepengesoeknader).mockReturnValue({
      data: undefined,
      error: { status: 404 },
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    render(<InitieringFritatt />);

    expect(screen.getByText('Ingen tilgjengelige arbeidsgivere for den ansatte.')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();
    expect(fakeStore.initPerson).not.toHaveBeenCalled();
    expect(mockedRouter.push).not.toHaveBeenCalled();
  });

  it.each(['Ukjent navn', ''])(
    'uses the sole matching employer when there are no sickness-benefit periods and the name is "%s"',
    async (fulltNavn) => {
      const mockData = {
        fulltNavn,
        fnr: testFnr.GyldigeFraDolly.TestPerson1,
        underenheter: [{ orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Outdated Org' }]
      };
      (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: mockData, error: undefined });
      (useSykepengesoeknader as unknown as Mock).mockReturnValue({ data: undefined, error: { status: 404 } });
      const user = userEvent.setup();
      render(<InitieringFritatt />);

      expect(screen.getByText(`Orgnr. ${testOrganisasjoner[0].organizationNumber} - Child Org`)).toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      expect(
        screen.queryByText(`Orgnr. ${testOrganisasjoner[1].organizationNumber} - Child Org 2`)
      ).not.toBeInTheDocument();
      const logInfo = vi.spyOn(logger, 'info');
      await user.click(screen.getByRole('button', { name: 'Neste' }));

      if (!fulltNavn) {
        await waitFor(() =>
          expect(logInfo).toHaveBeenCalledWith('Validering av skjemadata feilet: %j', expect.any(Array))
        );
        expect(fakeStore.initPerson).not.toHaveBeenCalled();
        expect(mockedRouter.push).not.toHaveBeenCalled();
        logInfo.mockRestore();
        return;
      }

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
      expect(fakeStore.setSkjemaStatus).toHaveBeenCalledWith('SELVBESTEMT');
      expect(fakeStore.initFravaersperiode).toHaveBeenCalledWith([]);
      expect(fakeStore.initEgenmeldingsperiode).toHaveBeenCalledWith([]);
      expect(fakeStore.tilbakestillArbeidsgiverperiode).toHaveBeenCalledOnce();
      expect(fakeStore.setVedtaksperiodeId).not.toHaveBeenCalled();
      expect(fakeStore.setHarGradertSykmelding).not.toHaveBeenCalled();
      // navigation
      await waitFor(() => expect(mockedRouter.push).toHaveBeenCalledWith('/unntattAaRegisteret'));
      logInfo.mockRestore();
    }
  );

  it('stops submission when the selected organisation is no longer in tilganger', async () => {
    vi.mocked(useArbeidsforhold).mockReturnValue({
      data: {
        fulltNavn: 'Ukjent navn',
        underenheter: [
          { orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Child Org' },
          { orgnrUnderenhet: testOrganisasjoner[1].organizationNumber, virksomhetsnavn: 'Child Org 2' }
        ]
      },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    vi.mocked(useSykepengesoeknader).mockReturnValue({
      data: undefined,
      error: { status: 404 },
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    const user = userEvent.setup();
    const { rerender } = render(<InitieringFritatt />);

    await user.click(screen.getByLabelText(/Hvilken underenhet/));
    await user.click(
      await screen.findByRole('option', {
        name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Child Org`
      })
    );

    vi.mocked(useMineTilganger).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    });
    rerender(<InitieringFritatt />);

    expect(screen.getByText('Ingen tilgjengelige arbeidsgivere for den ansatte.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();
    expect(fakeStore.initPerson).not.toHaveBeenCalled();
    expect(mockedRouter.push).not.toHaveBeenCalled();
  });

  it('shows forespurte perioder and navigates to the periode route', async () => {
    const mockData = {
      fulltNavn: 'Ukjent navn',
      fnr: testFnr.GyldigeFraDolly.TestPerson1,
      underenheter: [
        { orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Child Org' },
        { orgnrUnderenhet: testOrganisasjoner[1].organizationNumber, virksomhetsnavn: 'Child Org 2' }
      ]
    };
    (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: mockData, error: undefined });

    const forespoerselId = '123e4567-e89b-12d3-a456-426614174000';
    const spData = {
      forespoersler: [
        {
          forespoerselId,
          sykmeldingsperioder: [{ fom: '2023-01-01', tom: '2023-01-10' }],
          egenmeldingsperioder: [],
          erBesvart: false,
          vedtaksperiodeId: forespoerselId
        }
      ],
      soeknaderArbeidstaker: [
        {
          sykmeldingsperiode: { fom: '2023-01-01', tom: '2023-01-10' },
          egenmeldingsperioder: [],
          erGradert: false,
          vedtaksperiodeId: forespoerselId
        }
      ],
      soeknaderBehandlingsdager: []
    };
    (useSykepengesoeknader as unknown as Mock).mockReturnValue({ data: spData, error: undefined });

    const user = userEvent.setup();
    render(<InitieringFritatt />);

    await user.click(screen.getByLabelText(/Hvilken underenhet/));
    await user.click(
      await screen.findByRole('option', {
        name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Child Org`
      })
    );

    expect(await screen.findByText(/Velg perioden du ønsker å sende inntektsmelding/)).toBeInTheDocument();
    await user.click(await screen.findByRole('radio', { name: /01.01.2023 - 10.01.2023/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    await waitFor(() => expect(mockedRouter.push).toHaveBeenCalledWith(`/${forespoerselId}`));
  });

  it.each(['Ukjent navn', ''])('submits andrePerioder with person name "%s"', async (fulltNavn) => {
    const mockData = {
      fulltNavn,
      fnr: testFnr.GyldigeFraDolly.TestPerson1,
      underenheter: [
        { orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Outdated Org' },
        { orgnrUnderenhet: testOrganisasjoner[1].organizationNumber, virksomhetsnavn: 'Child Org 2' }
      ]
    };
    (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: mockData, error: undefined });

    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const spData = {
      forespoersler: [],
      soeknaderArbeidstaker: [
        {
          sykmeldingsperiode: { fom: '2023-01-01', tom: '2023-01-10' },
          egenmeldingsperioder: [],
          erGradert: true,
          vedtaksperiodeId: uuid
        }
      ],
      soeknaderBehandlingsdager: []
    };
    (useSykepengesoeknader as unknown as Mock).mockReturnValue({ data: spData, error: undefined });

    const user = userEvent.setup();
    render(<InitieringFritatt />);

    await user.click(await screen.findByLabelText(/Hvilken underenhet/));
    await user.click(
      await screen.findByRole('option', {
        name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Child Org`
      })
    );

    await user.click(await screen.findByRole('radio', { name: /en annen periode/ }));
    await user.click(await screen.findByRole('checkbox', { name: /01.01.2023 - 10.01.2023/ }));

    const logInfo = vi.spyOn(logger, 'info');
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    if (!fulltNavn) {
      await waitFor(() =>
        expect(logInfo).toHaveBeenCalledWith('Validering av skjemadata feilet: %j', expect.any(Array))
      );
      expect(fakeStore.initPerson).not.toHaveBeenCalled();
      expect(mockedRouter.push).not.toHaveBeenCalled();
      logInfo.mockRestore();
      return;
    }

    await waitFor(() => expect(mockedRouter.push).toHaveBeenCalledWith('/arbeidsgiverInitiertInnsending'));
    expect(fakeStore.initPerson).toHaveBeenCalledWith(
      'Ukjent navn',
      testFnr.GyldigeFraDolly.TestPerson1,
      testOrganisasjoner[0].organizationNumber,
      'Child Org'
    );
    expect(fakeStore.setSelvbestemtType).toHaveBeenCalledWith('MedArbeidsforhold');
    expect(fakeStore.setVedtaksperiodeId).toHaveBeenCalledWith(uuid);
    expect(fakeStore.setHarGradertSykmelding).toHaveBeenCalledWith(true);
    logInfo.mockRestore();
  });

  it('clears refund choices when changing the period choice and resetting the form', async () => {
    (useArbeidsforhold as Mock).mockReturnValue({
      data: {
        fulltNavn: 'Testperson',
        underenheter: [
          { orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Child Org' },
          { orgnrUnderenhet: testOrganisasjoner[1].organizationNumber, virksomhetsnavn: 'Child Org 2' }
        ]
      },
      error: undefined
    });
    const forespoerselId = '123e4567-e89b-12d3-a456-426614174000';
    (useSykepengesoeknader as Mock).mockReturnValue({
      data: {
        forespoersler: [
          {
            forespoerselId,
            vedtaksperiodeId: forespoerselId,
            sykmeldingsperioder: [{ fom: '2023-01-01', tom: '2023-01-10' }],
            egenmeldingsperioder: [],
            erBesvart: false
          }
        ],
        soeknaderArbeidstaker: [
          {
            vedtaksperiodeId: forespoerselId,
            sykmeldingsperiode: { fom: '2023-01-01', tom: '2023-01-10' },
            egenmeldingsperioder: [],
            erGradert: false
          },
          {
            vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174001',
            forlengerVedtaksperiodeId: forespoerselId,
            sykmeldingsperiode: { fom: '2023-01-11', tom: '2023-01-20' },
            egenmeldingsperioder: [],
            erGradert: false
          }
        ],
        soeknaderBehandlingsdager: []
      },
      error: undefined
    });

    const user = userEvent.setup();
    render(<InitieringFritatt />);

    await user.click(await screen.findByLabelText(/Hvilken underenhet/));
    await user.click(
      await screen.findByRole('option', {
        name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Child Org`
      })
    );
    await user.click(screen.getByRole('radio', { name: /Eller velg en annen periode/ }));
    await user.click(screen.getByRole('checkbox', { name: /Forlengelse/ }));
    await user.click(screen.getByRole('radio', { name: 'Ja' }));

    expect(screen.getByRole('link', { name: /Inntektsmelding Testperson/ })).toHaveAttribute(
      'href',
      expect.stringContaining(forespoerselId)
    );
    expect(screen.getByText('Sykmeldingsperiode: 01.01.2023 - 10.01.2023')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Send inntektsmelding for annen periode' }));
    expect(screen.queryByText('Skal du endre refusjon for den ansatte?')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Inntektsmelding Testperson/ })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Forlengelse/ })).not.toBeChecked();

    await user.click(screen.getByRole('radio', { name: /Eller velg en annen periode/ }));
    await user.click(screen.getByRole('checkbox', { name: /Forlengelse/ }));
    expect(screen.getByRole('radio', { name: 'Ja' })).not.toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Nei' }));
    expect(screen.getByText('Du trenger ikke sende inn en ny inntektsmelding for denne perioden.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tilbakestill' }));
    expect(screen.queryByText('Skal du endre refusjon for den ansatte?')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Du trenger ikke sende inn en ny inntektsmelding for denne perioden.')
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /Forlengelse/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();
    expect(mockedRouter.push).not.toHaveBeenCalled();
  });

  it('shows error when andrePerioder is selected without choosing a periode', async () => {
    const mockData = {
      fulltNavn: 'Ukjent navn',
      fnr: testFnr.GyldigeFraDolly.TestPerson1,
      underenheter: [
        { orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Child Org' },
        { orgnrUnderenhet: testOrganisasjoner[1].organizationNumber, virksomhetsnavn: 'Child Org 2' }
      ]
    };
    (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: mockData, error: undefined });

    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const spData = {
      forespoersler: [
        {
          forespoerselId: '049c78f1-ab2d-4886-91dd-36bb8787b4a4',
          sykmeldingsperioder: [{ fom: '2025-04-01', tom: '2025-04-19' }],
          egenmeldingsperioder: [{ fom: '2025-03-30', tom: '2025-03-31' }],
          erBesvart: true,
          vedtaksperiodeId: '049c78f1-ab2d-4886-91dd-36bb8787b4a4'
        }
      ],
      soeknaderArbeidstaker: [
        {
          sykmeldingsperiode: { fom: '2023-01-01', tom: '2023-01-10' },
          egenmeldingsperioder: [],
          erGradert: false,
          vedtaksperiodeId: uuid
        }
      ],
      soeknaderBehandlingsdager: []
    };
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

    expect(await screen.findAllByText('Du må velge minst én periode du vil sende inntektsmelding for')).toHaveLength(2);
    expect(mockedRouter.push).not.toHaveBeenCalled();
  });

  it('shows error when andrePerioder is selected without choosing a periode and no forespoerseler', async () => {
    const mockData = {
      fulltNavn: 'Ukjent navn',
      fnr: testFnr.GyldigeFraDolly.TestPerson1,
      underenheter: [
        { orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Child Org' },
        { orgnrUnderenhet: testOrganisasjoner[1].organizationNumber, virksomhetsnavn: 'Child Org 2' }
      ]
    };
    (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: mockData, error: undefined });

    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    const spData = {
      forespoersler: [],
      soeknaderArbeidstaker: [
        {
          sykmeldingsperiode: { fom: '2023-01-01', tom: '2023-01-10' },
          egenmeldingsperioder: [],
          erGradert: false,
          vedtaksperiodeId: uuid
        }
      ],
      soeknaderBehandlingsdager: []
    };
    (useSykepengesoeknader as unknown as Mock).mockReturnValue({ data: spData, error: undefined });

    const user = userEvent.setup();
    render(<InitieringFritatt />);

    await user.click(await screen.findByLabelText(/Hvilken underenhet/));
    await user.click(
      await screen.findByRole('option', {
        name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Child Org`
      })
    );

    await user.click(await screen.findByRole('radio', { name: /Velg en annen periode/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    expect(await screen.findAllByText('Du må velge minst én periode du vil sende inntektsmelding for')).toHaveLength(2);
    expect(mockedRouter.push).not.toHaveBeenCalled();
  });
});
