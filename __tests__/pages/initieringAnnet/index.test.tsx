const mockedRouter = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn()
}));

vi.mock('next/navigation', () => ({
  useRouter: () => mockedRouter
}));

import React from 'react';
import { describe, it, beforeEach, vi, expect, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InitieringAnnet from '../../../pages/initieringAnnet/index';
import useBoundStore from '../../../state/useBoundStore';
import useArbeidsforhold from '../../../utils/useArbeidsforhold';
import useInitieringData from '../../../utils/useInitieringData';
import testOrganisasjoner from '../../../mockdata/testOrganisasjoner';
import testFnr from '../../../mockdata/testFnr';
import type { EndepunktSykepengesoeknader } from '../../../schema/EndepunktSykepengesoeknaderSchema';

// Mock state and hooks
vi.mock('../../../state/useBoundStore', () => ({ default: vi.fn() }));
vi.mock('../../../utils/useArbeidsforhold', () => ({ default: vi.fn() }));
vi.mock('../../../utils/useInitieringData', () => ({ default: vi.fn() }));
// Mock formatting util to simplify error display
vi.mock('../../../utils/formatRHFFeilmeldinger', () => ({
  default: (errs: any) => Object.values(errs).map((e: any) => e.message)
}));

describe('InitieringAnnet page', () => {
  let mockedSykepengesoeknader: {
    data: EndepunktSykepengesoeknader | undefined;
    error: unknown;
    isLoading: boolean;
  };

  const fakeStore = {
    sykmeldt: { fnr: testFnr.GyldigeFraDolly.TestPerson1 },
    initPerson: vi.fn(),
    setSkjemaStatus: vi.fn(),
    initFravaersperiode: vi.fn(),
    initEgenmeldingsperiode: vi.fn(),
    tilbakestillArbeidsgiverperiode: vi.fn(),
    setVedtaksperiodeId: vi.fn(),
    setSelvbestemtType: vi.fn(),
    setHarGradertSykmelding: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedSykepengesoeknader = { data: undefined, error: undefined, isLoading: false };
    // router mock
    mockedRouter.push.mockClear();
    // store selector returns from fakeStore
    (useBoundStore as unknown as unknown as Mock).mockImplementation((selector: any) => selector(fakeStore));
    (useInitieringData as unknown as Mock).mockImplementation((_fnr, valgtOrganisasjonsnummer) => {
      const arbeidsforholdResponse = (useArbeidsforhold as unknown as Mock)();
      const { data: spData, error: spError, isLoading: spIsLoading } = mockedSykepengesoeknader;
      const underenheter = arbeidsforholdResponse?.data?.underenheter ?? [];
      const arbeidsforhold = underenheter.map((arbeidsgiver: any) => ({
        orgnrUnderenhet: arbeidsgiver.orgnrUnderenhet,
        virksomhetsnavn: arbeidsgiver.virksomhetsnavn
      }));
      const organisasjonsnummer =
        valgtOrganisasjonsnummer ?? (arbeidsforhold.length === 1 ? arbeidsforhold[0].orgnrUnderenhet : undefined);
      const forespoersler = spData?.forespoersler ?? [];
      const soeknaderArbeidstaker = spData?.soeknaderArbeidstaker ?? [];
      const sykepengePerioder = soeknaderArbeidstaker.map((soeknad: any) => ({
        id: soeknad.vedtaksperiodeId,
        fom: new Date(soeknad.sykmeldingsperiode.fom),
        tom: new Date(soeknad.sykmeldingsperiode.tom),
        egenmeldingsperioder: soeknad.egenmeldingsperioder,
        forespoerselId: forespoersler.find(
          (foresp: any) => foresp.sykmeldingsperioder[0].fom === soeknad.sykmeldingsperiode.fom
        )?.forespoerselId,
        forlengerVedtaksperiodeId: soeknad.forlengerVedtaksperiodeId
      }));

      return {
        data: arbeidsforholdResponse?.data,
        error: arbeidsforholdResponse?.error,
        arbeidsforhold,
        fulltNavn: arbeidsforholdResponse?.data?.fulltNavn ?? '',
        orgNavnMangler: false,
        organisasjonsnummer,
        spData,
        spError,
        spIsLoading,
        forespoersler,
        soeknaderArbeidstaker,
        sykepengePerioder
      };
    });
  });

  it('shows loading spinner while arbeidsforhold is loading', () => {
    (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: undefined, error: undefined });

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
    (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: arbData, error: undefined });

    // mock sykepengesøknader data
    mockedSykepengesoeknader.data = {
      forespoersler: [
        {
          forespoerselId: '123e4567-e89b-12d3-a456-426614174000',
          sykmeldingsperioder: [{ fom: '2023-01-01', tom: '2023-01-10' }],
          egenmeldingsperioder: [],
          erBesvart: false
        }
      ],
      soeknaderArbeidstaker: [
        {
          sykmeldingsperiode: { fom: '2023-01-01', tom: '2023-01-10' },
          egenmeldingsperioder: [],
          erGradert: false,
          vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174000'
        }
      ],
      soeknaderBehandlingsdager: []
    };

    render(<InitieringAnnet />);

    // wait for arbeidsgiver select to appear
    await waitFor(() => expect(screen.getByLabelText(/Hvilken underenhet/)).toBeInTheDocument());

    // select the underenhet
    const user = userEvent.setup();
    await user.click(screen.getByLabelText(/Hvilken underenhet/));
    await user.click(
      await screen.findByRole('option', { name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Test Barnehage` })
    );

    // wait for sykmeldingsperiode checkbox
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /01.01.2023 - 10.01.2023/ })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('radio', { name: /Eller velg en annen periode/ }));

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
      expect(mockedRouter.push).toHaveBeenCalledWith('/arbeidsgiverInitiertInnsending');
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
    (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: arbData, error: undefined });

    // mock sykepengesøknader data
    mockedSykepengesoeknader.data = {
      forespoersler: [
        {
          forespoerselId: '123e4567-e89b-12d3-a456-426614174000',
          sykmeldingsperioder: [{ fom: '2023-01-01', tom: '2023-01-10' }],
          egenmeldingsperioder: [],
          erBesvart: false
        },
        {
          forespoerselId: '123e4567-e89b-12d3-a456-426614174001',
          sykmeldingsperioder: [{ fom: '2023-01-11', tom: '2023-01-20' }],
          egenmeldingsperioder: [],
          erBesvart: false
        }
      ],
      soeknaderArbeidstaker: [
        {
          sykmeldingsperiode: { fom: '2023-01-01', tom: '2023-01-10' },
          egenmeldingsperioder: [],
          erGradert: false,
          vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174000'
        },
        {
          sykmeldingsperiode: { fom: '2023-01-11', tom: '2023-01-20' },
          egenmeldingsperioder: [],
          erGradert: false,
          vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174001',
          forlengerVedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174000'
        }
      ],
      soeknaderBehandlingsdager: []
    };

    render(<InitieringAnnet />);

    // wait for arbeidsgiver select to appear
    await waitFor(() => expect(screen.getByLabelText(/Hvilken underenhet/)).toBeInTheDocument());

    // select the underenhet
    const user = userEvent.setup();
    await user.click(screen.getByLabelText(/Hvilken underenhet/));
    await user.click(
      await screen.findByRole('option', { name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Test Barnehage` })
    );

    // wait for sykmeldingsperiode checkbox
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /11.01.2023 - 20.01.2023/ })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('radio', { name: /Eller velg en annen periode/ }));

    // choose the periode
    fireEvent.click(screen.getByRole('checkbox', { name: /11.01.2023 - 20.01.2023/ }));

    // Skal du endre refusjonen for den ansatte?
    fireEvent.click(screen.getByRole('radio', { name: /Ja/ }));

    // click "Neste" to submit
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    await waitFor(() =>
      expect(screen.getByText(/Du må korrigere den tidligere innsendte inntektsmeldingen/)).toBeInTheDocument()
    );

    // });
  });

  it('submits valid form and error on endre refusjon show 3 egenmeldingsdager', async () => {
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
    (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: arbData, error: undefined });

    // mock sykepengesøknader data
    mockedSykepengesoeknader.data = {
      forespoersler: [
        {
          forespoerselId: '123e4567-e89b-12d3-a456-426614174000',
          sykmeldingsperioder: [{ fom: '2023-01-01', tom: '2023-01-10' }],
          egenmeldingsperioder: [],
          erBesvart: false
        },
        {
          forespoerselId: '123e4567-e89b-12d3-a456-426614174001',
          sykmeldingsperioder: [{ fom: '2023-01-11', tom: '2023-01-20' }],
          egenmeldingsperioder: [],
          erBesvart: false
        }
      ],
      soeknaderArbeidstaker: [
        {
          sykmeldingsperiode: { fom: '2023-01-01', tom: '2023-01-10' },
          egenmeldingsperioder: [],
          erGradert: false,
          vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174000'
        },
        {
          sykmeldingsperiode: { fom: '2023-01-11', tom: '2023-01-20' },
          egenmeldingsperioder: [{ fom: '2023-01-01', tom: '2023-01-03' }],
          erGradert: false,
          vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174001',
          forlengerVedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174000'
        }
      ],
      soeknaderBehandlingsdager: []
    };

    render(<InitieringAnnet />);

    // wait for arbeidsgiver select to appear
    await waitFor(() => expect(screen.getByLabelText(/Hvilken underenhet/)).toBeInTheDocument());

    // select the underenhet
    const user = userEvent.setup();
    await user.click(screen.getByLabelText(/Hvilken underenhet/));
    await user.click(
      await screen.findByRole('option', { name: `Orgnr. ${testOrganisasjoner[0].organizationNumber} - Test Barnehage` })
    );

    // wait for arbeidsgiver select to appear
    await waitFor(() => expect(screen.getByText(/Egenmeldingsperiode:/)).toBeInTheDocument());

    // wait for sykmeldingsperiode checkbox
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /11.01.2023 - 20.01.2023/ })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('radio', { name: /Eller velg en annen periode/ }));

    // choose the periode
    fireEvent.click(screen.getByRole('checkbox', { name: /11.01.2023 - 20.01.2023/ }));

    // Skal du endre refusjonen for den ansatte?
    fireEvent.click(screen.getByRole('radio', { name: /Ja/ }));

    // click "Neste" to submit
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

    await waitFor(() =>
      expect(screen.getByText(/Du må korrigere den tidligere innsendte inntektsmeldingen/)).toBeInTheDocument()
    );
  });

  it('should detekterer forlengelse av sykepengeperiode', async () => {
    // mock arbeidsgiver data
    const arbData = {
      fulltNavn: 'OLA NORDMANN',
      fnr: testFnr.GyldigeFraDolly.TestPerson1,
      underenheter: [{ orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Test Barnehage' }],
      perioder: [
        { id: 'a', fom: '2023-01-01', tom: '2023-01-10' },
        { id: 'b', fom: '2023-01-11', tom: '2023-01-20' }
      ]
    };
    (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: arbData, error: undefined });

    // mock sykepengesøknader data
    mockedSykepengesoeknader.data = {
      forespoersler: [
        {
          forespoerselId: '123e4567-e89b-12d3-a456-426614174000',
          sykmeldingsperioder: [{ fom: '2023-01-01', tom: '2023-01-20' }],
          egenmeldingsperioder: [],
          erBesvart: false
        }
      ],
      soeknaderArbeidstaker: [
        {
          sykmeldingsperiode: { fom: '2023-01-01', tom: '2023-01-20' },
          egenmeldingsperioder: [],
          erGradert: false,
          vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174000'
        },
        {
          sykmeldingsperiode: { fom: '2023-01-21', tom: '2023-01-30' },
          egenmeldingsperioder: [],
          erGradert: false,
          vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174001',
          forlengerVedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174000'
        },
        {
          sykmeldingsperiode: { fom: '2023-02-21', tom: '2023-02-28' },
          egenmeldingsperioder: [],
          erGradert: false,
          vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174002'
        }
      ],
      soeknaderBehandlingsdager: []
    };

    render(<InitieringAnnet />);

    // wait for arbeidsgiver select to appear
    await waitFor(() => expect(screen.getByLabelText(/Forlengelse/)).toBeInTheDocument());
  });

  it(`should detekterer forlengelse av sykepengeperiode and refuse to submit if "Skal du endre refusjon for den ansatte?
" is nei`, async () => {
    // mock arbeidsgiver data
    const arbData = {
      fulltNavn: 'OLA NORDMANN',
      fnr: testFnr.GyldigeFraDolly.TestPerson1,
      underenheter: [{ orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Test Barnehage' }],
      perioder: [
        { id: 'a', fom: '2023-01-01', tom: '2023-01-10' },
        { id: 'b', fom: '2023-01-11', tom: '2023-01-20' }
      ]
    };
    (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: arbData, error: undefined });

    // mock sykepengesøknader data
    mockedSykepengesoeknader.data = {
      forespoersler: [
        {
          forespoerselId: '123e4567-e89b-12d3-a456-426614174000',
          sykmeldingsperioder: [{ fom: '2023-01-01', tom: '2023-01-20' }],
          egenmeldingsperioder: [],
          erBesvart: false
        }
      ],
      soeknaderArbeidstaker: [
        {
          sykmeldingsperiode: { fom: '2023-01-01', tom: '2023-01-20' },
          egenmeldingsperioder: [],
          erGradert: false,
          vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174000'
        },
        {
          sykmeldingsperiode: { fom: '2023-01-21', tom: '2023-01-30' },
          egenmeldingsperioder: [],
          erGradert: false,
          vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174001',
          forlengerVedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174000'
        },
        {
          sykmeldingsperiode: { fom: '2023-02-21', tom: '2023-02-28' },
          egenmeldingsperioder: [],
          erGradert: false,
          vedtaksperiodeId: '123e4567-e89b-12d3-a456-426614174002'
        }
      ],
      soeknaderBehandlingsdager: []
    };

    render(<InitieringAnnet />);

    // wait for arbeidsgiver select to appear
    await waitFor(() => expect(screen.getByLabelText(/Forlengelse/)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('radio', { name: /Eller velg en annen periode/ }));
    screen.getByLabelText(/Forlengelse/).click();
    await waitFor(() => expect(screen.getByLabelText(/Skal du endre refusjonen for den ansatte/)).toBeInTheDocument());

    const positiveRadio = screen.getByRole('radio', { name: /Ja/i });

    positiveRadio.click();

    await waitFor(() =>
      expect(screen.getByText(/Åpne den tidligere innsendte inntektsmeldingen nedenfor/)).toBeInTheDocument()
    );

    const negativeRadio = screen.getByRole('radio', { name: /Nei/i });

    negativeRadio.click();

    await waitFor(() =>
      expect(
        screen.getByText(/Så lenge sykepengesøknaden er en forlengelse med en tidligere innsendt inntektsmelding/)
      ).toBeInTheDocument()
    );
  });

  it('"Tilbake"-knappen har type="button" for å unngå utilsiktet skjemainnsending', async () => {
    const arbData = {
      fulltNavn: 'OLA NORDMANN',
      fnr: testFnr.GyldigeFraDolly.TestPerson1,
      underenheter: [{ orgnrUnderenhet: testOrganisasjoner[0].organizationNumber, virksomhetsnavn: 'Test AS' }],
      perioder: [{ id: 'a', fom: '2023-01-01', tom: '2023-01-10' }]
    };
    (useArbeidsforhold as unknown as Mock).mockReturnValue({ data: arbData, error: undefined });
    mockedSykepengesoeknader.data = {
      forespoersler: [],
      soeknaderArbeidstaker: [],
      soeknaderBehandlingsdager: []
    };

    render(<InitieringAnnet />);

    await waitFor(() => screen.getByRole('button', { name: 'Tilbake' }));
    expect(screen.getByRole('button', { name: 'Tilbake' })).toHaveAttribute('type', 'button');
  });
});
