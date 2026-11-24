import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { warn } = vi.hoisted(() => ({ warn: vi.fn() }));
vi.mock('@navikt/next-logger', () => ({ logger: { warn } }));

describe('last selvbestemt-alternativene per fane', () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
    window.history.replaceState({}, '', '/im-dialog/initiering');
    warn.mockClear();
  });

  afterEach(() => vi.restoreAllMocks());

  it.each([true, false])('beholder %s ved flaggendring, tilbake-navigering og sidelasting', async (verdi) => {
    const snapshot = await import('../../utils/selvbestemtAlternativerSnapshot');
    expect(snapshot.hentLaasteSelvbestemtAlternativer(verdi)).toBe(verdi);
    expect(snapshot.hentLaasteSelvbestemtAlternativer(!verdi)).toBe(verdi);

    vi.resetModules();
    const afterReload = await import('../../utils/selvbestemtAlternativerSnapshot');
    expect(afterReload.hentLaasteSelvbestemtAlternativer(!verdi)).toBe(verdi);
  });

  it('tar i bruk oppdatert flagg etter fullfort innsending', async () => {
    const snapshot = await import('../../utils/selvbestemtAlternativerSnapshot');
    snapshot.hentLaasteSelvbestemtAlternativer(true);
    snapshot.nullstillSelvbestemtAlternativer();

    vi.resetModules();
    const nextFlow = await import('../../utils/selvbestemtAlternativerSnapshot');
    expect(nextFlow.hentLaasteSelvbestemtAlternativer(false)).toBe(false);
  });

  it('starter eksplisitt nytt forlop uten a starte pa nytt ved neste sidelasting', async () => {
    const snapshot = await import('../../utils/selvbestemtAlternativerSnapshot');
    snapshot.hentLaasteSelvbestemtAlternativer(true);
    expect(snapshot.hentLaasteSelvbestemtAlternativer(false, true)).toBe(false);
    expect(snapshot.hentLaasteSelvbestemtAlternativer(true, true)).toBe(false);

    vi.resetModules();
    const afterReload = await import('../../utils/selvbestemtAlternativerSnapshot');
    expect(afterReload.hentLaasteSelvbestemtAlternativer(true)).toBe(false);
  });

  it.each(['getItem', 'setItem'] as const)('deaktiverer nye valg dersom sessionStorage.%s feiler', async (method) => {
    vi.spyOn(Storage.prototype, method).mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    const snapshot = await import('../../utils/selvbestemtAlternativerSnapshot');

    expect(snapshot.hentLaasteSelvbestemtAlternativer(true)).toBe(false);
    expect(snapshot.hentLaasteSelvbestemtAlternativer(false)).toBe(false);
    expect(warn).toHaveBeenCalledTimes(1);

    vi.resetModules();
    const afterReload = await import('../../utils/selvbestemtAlternativerSnapshot');
    expect(afterReload.hentLaasteSelvbestemtAlternativer(true)).toBe(false);
  });

  it('logger ugyldig lagret verdi og erstatter den', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('invalid');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const snapshot = await import('../../utils/selvbestemtAlternativerSnapshot');

    expect(snapshot.hentLaasteSelvbestemtAlternativer(false)).toBe(false);
    expect(setItem).toHaveBeenCalledWith(expect.any(String), 'false');
    expect(warn).toHaveBeenCalled();
  });

  it('lar ikke feil ved nullstilling av sessionStorage stoppe innsendingen', async () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    const snapshot = await import('../../utils/selvbestemtAlternativerSnapshot');
    snapshot.hentLaasteSelvbestemtAlternativer(true);

    expect(() => snapshot.nullstillSelvbestemtAlternativer()).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });
});
