import { screen, render, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import Bruttoinntekt from '../../../components/Bruttoinntekt/Bruttoinntekt';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import useBoundStore from '../../../state/useBoundStore';
import useTidligereInntektsdata from '../../../utils/useTidligereInntektsdata';

// Mock Zustand store
vi.mock('../../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn()
}));

const mockedUseBoundStore = useBoundStore as unknown as ReturnType<typeof vi.fn>;

const createStoreState = (overrides: Partial<Record<string, unknown>> = {}) => ({
  bruttoinntekt: mockBruttoinntekt,
  tidligereInntekt: new Map(mockTidligereInntekt),
  setBareNyMaanedsinntekt: vi.fn(),
  tilbakestillMaanedsinntekt: vi.fn(),
  visFeilmeldingTekst: false,
  nyInnsending: false,
  skjemastatus: 'MOTTATT',
  henterData: false,
  sykmeldt: { fnr: '12345678901' },
  avsender: { orgnr: '987654321' },
  inngangFraKvittering: false,
  ...overrides
});

const setupUseBoundStoreMock = (overrides: Partial<Record<string, unknown>> = {}) => {
  const state = createStoreState(overrides);
  mockedUseBoundStore.mockImplementation((selector: any) => selector(state));
  return state;
};

// Mock logEvent
vi.mock('../../../utils/logEvent', () => ({
  default: vi.fn(),
  logEvent: vi.fn()
}));

vi.mock('../../../utils/useTidligereInntektsdata', () => ({
  __esModule: true,
  default: vi.fn()
}));

const mockedUseTidligereInntektsdata = vi.mocked(useTidligereInntektsdata);

const defaultTidligereInntektsdata = () => ({
  data: {},
  error: null,
  bruttoinntekt: {
    bruttoInntekt: 45000,
    manueltKorrigert: false,
    endringAarsaker: []
  },
  tidligereInntekt: new Map([
    ['2024-07', 44000],
    ['2024-08', 45000],
    ['2024-09', 46000]
  ])
});

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
    mockedUseBoundStore.mockReset();
    mockedUseTidligereInntektsdata.mockReset();
    setupUseBoundStoreMock();
    mockedUseTidligereInntektsdata.mockReturnValue(defaultTidligereInntektsdata());
  });

  it('should have no violations', async () => {
    const { container } = render(
      <Wrapper>
        <Bruttoinntekt forespoerselId='uuid' />
      </Wrapper>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should display the heading', () => {
    render(
      <Wrapper>
        <Bruttoinntekt forespoerselId='uuid' />
      </Wrapper>
    );

    expect(screen.getByText('Beregnet månedslønn')).toBeInTheDocument();
  });

  it('should display previous income data when available', () => {
    render(
      <Wrapper>
        <Bruttoinntekt forespoerselId='uuid' bestemmendeFravaersdag={new Date('2024-10-01')} />
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
        <Bruttoinntekt forespoerselId='uuid' />
      </Wrapper>
    );

    const button = screen.getByRole('button', { name: /Endre/i });
    expect(button).toBeInTheDocument();
  });

  it('should enter edit mode when clicking edit button', async () => {
    const user = userEvent.setup();

    render(
      <Wrapper>
        <Bruttoinntekt forespoerselId='uuid' />
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
        <Bruttoinntekt forespoerselId='uuid' />
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
    setupUseBoundStoreMock({ tilbakestillMaanedsinntekt: tilbakestillMock });

    render(
      <Wrapper>
        <Bruttoinntekt forespoerselId='uuid' bestemmendeFravaersdag={new Date(2024, 9, 11)} />
      </Wrapper>
    );

    const editButton = screen.getByRole('button', { name: /Endre/i });
    await user.click(editButton);

    const resetButton = await screen.findByRole('button', { name: /Tilbakestill/i });
    await user.click(resetButton);

    expect(tilbakestillMock).toHaveBeenCalled();
  });

  it('should show error message when feilHentingAvInntektsdata is true', () => {
    setupUseBoundStoreMock({ tidligereInntekt: null });

    render(
      <Wrapper>
        <Bruttoinntekt forespoerselId='uuid' bestemmendeFravaersdag={new Date(2024, 9, 11)} />
      </Wrapper>
    );

    expect(screen.getByText(/Vi har problemer med å hente inntektsopplysninger/)).toBeInTheDocument();
  });
});
