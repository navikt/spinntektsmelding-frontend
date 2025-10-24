import { screen, render, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import Bruttoinntekt from '../../../components/Bruttoinntekt/Bruttoinntekt';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import useBoundStore from '../../../state/useBoundStore';

// Mock Zustand store
vi.mock('../../../state/useBoundStore');

// Mock logEvent
vi.mock('../../../utils/logEvent', () => ({
  default: vi.fn(),
  logEvent: vi.fn()
}));

const mockBruttoinntekt = {
  bruttoInntekt: 45000,
  manueltKorrigert: false,
  endringAarsaker: []
};

const mockTidligereInntekt = new Map([
  ['2024-07', 44000],
  ['2024-08', 45000],
  ['2024-09', 46000]
]);

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      inntekt: {
        beloep: 45000,
        endringAarsaker: []
      }
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('Bruttoinntekt', () => {
  beforeEach(() => {
    vi.mocked(useBoundStore).mockImplementation((selector: any) =>
      selector({
        bruttoinntekt: mockBruttoinntekt,
        tidligereInntekt: mockTidligereInntekt,
        setBareNyMaanedsinntekt: vi.fn(),
        tilbakestillMaanedsinntekt: vi.fn(),
        visFeilmeldingTekst: false,
        nyInnsending: false,
        skjemastatus: 'MOTTATT',
        henterData: false
      })
    );
  });

  it('should have no violations', async () => {
    const { container } = render(
      <Wrapper>
        <Bruttoinntekt />
      </Wrapper>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should display the heading', () => {
    render(
      <Wrapper>
        <Bruttoinntekt />
      </Wrapper>
    );

    expect(screen.getByText('Beregnet månedslønn')).toBeInTheDocument();
  });

  it('should display previous income data when available', () => {
    render(
      <Wrapper>
        <Bruttoinntekt bestemmendeFravaersdag={new Date('2024-10-01')} />
      </Wrapper>
    );

    expect(screen.getByText(/44.*000/)).toBeInTheDocument();
    //expect(screen.getByText(/45.*000/)).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /45.*000/ })).toBeInTheDocument();
    expect(screen.getByText(/46.*000/)).toBeInTheDocument();
  });

  it('should show edit button when not in edit mode', () => {
    render(
      <Wrapper>
        <Bruttoinntekt />
      </Wrapper>
    );

    const button = screen.getByRole('button', { name: /Endre/i });
    expect(button).toBeInTheDocument();
  });

  it('should enter edit mode when clicking edit button', async () => {
    const user = userEvent.setup();

    render(
      <Wrapper>
        <Bruttoinntekt />
      </Wrapper>
    );

    const button = screen.getByRole('button', { name: /Endre/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Velg endringsårsak/i })).toBeInTheDocument();
    });
  });

  it('should show reset button in edit mode', async () => {
    const user = userEvent.setup();

    render(
      <Wrapper>
        <Bruttoinntekt />
      </Wrapper>
    );

    const editButton = screen.getByRole('button', { name: /Endre/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Tilbakestill/i })).toBeInTheDocument();
    });
  });

  it('should call tilbakestillMaanedsinntekt when reset button is clicked', async () => {
    const user = userEvent.setup();
    const tilbakestillMock = vi.fn();

    vi.mocked(useBoundStore).mockImplementation((selector: any) =>
      selector({
        bruttoinntekt: mockBruttoinntekt,
        tidligereInntekt: mockTidligereInntekt,
        setBareNyMaanedsinntekt: vi.fn(),
        tilbakestillMaanedsinntekt: tilbakestillMock,
        visFeilmeldingTekst: false,
        nyInnsending: false,
        skjemastatus: 'MOTTATT',
        henterData: false
      })
    );

    render(
      <Wrapper>
        <Bruttoinntekt />
      </Wrapper>
    );

    const editButton = screen.getByRole('button', { name: /Endre/i });
    await user.click(editButton);

    const resetButton = await screen.findByRole('button', { name: /Tilbakestill/i });
    await user.click(resetButton);

    expect(tilbakestillMock).toHaveBeenCalled();
  });

  it('should update store when sbBruttoinntekt changes', () => {
    const setBareNyMaanedsinntektMock = vi.fn();

    vi.mocked(useBoundStore).mockImplementation((selector: any) =>
      selector({
        bruttoinntekt: mockBruttoinntekt,
        tidligereInntekt: mockTidligereInntekt,
        setBareNyMaanedsinntekt: setBareNyMaanedsinntektMock,
        tilbakestillMaanedsinntekt: vi.fn(),
        visFeilmeldingTekst: false,
        nyInnsending: false,
        skjemastatus: 'MOTTATT',
        henterData: false
      })
    );

    const { rerender } = render(
      <Wrapper>
        <Bruttoinntekt sbBruttoinntekt={45000} />
      </Wrapper>
    );

    rerender(
      <Wrapper>
        <Bruttoinntekt sbBruttoinntekt={50000} />
      </Wrapper>
    );

    expect(setBareNyMaanedsinntektMock).toHaveBeenCalledWith(50000);
  });

  it('should show error message when feilHentingAvInntektsdata is true', () => {
    vi.mocked(useBoundStore).mockImplementation((selector: any) =>
      selector({
        bruttoinntekt: mockBruttoinntekt,
        tidligereInntekt: null,
        setBareNyMaanedsinntekt: vi.fn(),
        tilbakestillMaanedsinntekt: vi.fn(),
        visFeilmeldingTekst: false,
        nyInnsending: false,
        skjemastatus: 'MOTTATT',
        henterData: false
      })
    );

    render(
      <Wrapper>
        <Bruttoinntekt />
      </Wrapper>
    );

    expect(screen.getByText(/Vi har problemer med å hente inntektsopplysninger/)).toBeInTheDocument();
  });

  it('should use sbBruttoinntekt when erSelvbestemt is true', () => {
    render(
      <Wrapper>
        <Bruttoinntekt sbBruttoinntekt={50000} erSelvbestemt={true} />
      </Wrapper>
    );

    expect(screen.getByText(/50.*000/)).toBeInTheDocument();
  });

  it('should use sbTidligereInntekt when erSelvbestemt is true', () => {
    const sbTidligereInntekt = {
      '2024-07': 40000,
      '2024-08': 41000,
      '2024-09': 42000
    };

    render(
      <Wrapper>
        <Bruttoinntekt
          sbTidligereInntekt={sbTidligereInntekt}
          erSelvbestemt={true}
          bestemmendeFravaersdag={new Date('2024-10-01')}
        />
      </Wrapper>
    );

    expect(screen.getByText(/40.*000/)).toBeInTheDocument();
    expect(screen.getByText(/41.*000/)).toBeInTheDocument();
    expect(screen.getByText(/42.*000/)).toBeInTheDocument();
  });
});
