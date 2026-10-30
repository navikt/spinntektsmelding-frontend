import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Kvittering from '../../pages/kvittering/[kvittid]';
import AgiKvittering from '../../pages/kvittering/agi/[kvittid]';
import environment from '../../config/environment';
import useBoundStore from '../../state/useBoundStore';

vi.mock('next/router', () => ({
  default: {},
  useRouter: () => ({ push: vi.fn(), asPath: '/test' })
}));

const initialState = useBoundStore.getState();
const kvittid = '550e8400-e29b-41d4-a716-446655440000';
const kvitteringProps = { kvittid, kvittering: null, dataFraBackend: false };
const periode = { fom: new Date(2024, 5, 1), tom: new Date(2024, 5, 30), id: '1' };

describe.each([
  ['vanlig kvittering', Kvittering],
  ['AGI-kvittering', AgiKvittering]
])('%s ved feil', (_, Component) => {
  beforeEach(() => {
    useBoundStore.setState(initialState, true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    useBoundStore.setState(initialState, true);
  });

  it('viser ikke feildialog ved vellykket lasting', () => {
    render(<Component {...kvitteringProps} kvitteringStatus={200} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useBoundStore.getState().skjemaFeilet).toBe(false);
  });

  it('viser feildialog og lagrer feilstatus ved 500 uten data i store', () => {
    render(<Component {...kvitteringProps} kvitteringStatus={500} />);

    expect(screen.getByRole('dialog', { name: 'Henting av kvitteringen feilet' })).toBeVisible();
    expect(screen.getByText('Noe gikk galt under henting av data.')).toBeVisible();
    expect(screen.getByText('Vennligst prøv igjen ved en senere anledning.')).toBeVisible();
    expect(useBoundStore.getState().skjemaFeilet).toBe(true);
  });

  it('viser feildialog ved 500 med data i store uten å lagre feilstatus', () => {
    useBoundStore.setState({ sykmeldingsperioder: [periode] });

    render(<Component {...kvitteringProps} kvitteringStatus={500} />);

    expect(screen.getByRole('dialog', { name: 'Henting av kvitteringen feilet' })).toBeVisible();
    expect(useBoundStore.getState().skjemaFeilet).toBe(false);
  });

  it('viser feildialog ved lagret skjemaFeilet selv om status er 200', () => {
    useBoundStore.setState({ skjemaFeilet: true });

    render(<Component {...kvitteringProps} kvitteringStatus={200} />);

    expect(screen.getByRole('dialog', { name: 'Henting av kvitteringen feilet' })).toBeVisible();
  });

  it('beholder lagret feilstatus når kvitteringStatus endres', () => {
    const { rerender } = render(<Component {...kvitteringProps} kvitteringStatus={500} />);

    rerender(<Component {...kvitteringProps} kvitteringStatus={200} />);

    expect(screen.getByRole('dialog', { name: 'Henting av kvitteringen feilet' })).toBeVisible();
    expect(useBoundStore.getState().skjemaFeilet).toBe(true);
  });

  it.each(['knapp', 'Escape'])('sender brukeren til saksoversikten ved lukking med %s', async (lukking) => {
    const user = userEvent.setup();
    const originalWindow = window;
    const location = { ...originalWindow.location, href: 'http://localhost/kvittering' };
    const mockWindow = Object.create(originalWindow);
    Object.defineProperty(mockWindow, 'location', { value: location });
    vi.stubGlobal('window', mockWindow);
    vi.spyOn(environment, 'saksoversiktUrl', 'get').mockReturnValue('https://mocked.nav.no');

    render(<Component {...kvitteringProps} kvitteringStatus={500} />);

    if (lukking === 'knapp') {
      const dialog = screen.getByRole('dialog', { name: 'Henting av kvitteringen feilet' });
      await user.click(within(dialog).getAllByRole('button', { name: 'Lukk' })[1]);
    } else {
      await user.keyboard('{Escape}');
    }

    expect(location.href).toBe('https://mocked.nav.no');
  });
});
