import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import Initiering, { getServerSideProps } from '../../../pages/initiering';
import { Mock, vi } from 'vitest';
import testFnr from '../../../mockdata/testFnr';
import useBoundStore from '../../../state/useBoundStore';
import VelgAarsak from '../../../components/VelgAarsak/VelgAarsak';
import { nullstillSelvbestemtAlternativer } from '../../../utils/selvbestemtAlternativerSnapshot';
import { hentNyeSelvbestemteAlternativer } from '../../../utils/unleash.server';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { renderToString } from 'react-dom/server';

global.window = Object.create(window);
Object.defineProperty(global.window, 'location', {
  value: {
    ...window.location,
    replace: vi.fn()
  },
  writable: true
});

vi.mock('next/navigation', () => ({ useRouter: vi.fn() }));
vi.mock('../../../utils/unleash.server', () => ({ hentNyeSelvbestemteAlternativer: vi.fn() }));
vi.mock('../../../components/VelgAarsak/VelgAarsak', { spy: true });
const setIdentitetsnummerMock = vi.fn();
const setAarsakMock = vi.fn();

vi.mock('../../../state/useBoundStore', () => ({
  __esModule: true,
  default: vi.fn(),
  useBoundStore: vi.fn()
}));

describe('Initiering Page', () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    nullstillSelvbestemtAlternativer();
    // mock next/router
    (useRouter as unknown as unknown as Mock).mockReturnValue({ push: pushMock, replace: vi.fn() });

    (useBoundStore as unknown as Mock).mockImplementation((stateFn) =>
      stateFn({
        __esModule: true,
        default: vi.fn(),
        setIdentitetsnummer: setIdentitetsnummerMock,
        setAarsakSelvbestemtInnsending: setAarsakMock
      })
    );
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    nullstillSelvbestemtAlternativer();
  });

  it('viser ikke midlertidige radiovalg for flaggverdien er last', () => {
    const html = renderToString(<Initiering nyeSelvbestemteAlternativer={false} />);

    expect(html).toContain('Forbereder skjemaet');
    expect(html).not.toContain('type="radio"');
  });

  it('beholder flaggverdien ved nye serverprops og tilbake-navigering', async () => {
    const page = render(<Initiering nyeSelvbestemteAlternativer={true} />);
    await screen.findByRole('radio', { name: 'Fisker med hyre' });
    page.rerender(<Initiering nyeSelvbestemteAlternativer={false} />);

    expect(vi.mocked(VelgAarsak).mock.calls.at(-1)?.[0].visNyeAlternativer).toBe(true);
    page.unmount();
    render(<Initiering nyeSelvbestemteAlternativer={false} />);
    await screen.findByRole('radio', { name: 'Fisker med hyre' });
    expect(vi.mocked(VelgAarsak).mock.calls.at(-1)?.[0].visNyeAlternativer).toBe(true);
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });

  it('henter flagget pa serveren og hindrer delt caching av sideprops', async () => {
    vi.mocked(hentNyeSelvbestemteAlternativer).mockResolvedValue(true);
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'GET' });

    const result = await getServerSideProps({
      req,
      res,
      query: { ny: 'true' },
      resolvedUrl: '/initiering?ny=true'
    });

    expect(result).toEqual({ props: { nyeSelvbestemteAlternativer: true, startNyInntektsmelding: true } });
    expect(res.getHeader('Cache-Control')).toBe('private, no-store');
  });

  it('fjerner ny-parameteren med Next-routeren etter eksplisitt start', async () => {
    render(<Initiering nyeSelvbestemteAlternativer={false} startNyInntektsmelding />);
    await screen.findByRole('radio', { name: 'Fisker med hyre' });

    expect(useRouter().replace).toHaveBeenCalledWith('/initiering', { scroll: false });
  });

  it('renders the page heading and form in a single main landmark', async () => {
    render(<Initiering nyeSelvbestemteAlternativer={false} />);

    const main = screen.getByRole('main');
    expect(main).toContainElement(
      screen.getByRole('heading', { level: 1, name: 'Opprett inntektsmelding for et sykefravær' })
    );
    expect(main).toContainElement(await screen.findByLabelText(/Ansattes fødselsnummer/i));
  });

  it('navigates to /initieringFiskere when årsakInnsending is Fiskere', async () => {
    render(<Initiering nyeSelvbestemteAlternativer={false} />);

    // select "Fiskere" radio
    const fiskereRadio = await screen.findByRole('radio', { name: /Fisker/i });
    await userEvent.click(fiskereRadio);

    // fill in valid fødselsnummer
    const fnrInput = screen.getByLabelText(/Ansattes fødselsnummer/i);
    await userEvent.type(fnrInput, testFnr.GyldigeFraDolly.TestPerson1);

    // submit form
    const nextButton = screen.getByRole('button', { name: /Neste/i });
    await userEvent.click(nextButton);

    // assertions
    expect(setAarsakMock).toHaveBeenCalledWith('Fisker');
    expect(setIdentitetsnummerMock).toHaveBeenCalledWith(testFnr.GyldigeFraDolly.TestPerson1);
    expect(pushMock).toHaveBeenCalledWith('/initieringFiskere', { scroll: false });
  });

  it('starter et nytt oyeblikksbilde uten a miste felter nar ny-parameteren fjernes', async () => {
    const page = render(<Initiering nyeSelvbestemteAlternativer={true} />);
    const fnrInput = await screen.findByLabelText(/Ansattes fødselsnummer/i);
    page.rerender(<Initiering nyeSelvbestemteAlternativer={false} startNyInntektsmelding />);
    expect(vi.mocked(VelgAarsak).mock.calls.at(-1)?.[0].visNyeAlternativer).toBe(false);
    await userEvent.type(fnrInput, testFnr.GyldigeFraDolly.TestPerson1);

    page.rerender(<Initiering nyeSelvbestemteAlternativer={true} />);

    expect(vi.mocked(VelgAarsak).mock.calls.at(-1)?.[0].visNyeAlternativer).toBe(false);
    expect(fnrInput).toHaveValue(testFnr.GyldigeFraDolly.TestPerson1);
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });
});
